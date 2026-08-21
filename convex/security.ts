/**
 * UMPAN & HALAMAN ADMIN KEAMANAN
 *
 * Pencatatnya sendiri ada di convex/securityLog.ts. Berkas ini berisi dua hal:
 * pintu-pintu umpan yang memang dipasang untuk dicoba, dan bacaan yang
 * dibutuhkan halaman admin untuk menindaklanjutinya.
 *
 * Yang TIDAK dilakukan di sini: membalas. Umpan hanya mencatat lalu menjawab
 * sewajarnya. Membalas serangan — memberi data palsu yang menyesatkan,
 * memperlambat sengaja, apalagi menyerang balik — memindahkan risikonya ke
 * pemilik aplikasi, dan satu positif palsu berarti pengguna sah yang kena.
 * Keputusan menghukum diserahkan ke admin lewat tombol blokir, bukan otomatis.
 */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { assertAdmin, getUserByClerkId } from "./entitlements";
import { EVENT_KINDS, recordSecurityEvent, type EventKind } from "./securityLog";

// ---------------------------------------------------------------------------
// UMPAN TINGKAT FUNGSI
// ---------------------------------------------------------------------------

/**
 * Fungsi-fungsi di bawah ini TIDAK MELAKUKAN APA PUN selain mencatat.
 *
 * Namanya sengaja dibuat persis seperti yang dicari orang saat membaca bundel
 * JavaScript aplikasi: "naikkan paket saya", "ubah peran", "tandai lunas".
 * Referensinya ditanam di app/_components/security/HoneypotBait.tsx supaya
 * benar-benar muncul di bundel — umpan yang tidak bisa ditemukan tidak pernah
 * dimakan siapa pun.
 *
 * Jawabannya sengaja terdengar seperti kegagalan biasa. Menjawab "Anda
 * ketahuan" hanya memberi tahu pelaku bahwa ada yang perlu dihindari lain kali.
 *
 * Perhatikan bahwa ketiganya MENGEMBALIKAN objek galat, bukan melempar. Itu
 * bukan pilihan gaya: mutation Convex adalah satu transaksi, dan handler yang
 * melempar akan membatalkan seluruh tulisan di dalamnya — termasuk catatan
 * jebakan yang baru saja dibuat. Umpan yang melempar galat adalah umpan yang
 * tidak pernah mencatat siapa pun. Lihat convex/securityLog.ts.
 */

/** Jawaban seragam untuk semua umpan: terlihat seperti galat server biasa. */
const UMPAN_RESPONS = {
  success: false,
  error: "Layanan sedang tidak tersedia. Coba lagi nanti.",
} as const;

export const upgradePlanSelfService = mutation({
  args: { plan: v.optional(v.string()), durationDays: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await recordSecurityEvent(ctx, {
      kind: "honeypot_function",
      target: "security.upgradePlanSelfService",
      detail: `plan=${args.plan ?? "-"}, durationDays=${args.durationDays ?? "-"}`,
    });
    return UMPAN_RESPONS;
  },
});

export const setUserRole = mutation({
  args: { clerkId: v.optional(v.string()), role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await recordSecurityEvent(ctx, {
      kind: "honeypot_function",
      target: "security.setUserRole",
      detail: `clerkId=${args.clerkId ?? "-"}, role=${args.role ?? "-"}`,
    });
    return UMPAN_RESPONS;
  },
});

export const markOrderPaid = mutation({
  args: { orderId: v.optional(v.string()), status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await recordSecurityEvent(ctx, {
      kind: "honeypot_function",
      target: "security.markOrderPaid",
      detail: `orderId=${args.orderId ?? "-"}, status=${args.status ?? "-"}`,
    });
    return UMPAN_RESPONS;
  },
});

// ---------------------------------------------------------------------------
// PENERIMA DARI JALUR HTTP
// ---------------------------------------------------------------------------

/**
 * Dipanggil endpoint HTTP di convex/http.ts, yang lebih dulu memeriksa rahasia
 * bersama. Internal supaya tidak ada yang bisa menyuntik kejadian palsu ke
 * dalam catatan keamanan langsung dari browser — log yang bisa dikarang siapa
 * saja tidak lagi bisa dipakai sebagai bukti apa pun.
 */
