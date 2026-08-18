/**
 * ANTI-PENYALAHGUNAAN
 *
 * Kenapa ini prasyarat sebelum subdomain dibuka: begitu pengguna bisa membuat
 * tautan di bawah nama domain Anda dalam jumlah besar, reputasi domain itu jadi
 * milik bersama. Satu kampanye phishing yang sukses bisa membuat singkat.in
 * masuk daftar hitam Google Safe Browsing — dan saat itu terjadi, SELURUH
 * tautan setiap pengguna ikut mati, bukan hanya tautan pelakunya.
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { getEntitlements, assertAdmin } from "./entitlements";
import type { PlanId } from "./plans";

// ---------------------------------------------------------------------------
// 1. VALIDASI URL (tanpa panggilan keluar, jalan di dalam mutation)
// ---------------------------------------------------------------------------

/** Skema yang tidak pernah masuk akal untuk tautan pendek publik. */
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Nama host yang menunjuk balik ke jaringan internal.
 *
 * Tautan pendek ke alamat ini tidak berguna bagi pengunjung mana pun, tapi
 * sangat berguna untuk menyamarkan permintaan ke jaringan lokal — jadi ditolak.
 * 169.254.169.254 khususnya adalah endpoint metadata di hampir semua penyedia
 * cloud, dan tautan ke sana hanya punya satu tujuan.
 *
 * Ditulis sebagai daftar awalan, bukan satu regex berjangkar: versi berjangkar
 * sebelumnya diam-diam meloloskan 192.168.1.1 karena "192.168." dipaksa
 * mencocokkan seluruh nama host, bukan permulaannya.
 */
const PRIVATE_EXACT = new Set(["localhost", "::1", "[::1]", "0.0.0.0"]);

const PRIVATE_PREFIXES = [
  "127.",
  "10.",
  "192.168.",
  "169.254.", // link-local, termasuk metadata cloud
  "0.",
  "fc", // IPv6 unique-local (fc00::/7)
  "fd",
  "fe80", // IPv6 link-local
];

function isPrivateHost(host: string): boolean {
  if (PRIVATE_EXACT.has(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (PRIVATE_PREFIXES.some((prefix) => host.startsWith(prefix))) return true;

  // 172.16.0.0 – 172.31.255.255
  const match = host.match(/^172\.(\d{1,3})\./);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }

  return false;
}

/** Domain milik platform sendiri: memendekkan tautan ke diri sendiri = putaran. */
const OWN_HOSTS = ["singkat.in", "www.singkat.in", "app.singkat.in"];

export type UrlVerdict =
  | { ok: true; normalized: string; host: string }
  | { ok: false; reason: string };

export function inspectUrl(raw: string): UrlVerdict {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "URL tidak boleh kosong." };

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return {
      ok: false,
      reason: "URL tidak valid. Sertakan http:// atau https:// di depannya.",
    };
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    // javascript: dan data: adalah jalan masuk skrip; file: menunjuk ke berkas
    // di komputer pengunjung.
    return {
      ok: false,
      reason: "Hanya tautan http:// dan https:// yang bisa dipendekkan.",
    };
  }

  const host = url.hostname.toLowerCase();

  if (isPrivateHost(host)) {
    return { ok: false, reason: "Alamat jaringan lokal tidak bisa dipendekkan." };
  }

  if (OWN_HOSTS.includes(host)) {
    return {
      ok: false,
      reason: "Tautan ini menunjuk kembali ke singkat.in dan akan membuat putaran tanpa ujung.",
    };
  }

  return { ok: true, normalized: url.toString(), host };
}

// ---------------------------------------------------------------------------
// 2. BATAS LAJU
// ---------------------------------------------------------------------------

const HOUR_MS = 60 * 60 * 1000;

/**
 * Berapa tautan boleh dibuat per jam.
 *
 * Angkanya jauh di atas pemakaian manusia normal — tujuannya menahan skrip
 * yang menyemprot ribuan tautan, bukan mengganggu pengguna yang sedang sibuk.
 */
const LINKS_PER_HOUR: Record<PlanId, number> = {
  free: 30,
  pro: 300,
  business: 1000,
};

