/**
 * IDENTITAS MEREK UNTUK HALAMAN ANTARA (paket Bisnis)
 *
 * Paket Pro melompati halaman antara. Paket Bisnis boleh memilih: ikut
 * melompat, atau memakai lima detik itu sebagai kanal brandingnya sendiri.
 * Pilihan itulah yang disimpan di sini.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertFeature, getEntitlements, requireIdentity } from "./entitlements";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const getMyBrand = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const settings = await ctx.db
      .query("brand_settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const ent = await getEntitlements(ctx);

    return {
      settings,
      // UI perlu tahu bedanya "belum diatur" dan "tidak berhak mengatur",
      // supaya bisa menampilkan ajakan upgrade alih-alih formulir kosong.
      canCustomize: ent.plan === "business",
      plan: ent.plan,
    };
  },
});

export const saveBrand = mutation({
  args: {
    enabled: v.boolean(),
    displayName: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    tagline: v.optional(v.string()),
    ctaLabel: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertFeature(ctx, "whitelabel_interstitial");

    const displayName = args.displayName.trim();
    if (!displayName) throw new Error("Nama merek wajib diisi.");
    if (displayName.length > 60) {
      throw new Error("Nama merek maksimal 60 karakter.");
    }

    if (args.primaryColor && !HEX_COLOR.test(args.primaryColor)) {
      throw new Error("Warna harus berupa kode heksadesimal, contoh #0193ff.");
    }

    // URL gambar dan tujuan tombol dipasang di halaman yang dilihat publik,
    // jadi hanya https yang diterima — http membuat peringatan campuran, dan
    // skema lain seperti javascript: adalah jalan masuk skrip asing.
    for (const [label, url] of [
      ["Logo", args.logoUrl],
      ["Tombol", args.ctaUrl],
    ] as const) {
      if (!url) continue;
      let parsed: URL;
      try {
        parsed = new URL(url);
      } catch {
        throw new Error(`URL ${label} tidak valid.`);
      }
      if (parsed.protocol !== "https:") {
        throw new Error(`URL ${label} harus memakai https.`);
      }
    }

    const payload = {
      userId: identity.subject,
      enabled: args.enabled,
      displayName,
      logoUrl: args.logoUrl || undefined,
      primaryColor: args.primaryColor || undefined,
      tagline: args.tagline?.trim() || undefined,
      ctaLabel: args.ctaLabel?.trim() || undefined,
      ctaUrl: args.ctaUrl || undefined,
      updatedAt: Date.now(),
    };

    const existing = await ctx.db
      .query("brand_settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("brand_settings", payload);
  },
});