export const ingestFromEdge = internalMutation({
  args: {
    kind: v.string(),
    target: v.string(),
    severity: v.optional(v.string()),
    detail: v.optional(v.string()),
    method: v.optional(v.string()),
    ip: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    referer: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const kind = (args.kind in EVENT_KINDS ? args.kind : "honeypot_path") as EventKind;
    const severity =
      args.severity === "info" || args.severity === "suspicious" || args.severity === "malicious"
        ? args.severity
        : undefined;

    await recordSecurityEvent(ctx, { ...args, kind, severity });
  },
});

// ---------------------------------------------------------------------------
// BACAAN UNTUK HALAMAN ADMIN
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

export const summary = query({
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const now = Date.now();
    const rows = await ctx.db
      .query("security_events")
      .withIndex("by_lastTs", (q) => q.gte("lastTs", now - 30 * DAY_MS))
      .collect();

    const last24h = rows.filter((r) => r.lastTs >= now - DAY_MS);

    const byKind: Record<string, number> = {};
    for (const row of rows) {
      byKind[row.kind] = (byKind[row.kind] ?? 0) + row.hits;
    }

    return {
      totalEvents: rows.reduce((acc, r) => acc + r.hits, 0),
      events24h: last24h.reduce((acc, r) => acc + r.hits, 0),
      malicious24h: last24h
        .filter((r) => r.severity === "malicious")
        .reduce((acc, r) => acc + r.hits, 0),
      uniqueActors: new Set(rows.map((r) => r.actorKey)).size,
      unhandled: rows.filter((r) => !r.handledAt).length,
      // Berapa yang benar-benar bisa dinamai. Sisanya hanya berupa alamat IP,
      // dan angka ini yang memberi tahu admin seberapa jauh log ini menjawab
      // pertanyaan "siapa" alih-alih sekadar "dari mana".
      identified: new Set(rows.filter((r) => r.userId).map((r) => r.userId)).size,
      byKind,
    };
  },
});

export const listEvents = query({
  args: {
    severity: v.optional(v.string()),
    kind: v.optional(v.string()),
    onlyUnhandled: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const rows = await ctx.db
      .query("security_events")
      .withIndex("by_lastTs")
      .order("desc")
      .take(500);

    return rows
      .filter((r) => !args.severity || r.severity === args.severity)
      .filter((r) => !args.kind || r.kind === args.kind)
      .filter((r) => !args.onlyUnhandled || !r.handledAt)
      .slice(0, Math.min(args.limit ?? 200, 500))
      .map((r) => ({
        ...r,
        kindLabel: EVENT_KINDS[r.kind as EventKind] ?? r.kind,
      }));
  },
});

/**
 * Pelaku yang paling sering mengetuk, beserta status blokirnya.
 *
 * Dikelompokkan per actorKey, bukan per kejadian: yang ingin diketahui admin
 * adalah "siapa yang bermasalah", bukan "kejadian mana yang terbaru".
 */
export const topOffenders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);

    const now = Date.now();
    const rows = await ctx.db
      .query("security_events")
      .withIndex("by_lastTs", (q) => q.gte("lastTs", now - 30 * DAY_MS))
      .collect();

    type Offender = {
      actorKey: string;
      userId: string | null;
      email: string | null;
      name: string | null;
      plan: string | null;
      ip: string | null;
      country: string | null;
      city: string | null;
      hits: number;
      malicious: number;
      kinds: string[];
      lastTs: number;
      blocked: boolean;
      blockReason: string | null;
    };

    const map = new Map<string, Offender>();

    for (const row of rows) {
      const current = map.get(row.actorKey) ?? {
        actorKey: row.actorKey,
        userId: row.userId ?? null,
        email: row.email ?? null,
        name: row.name ?? null,
        plan: row.plan ?? null,
        ip: row.ip ?? null,
        country: row.country ?? null,
        city: row.city ?? null,
        hits: 0,
        malicious: 0,
        kinds: [],
        lastTs: 0,
        blocked: false,
        blockReason: null,
      };

      current.hits += row.hits;
      if (row.severity === "malicious") current.malicious += row.hits;
      if (!current.kinds.includes(row.kind)) current.kinds.push(row.kind);
      current.lastTs = Math.max(current.lastTs, row.lastTs);

      // Kolom identitas & lokasi diisi dari kejadian mana pun yang punya —
      // satu pelaku bisa terekam sekali lewat jalur HTTP (punya IP & kota) dan
      // berkali-kali lewat jalur fungsi (tidak punya keduanya).
      current.userId ??= row.userId ?? null;
      current.email ??= row.email ?? null;
      current.name ??= row.name ?? null;
      current.plan ??= row.plan ?? null;
      current.ip ??= row.ip ?? null;
      current.country ??= row.country ?? null;
      current.city ??= row.city ?? null;

      map.set(row.actorKey, current);
    }

    const offenders = Array.from(map.values());

    for (const offender of offenders) {
      if (!offender.userId) continue;
      const user = await getUserByClerkId(ctx, offender.userId);
      offender.blocked = !!user?.blockedAt;
      offender.blockReason = user?.blockReason ?? null;
      offender.email ??= user?.email ?? null;
      offender.name ??= user?.name ?? null;
    }

    return offenders
      .sort((a, b) => b.malicious - a.malicious || b.hits - a.hits)
      .slice(0, Math.min(args.limit ?? 20, 100));
  },
});