export async function assertRateLimit(
  ctx: MutationCtx,
  action: string,
  userId: string,
  plan: PlanId
): Promise<void> {
  const limit = action === "create_link" ? LINKS_PER_HOUR[plan] : 100;
  const key = `${action}:${userId}`;
  const now = Date.now();

  const existing = await ctx.db
    .query("rate_limits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  // Jendela tetap, bukan geser: lebih longgar di perbatasan jendela, tapi hanya
  // butuh satu baris per pengguna alih-alih menyimpan stempel waktu tiap aksi.
  if (!existing || now - existing.windowStart >= HOUR_MS) {
    if (existing) {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    } else {
      await ctx.db.insert("rate_limits", { key, windowStart: now, count: 1 });
    }
    return;
  }

  if (existing.count >= limit) {
    const menit = Math.ceil((existing.windowStart + HOUR_MS - now) / 60000);
    throw new Error(
      `Terlalu banyak tautan dibuat dalam satu jam (batas ${limit}). Coba lagi dalam ${menit} menit.`
    );
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

// ---------------------------------------------------------------------------
// 3. STATUS TAUTAN
// ---------------------------------------------------------------------------

export function linkStatusOf(link: { status?: string }): string {
  return link.status ?? "active";
}

/** Dipanggil aksi Safe Browsing setelah pemeriksaan selesai. */
export const applyThreatVerdict = internalMutation({
  args: {
    linkId: v.id("links"),
    verdict: v.string(), // "active" | "flagged" | "blocked"
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.linkId);
    if (!link) return;

    await ctx.db.patch(args.linkId, {
      status: args.verdict,
      flagReason: args.reason,
      checkedAt: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// 4. LAPORAN DARI PENGUNJUNG
// ---------------------------------------------------------------------------

const REPORT_REASONS = ["phishing", "malware", "spam", "konten", "lainnya"];

export const reportLink = mutation({
  args: {
    shortCode: v.string(),
    reason: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!REPORT_REASONS.includes(args.reason)) {
      throw new Error("Alasan laporan tidak dikenal.");
    }

    const link = await ctx.db
      .query("links")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .first();

    if (!link) throw new Error("Tautan tidak ditemukan.");

    // Satu pelapor bisa saja mengirim berkali-kali; yang dibatasi di sini adalah
    // penumpukan laporan terbuka untuk satu tautan, supaya antrean tinjauan
    // admin tidak bisa dibanjiri oleh satu orang.
    const open = await ctx.db
      .query("link_reports")
      .withIndex("by_linkId", (q) => q.eq("linkId", link._id))
      .collect();

    if (open.filter((r) => r.status === "open").length >= 20) {
      return { ok: true, alreadyQueued: true };
    }

    await ctx.db.insert("link_reports", {
      linkId: link._id,
      shortCode: args.shortCode,
      reason: args.reason,
      note: args.note?.slice(0, 500),
      status: "open",
      createdAt: Date.now(),
    });

    return { ok: true, alreadyQueued: false };
  },
});

// ---------------------------------------------------------------------------
// 5. TINJAUAN ADMIN
// ---------------------------------------------------------------------------

export const listReports = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const status = args.status ?? "open";
    const reports = await ctx.db
      .query("link_reports")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .take(100);

    return await Promise.all(
      reports.map(async (report) => {
        const link = await ctx.db.get(report.linkId);
        return {
          ...report,
          originalUrl: link?.originalUrl ?? null,
          linkStatus: link ? linkStatusOf(link) : null,
          ownerId: link?.userId ?? null,
        };
      })
    );
  },
});

export const listFlaggedLinks = query({
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const flagged = await ctx.db
      .query("links")
      .withIndex("by_status", (q) => q.eq("status", "flagged"))
      .take(100);

    const blocked = await ctx.db
      .query("links")
      .withIndex("by_status", (q) => q.eq("status", "blocked"))
      .take(100);

    return [...flagged, ...blocked];
  },
});

export const setLinkStatus = mutation({
  args: {
    linkId: v.id("links"),
    status: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    if (!["active", "flagged", "blocked"].includes(args.status)) {
      throw new Error("Status tidak dikenal.");
    }

    await ctx.db.patch(args.linkId, {
      status: args.status,
      flagReason: args.reason,
    });

    // Laporan yang menyangkut tautan ini ikut ditutup — kalau tidak, antrean
    // admin akan terus menampilkan perkara yang sudah diputuskan.
    const reports = await ctx.db
      .query("link_reports")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.linkId))
      .collect();

    for (const report of reports) {
      if (report.status === "open") {
        await ctx.db.patch(report._id, {
          status: args.status === "active" ? "dismissed" : "reviewed",
          reviewedAt: Date.now(),
        });
      }
    }
  },
});

/** Jumlah perkara terbuka, untuk lencana di menu admin. */
export const countOpenReports = query({
  handler: async (ctx: QueryCtx) => {
    const ent = await getEntitlements(ctx).catch(() => null);
    if (!ent?.isAdmin) return 0;

    const open = await ctx.db
      .query("link_reports")
      .withIndex("by_status", (q) => q.eq("status", "open"))
      .take(101);

    return open.length;
  },
});
