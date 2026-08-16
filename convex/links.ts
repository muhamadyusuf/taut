import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getEntitlementsForUser } from "./entitlements";
import { planHasFeature } from "./plans";

/**
 * Slug yang tidak boleh dipakai sebagai tautan pendek.
 *
 * Bukan sekadar soal rapi: shortcode hidup di route paling atas (/[shortCode]),
 * jadi slug yang bertabrakan dengan route statis Next.js akan kalah dan tautan
 * itu tersimpan di database tapi tidak pernah bisa dibuka. Sebelum daftar ini
 * dirapikan, "bio", "s", "f", dan "blog" masih bisa didaftarkan orang.
 *
 * Hanya berisi segmen pertama URL — pengecekannya memang membandingkan satu
 * segmen, sehingga entri seperti "dashboard/links" dulu tidak pernah cocok
 * dengan apa pun.
 */
const RESERVED_SLUGS = new Set([
  // Route aplikasi
  "dashboard",
  "admin",
  "app",
  "api",
  "bio",
  "s",
  "f",
  "blog",
  "pricing",
  "harga",

  // Autentikasi
  "sign-in",
  "sign-up",
  "signin",
  "signup",
  "login",
  "logout",
  "register",

  // Halaman statis
  "about",
  "contact",
  "terms",
  "privacy",
  "kebijakan",
  "syarat",
  "legal",
  "help",
  "support",
  "status",
  "docs",

  // Berkas & konvensi yang dilayani di akar domain
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "apple-touch-icon.jpg",
  "static",
  "public",
  "_next",
  "404",
  "500",

  // Cadangan untuk fitur yang sudah direncanakan
  "billing",
  "settings",
  "go",
  "qr",
  "v", // verifikasi sertifikat publik
]);

function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}

export const createLink = mutation({
  args: { 
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    title: v.optional(v.string()),
    // ARGS BARU: Menerima array ID kategori
    categoryIds: v.optional(v.array(v.id("categories"))) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let shortCode: string;

    // 2. CEK APAKAH SLUG MASUK DAFTAR TERLARANG
    if (args.customSlug && isReservedSlug(args.customSlug)) {
        throw new Error("Nama link ini tidak boleh digunakan (Reserved Word).");
    }

    // ... (Logic generate shortCode sama seperti sebelumnya) ...
    if (args.customSlug && args.customSlug.trim() !== "") {
      shortCode = args.customSlug.trim();
      const existing = await ctx.db.query("links").withIndex("by_shortCode", (q) => q.eq("shortCode", shortCode)).first();
      if (existing) throw new Error("Link custom ini sudah dipakai orang lain.");
    } else {
      shortCode = Math.random().toString(36).substring(2, 7);
    }

    // 1. Simpan Link Utama
    const linkId = await ctx.db.insert("links", {
      originalUrl: args.originalUrl,
      shortCode: shortCode,
      userId: identity.subject,
      clicks: 0,
      title: args.title || "Untitled Link",
      createdAt: Date.now(),
    });

    // 2. Simpan Relasi Kategori (Looping)
    if (args.categoryIds && args.categoryIds.length > 0) {
      for (const catId of args.categoryIds) {
        await ctx.db.insert("link_categories", {
          linkId: linkId,
          categoryId: catId,
        });
      }
    }

    return shortCode;
  },
});

