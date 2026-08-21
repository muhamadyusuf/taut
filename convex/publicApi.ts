/**
 * API PUBLIK v1
 *
 * Dipanggil dari luar dengan kunci API, bukan sesi login. Karena itu setiap
 * fungsi di sini menerima userId sebagai argumen biasa — identitasnya sudah
 * dipastikan lebih dulu oleh lapisan HTTP di convex/http.ts, dan fungsi-fungsi
 * ini internal sehingga tidak bisa dipanggil langsung dari browser siapa pun.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";
import { getEntitlementsForUser } from "./entitlements";
import { planHasFeature } from "./plans";
import { assertRateLimit, inspectUrl } from "./abuse";
import { normalizeSlug } from "./links";

export const listLinksForApi = internalQuery({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // Diperiksa di sini, bukan hanya saat kunci dibuat: kunci yang terlanjur
    // ada di tangan sistem pelanggan tidak boleh tetap membaca data setelah
    // langganannya berakhir.
    const owner = await getEntitlementsForUser(ctx, args.userId);
    if (!planHasFeature(owner.plan, "api_access")) return null;

    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(Math.min(args.limit ?? 50, 200));

    return links.map((link) => ({
      id: link._id,
      short_code: link.shortCode,
      namespace: link.subdomain ?? null,
      original_url: link.originalUrl,
      title: link.title ?? null,
      clicks: link.clicks,
      status: link.status ?? "active",
      created_at: new Date(link.createdAt).toISOString(),
    }));
  },
});

export const createLinkForApi = internalMutation({
  args: {
    userId: v.string(),
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ent = await getEntitlementsForUser(ctx, args.userId);
    if (!planHasFeature(ent.plan, "api_access")) {
      return { error: "Paket Anda tidak mencakup akses API." };
    }

    // Batas laju yang sama dengan pembuatan lewat dasbor. Kunci API justru
    // jalur yang paling mudah dipakai skrip, jadi melewatkannya di sini berarti
    // pembatas di createLink hanya menahan orang yang memakai tombol.
    try {
      await assertRateLimit(ctx, "create_link", args.userId, ent.plan);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Terlalu banyak permintaan." };
    }

    const verdict = inspectUrl(args.originalUrl);
    if (!verdict.ok) return { error: verdict.reason };

    let shortCode = "";

    // Slug lewat API melewati validasi yang sama dengan slug lewat dasbor:
    // daftar kata cadangan dan bentuk karakter yang sah. Tanpa ini, API bisa
    // mendaftarkan "dashboard" atau kode berisi garis miring yang tersimpan
    // rapi di basis data tapi tidak pernah bisa dibuka.
    if (args.customSlug && args.customSlug.trim() !== "") {
      try {
        shortCode = normalizeSlug(args.customSlug);
      } catch (error) {
        return { error: error instanceof Error ? error.message : "Kode pendek tidak valid." };
      }
    }

    const taken = async (code: string) =>
      await ctx.db
        .query("links")
        .withIndex("by_subdomain_shortCode", (q) =>
          q.eq("subdomain", undefined).eq("shortCode", code)
        )
        .first();

    if (shortCode) {
      if (await taken(shortCode)) return { error: "Kode pendek sudah dipakai." };
    } else {
      let attempt = 0;
      do {
        shortCode = Math.random().toString(36).substring(2, 7);
        attempt += 1;
        if (attempt > 20) return { error: "Gagal membuat kode unik." };
      } while (await taken(shortCode));
    }

    const linkId = await ctx.db.insert("links", {
      originalUrl: verdict.normalized,
      shortCode,
      userId: args.userId,
      clicks: 0,
      title: args.title || "Untitled Link",
      createdAt: Date.now(),
      status: "active",
    });

    return {
      data: {
        id: linkId,
        short_code: shortCode,
        original_url: verdict.normalized,
        title: args.title || "Untitled Link",
      },
    };
  },
});