/** Angka untuk lencana di menu admin. */
export const countUnhandled = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await getUserByClerkId(ctx, identity.subject);
    if (user?.role !== "admin") return 0;

    const rows = await ctx.db
      .query("security_events")
      .withIndex("by_lastTs")
      .order("desc")
      .take(101);

    return rows.filter((r) => !r.handledAt).length;
  },
});

// ---------------------------------------------------------------------------
// TINDAKAN ADMIN
// ---------------------------------------------------------------------------

export const markHandled = mutation({
  args: { id: v.id("security_events"), handled: v.boolean() },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    await ctx.db.patch(args.id, {
      handledAt: args.handled ? Date.now() : undefined,
    });
  },
});

export const markAllHandled = mutation({
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const rows = await ctx.db
      .query("security_events")
      .withIndex("by_lastTs")
      .order("desc")
      .take(500);

    const now = Date.now();
    let closed = 0;
    for (const row of rows) {
      if (row.handledAt) continue;
      await ctx.db.patch(row._id, { handledAt: now });
      closed += 1;
    }

    return { closed };
  },
});

/**
 * Memblokir atau membuka blokir sebuah akun.
 *
 * Sengaja manual, tidak otomatis dari jumlah pelanggaran. Pemblokiran otomatis
 * berarti satu positif palsu — atau satu orang yang sekadar penasaran — langsung
 * kehilangan akses ke tautan yang mungkin sudah dicetak di materi cetaknya.
 * Biarkan manusia yang memutuskan; log ini sudah menyiapkan seluruh bahannya.
 */
export const setBlocked = mutation({
  args: {
    clerkId: v.string(),
    blocked: v.boolean(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await assertAdmin(ctx);

    const target = await getUserByClerkId(ctx, args.clerkId);
    if (!target) throw new Error("Akun tidak ditemukan.");

    // Admin tidak bisa memblokir sesama admin lewat halaman ini: kalau sebuah
    // akun admin memang harus dicabut, yang benar adalah menurunkan perannya
    // lebih dulu — bukan mengunci pintu sambil kuncinya masih di dalam.
    if (target.role === "admin" && args.blocked) {
      throw new Error("Akun admin tidak bisa diblokir dari halaman ini.");
    }
    if (actor && target.clerkId === actor) {
      throw new Error("Anda tidak bisa memblokir akun Anda sendiri.");
    }

    await ctx.db.patch(target._id, {
      blockedAt: args.blocked ? Date.now() : undefined,
      blockReason: args.blocked ? args.reason?.slice(0, 300) : undefined,
    });

    return { blocked: args.blocked };
  },
});

// ---------------------------------------------------------------------------
// PEMELIHARAAN
// ---------------------------------------------------------------------------

/**
 * Membuang catatan yang sudah lewat masa simpan.
 *
 * Catatan keamanan memuat alamat IP dan identitas orang, jadi menyimpannya
 * selamanya bukan kehati-hatian melainkan penimbunan: yang berguna untuk
 * menindak sebuah insiden adalah beberapa bulan terakhir, bukan tiga tahun lalu.
 */
export const purgeOldEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 90 * DAY_MS;

    const stale = await ctx.db
      .query("security_events")
      .withIndex("by_lastTs", (q) => q.lt("lastTs", cutoff))
      .take(2000);

    for (const row of stale) {
      await ctx.db.delete(row._id);
    }

    return { deleted: stale.length };
  },
});