export const updateLink = mutation({
  args: {
    id: v.id("links"), // ID Link yang mau diedit
    originalUrl: v.string(),
    title: v.string(),
    customSlug: v.string(),
    categoryIds: v.array(v.id("categories")), // List kategori baru
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    if (args.customSlug && isReservedSlug(args.customSlug)) {
      throw new Error("Nama link ini tidak boleh digunakan (Reserved Word).");
    }
    
    // 1. Ambil data link lama
    const existingLink = await ctx.db.get(args.id);
    if (!existingLink || existingLink.userId !== identity.subject) {
      throw new Error("Link tidak ditemukan atau bukan milik Anda.");
    }

    // 2. Validasi Slug (Hanya jika slug berubah)
    const newSlug = args.customSlug.trim();
    
    // Jika user mengosongkan slug, atau slug-nya sama dengan yang lama, aman.
    // TAPI jika slug BEDA dari yang lama, kita harus cek ketersediaan.
    if (newSlug !== existingLink.shortCode) {
       const isTaken = await ctx.db
          .query("links")
          .withIndex("by_shortCode", (q) => q.eq("shortCode", newSlug))
          .first();
       
       if (isTaken) {
          throw new Error("Link custom ini sudah dipakai orang lain.");
       }
    }

    // 3. Update Data Link Utama
    await ctx.db.patch(args.id, {
      originalUrl: args.originalUrl,
      title: args.title,
      shortCode: newSlug,
    });

    // 4. Update Kategori (Reset & Re-insert)
    // Hapus semua kategori lama untuk link ini
    const oldRelations = await ctx.db
      .query("link_categories")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.id))
      .collect();
    
    for (const rel of oldRelations) {
      await ctx.db.delete(rel._id);
    }

    // Masukkan kategori baru
    for (const catId of args.categoryIds) {
      await ctx.db.insert("link_categories", {
        linkId: args.id,
        categoryId: catId,
      });
    }
  },
});

export const getMyLinks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("links").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).order("desc").collect();
  },
});

/**
 * Data yang dibutuhkan halaman antara, lengkap dengan cara ia harus berperilaku.
 *
 * Perilaku ditentukan oleh paket PEMILIK tautan, bukan pengunjung — pengunjung
 * bahkan tidak login. Paket dibaca lewat satu pembacaan ber-index tambahan,
 * bukan disalin ke tabel links: menyalinnya berarti setiap upgrade harus
 * menulis ulang seluruh tautan milik user, dan satu tulisan yang meleset
 * membuat pelanggan yang sudah membayar tetap melihat iklan.
 */
export const getUrlByCode = query({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("links")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .first();

    if (!link) return null;

    const owner = await getEntitlementsForUser(ctx, link.userId);

    let mode: "skip" | "ads" | "branded" = "ads";
    let brand: {
      displayName: string;
      logoUrl?: string;
      primaryColor?: string;
      tagline?: string;
      ctaLabel?: string;
      ctaUrl?: string;
    } | null = null;

    if (planHasFeature(owner.plan, "whitelabel_interstitial")) {
      const settings = await ctx.db
        .query("brand_settings")
        .withIndex("by_userId", (q) => q.eq("userId", link.userId))
        .first();

      if (settings?.enabled) {
        mode = "branded";
        brand = {
          displayName: settings.displayName,
          logoUrl: settings.logoUrl,
          primaryColor: settings.primaryColor,
          tagline: settings.tagline,
          ctaLabel: settings.ctaLabel,
          ctaUrl: settings.ctaUrl,
        };
      }
    }

    // Belum memasang branding sendiri? Paket berbayar tetap melompat langsung.
    if (mode !== "branded" && planHasFeature(owner.plan, "skip_interstitial")) {
      mode = "skip";
    }

    return {
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      title: link.title,
      mode,
      brand,
    };
  },
});

// Ganti atau Tambahkan fungsi ini
export const getLinkAndIncrement = mutation({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    // 1. Cari link berdasarkan kode
    const link = await ctx.db
      .query("links")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .first();

    if (!link) return null;

    // 2. Tambah jumlah klik (+1)
    await ctx.db.patch(link._id, {
      clicks: link.clicks + 1,
    });

    // 3. Kembalikan URL aslinya untuk redirect
    return link.originalUrl;
  },
});

export const getLinksByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 1. Ambil semua relasi di tabel pivot berdasarkan categoryId
    const relations = await ctx.db
      .query("link_categories")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    // 2. Ambil detail Link aslinya
    const results = [];
    for (const rel of relations) {
      const link = await ctx.db.get(rel.linkId);
      // Pastikan link ada dan milik user yang sama
      if (link && link.userId === identity.subject) {
        results.push(link);
      }
    }

    // Urutkan dari yang terbaru
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const deleteLink = mutation({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Tidak diizinkan");
    }

    // 1. Hapus dulu relasi kategorinya (Bersih-bersih)
    const relations = await ctx.db
      .query("link_categories")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.id))
      .collect();
    
    for (const rel of relations) {
      await ctx.db.delete(rel._id);
    }

    // 2. Baru hapus Link utamanya
    await ctx.db.delete(args.id);
  },
});