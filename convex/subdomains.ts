/**
 * SUBDOMAIN PENYEWA: <nama>.singkat.in
 *
 * Kenapa daftar cadangannya jauh lebih ketat daripada daftar slug: slug yang
 * menyesatkan hanya merugikan satu tautan, tapi subdomain tampil sebagai
 * bagian dari nama domain Anda. "bca.singkat.in" terbaca oleh korban sebagai
 * milik bank yang bersangkutan, dan kerugian reputasinya menempel pada
 * singkat.in — bukan pada pembuatnya.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  assertFeature,
  assertWithinLimit,
  getEntitlements,
  requireIdentity,
} from "./entitlements";

/** Panjang minimum menghalangi pengambilan nama pendek yang bernilai tinggi. */
const MIN_LENGTH = 3;
const MAX_LENGTH = 32;

/** Nama yang dipakai infrastruktur, atau yang akan membingungkan bila diambil orang. */
const RESERVED_SUBDOMAINS = new Set([
  // Infrastruktur & milik platform
  "app", "www", "api", "admin", "dashboard", "cdn", "static", "assets",
  "mail", "smtp", "imap", "pop", "webmail", "email", "mx",
  "ns", "ns1", "ns2", "dns", "ftp", "ssh", "vpn", "proxy",
  "dev", "staging", "test", "demo", "beta", "alpha", "sandbox",
  "status", "health", "monitor", "metrics", "log", "logs",
  "blog", "docs", "help", "support", "kb", "wiki", "forum",
  "shop", "store", "pay", "billing", "invoice", "checkout",
  "auth", "login", "signin", "signup", "account", "accounts",
  "clerk", "convex", "vercel", "cpanel", "webdisk", "autodiscover",

  // Kata yang menyiratkan kewenangan resmi
  "official", "resmi", "verify", "verifikasi", "secure", "security",
  "keamanan", "update", "konfirmasi", "confirm", "validasi",

  // Sektor yang paling sering ditiru penipu
  "bank", "bca", "bri", "bni", "mandiri", "btn", "cimb", "permata",
  "danamon", "ocbc", "panin", "maybank", "bsi", "muamalat",
  "gopay", "ovo", "dana", "linkaja", "shopeepay", "flip", "jenius",
  "tokopedia", "shopee", "bukalapak", "lazada", "blibli", "tiktok",
  "gojek", "grab", "traveloka", "tiket", "pegipegi",
  "telkom", "telkomsel", "indosat", "xl", "smartfren", "byu",
  "pln", "bpjs", "pajak", "djp", "kemenkeu", "polri", "kominfo",
  "google", "facebook", "instagram", "whatsapp", "meta", "apple",
  "microsoft", "paypal", "netflix", "spotify", "steam",
]);

const VALID_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type SubdomainVerdict =
  | { ok: true; value: string }
  | { ok: false; reason: string };

export function inspectSubdomain(raw: string): SubdomainVerdict {
  const value = raw.trim().toLowerCase();

  if (value.length < MIN_LENGTH) {
    return { ok: false, reason: `Subdomain minimal ${MIN_LENGTH} karakter.` };
  }
  if (value.length > MAX_LENGTH) {
    return { ok: false, reason: `Subdomain maksimal ${MAX_LENGTH} karakter.` };
  }
  if (!VALID_PATTERN.test(value)) {
    return {
      ok: false,
      reason: "Hanya huruf kecil, angka, dan tanda hubung. Tidak boleh diawali atau diakhiri tanda hubung.",
    };
  }
  if (value.includes("--")) {
    // "xn--" adalah awalan punycode; mengizinkannya membuka penyamaran nama
    // domain memakai aksara yang mirip huruf latin.
    return { ok: false, reason: "Tanda hubung ganda tidak diperbolehkan." };
  }
  if (RESERVED_SUBDOMAINS.has(value)) {
    return { ok: false, reason: "Nama ini dicadangkan dan tidak bisa dipakai." };
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
      .query("subdomains")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    return {
      subdomains: owned,
      plan: ent.plan,
      limit: ent.limits.subdomains,
      canClaim: ent.limits.subdomains > 0,
    };
  },
});

/** Cek ketersediaan untuk umpan balik langsung di formulir. */
export const checkAvailability = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const verdict = inspectSubdomain(args.subdomain);
    if (!verdict.ok) return { available: false, reason: verdict.reason };

    const taken = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", verdict.value))
      .first();

    return taken
      ? { available: false, reason: "Subdomain ini sudah dipakai." }
      : { available: true, reason: null };
  },
});

/** Dipakai halaman penyewa untuk mengetahui siapa pemilik sebuah subdomain. */
export const getOwner = query({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", args.subdomain.toLowerCase()))
      .first();

    if (!row) return null;

    const microsite = await ctx.db
      .query("microsites")
      .withIndex("by_userId", (q) => q.eq("userId", row.userId))
      .first();

    return {
      userId: row.userId,
      subdomain: row.subdomain,
      micrositeSlug: microsite?.slug ?? null,
    };
  },
});

// ---------------------------------------------------------------------------
// MUTATION
// ---------------------------------------------------------------------------

export const claim = mutation({
  args: { subdomain: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertFeature(ctx, "subdomain");

    const verdict = inspectSubdomain(args.subdomain);
    if (!verdict.ok) throw new Error(verdict.reason);

    const owned = await ctx.db
      .query("subdomains")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    await assertWithinLimit(ctx, "subdomains", owned.length);

    const taken = await ctx.db
      .query("subdomains")
      .withIndex("by_subdomain", (q) => q.eq("subdomain", verdict.value))
      .first();

    if (taken) throw new Error("Subdomain ini sudah dipakai.");

    return await ctx.db.insert("subdomains", {
      userId: identity.subject,
      subdomain: verdict.value,
      createdAt: Date.now(),
    });
  },
});

export const release = mutation({
  args: { id: v.id("subdomains") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== identity.subject) {
      throw new Error("Subdomain tidak ditemukan atau bukan milik Anda.");
    }

    // Tautan yang hidup di subdomain ini dikembalikan ke domain utama, bukan
    // ikut dihapus. Melepas subdomain tidak boleh diam-diam mematikan tautan
    // yang mungkin sudah dicetak di materi promosi.
    const affected = await ctx.db
      .query("links")
      .withIndex("by_subdomain_shortCode", (q) => q.eq("subdomain", row.subdomain))
      .collect();

    for (const link of affected) {
      // Kode pendeknya bisa saja sudah dipakai orang lain di domain utama.
      // Dalam kasus itu tautan diberi kode baru agar tidak menimpa siapa pun.
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

    return { movedLinks: affected.length };
  },
});
