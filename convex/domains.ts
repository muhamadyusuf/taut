/**
 * DOMAIN MILIK PENGGUNA SENDIRI (paket Bisnis)
 *
 * Bedanya dengan subdomain: di sini nama domainnya milik pengguna, jadi
 * kepemilikan tidak bisa kita berikan begitu saja — harus dibuktikan lewat
 * DNS. Kebenaran status ada di Vercel, bukan di tabel ini; kolom `status`
 * hanyalah cerminan terakhir yang kita ketahui.
 */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  assertFeature,
  assertWithinLimit,
  getEntitlements,
  getEntitlementsForUser,
  requireIdentity,
} from "./entitlements";
import { planHasFeature } from "./plans";

/** Domain yang tidak boleh didaftarkan siapa pun sebagai "miliknya". */
const BLOCKED_DOMAINS = new Set([
  "singkat.in",
  "www.singkat.in",
  "app.singkat.in",
  "localhost",
  "vercel.app",
  "vercel.com",
]);

const DOMAIN_PATTERN =
  /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export type DomainVerdict =
  | { ok: true; value: string }
  | { ok: false; reason: string };

export function inspectDomain(raw: string): DomainVerdict {
  let value = raw.trim().toLowerCase();

  // Pengguna hampir selalu menempelkan alamat lengkap. Menolaknya mentah-mentah
  // hanya membuat mereka menebak-nebak format yang kita mau.
  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.$/, "");

  if (!value) return { ok: false, reason: "Domain tidak boleh kosong." };
  if (value.length > 253) return { ok: false, reason: "Domain terlalu panjang." };

  if (!DOMAIN_PATTERN.test(value)) {
    return {
      ok: false,
      reason: "Format domain tidak valid. Contoh yang benar: link.brandanda.com",
    };
  }

  if (BLOCKED_DOMAINS.has(value) || value.endsWith(".singkat.in")) {
    return {
      ok: false,
      reason: "Domain ini milik platform. Untuk alamat di bawah singkat.in, gunakan menu Subdomain.",
    };
  }

  return { ok: true, value };
}

// ---------------------------------------------------------------------------
// QUERY
// ---------------------------------------------------------------------------

export const getMine = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const ent = await getEntitlements(ctx);
    const owned = await ctx.db
      .query("domains")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      domains: owned,
      plan: ent.plan,
      limit: ent.limits.customDomains,
      canAdd: ent.limits.customDomains > 0,
    };
  },
});

/**
 * Dipakai halaman penyewa untuk mengetahui apakah sebuah host dikenal.
 * Terbuka untuk publik: pengunjung yang membuka domain itu tidak login.
 */
export const getActiveByHost = query({
  args: { host: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("domains")
      .withIndex("by_domain", (q) => q.eq("domain", args.host.toLowerCase()))
      .first();

    if (!row || row.status !== "active") return null;

    // Domain sendiri adalah fitur berbayar, jadi ia berhenti melayani begitu
    // paket pemiliknya berakhir. Barisnya sengaja tidak dihapus: kalau mereka
    // berlangganan lagi, alamatnya hidup kembali tanpa perlu menyiapkan DNS
    // dari awal.
    const owner = await getEntitlementsForUser(ctx, row.userId);
    if (!planHasFeature(owner.plan, "custom_domain")) return null;

    return { userId: row.userId, domain: row.domain };
  },
});

// ---------------------------------------------------------------------------
// MUTATION
// ---------------------------------------------------------------------------

/** Dipakai action Vercel untuk mencatat hasil pendaftaran & pemeriksaan. */
export const upsertStatus = internalMutation({
  args: {
    domainId: v.id("domains"),
    status: v.string(),
    note: v.optional(v.string()),
    verification: v.optional(
      v.array(
        v.object({
          type: v.string(),
          domain: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.domainId);
    if (!existing) return;

    await ctx.db.patch(args.domainId, {
      status: args.status,
      note: args.note,
      verification: args.verification,
      lastCheckedAt: Date.now(),
      ...(args.status === "active" && !existing.verifiedAt
        ? { verifiedAt: Date.now() }
        : {}),
    });
  },
});

export const createPending = mutation({
  args: { domain: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertFeature(ctx, "custom_domain");

    const verdict = inspectDomain(args.domain);
    if (!verdict.ok) throw new Error(verdict.reason);

    const owned = await ctx.db
      .query("domains")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    await assertWithinLimit(ctx, "customDomains", owned.length);

    // Satu domain hanya boleh dimiliki satu akun. Tanpa penjaga ini, akun kedua
    // bisa mendaftarkan domain yang sudah aktif milik orang lain dan membajak
    // ke mana tautannya mengarah.
    const taken = await ctx.db
      .query("domains")
      .withIndex("by_domain", (q) => q.eq("domain", verdict.value))
      .first();

    if (taken) {
      throw new Error(
        taken.userId === identity.subject
          ? "Domain ini sudah ada di daftar Anda."
          : "Domain ini sudah terdaftar di akun lain."
      );
    }

    return await ctx.db.insert("domains", {
      userId: identity.subject,
      domain: verdict.value,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("domains") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== identity.subject) {
      throw new Error("Domain tidak ditemukan atau bukan milik Anda.");
    }

    // Sama seperti melepas subdomain: tautannya dikembalikan ke domain utama,
    // tidak dihapus. Alamat lamanya berhenti bekerja, tapi tautannya hidup.
    const affected = await ctx.db
      .query("links")
      .withIndex("by_subdomain_shortCode", (q) => q.eq("subdomain", row.domain))
      .collect();

    for (const link of affected) {
      const clash = await ctx.db
        .query("links")
        .withIndex("by_subdomain_shortCode", (q) =>
          q.eq("subdomain", undefined).eq("shortCode", link.shortCode)
        )
        .first();

      await ctx.db.patch(link._id, {
        subdomain: undefined,
        ...(clash
          ? { shortCode: `${link.shortCode}-${Math.random().toString(36).slice(2, 6)}` }
          : {}),
      });
    }

    await ctx.db.delete(args.id);
    return { movedLinks: affected.length, domain: row.domain };
  },
});

/** Dibaca action sebelum memanggil Vercel. */
export const getForAction = query({
  args: { id: v.id("domains") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== identity.subject) return null;
    return { domain: row.domain, status: row.status };
  },
});
