import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. DAFTAR KATA TERLARANG (RESERVED KEYWORDS)
// Tambahkan semua route sistem Anda di sini
const RESERVED_SLUGS = [
  "dashboard", 
  "dashboard/links", 
  "dashboard/categories", 
  "dashboard/qr-codes", 
  "dashboard/analytics", 
  "dashboard/settings", 
  "sign-in", 
  "sign-up", 
  "login", 
  "register", 
  "api", 
  "about", 
  "contact", 
  "terms", 
  "privacy", 
  "404", 
  "500",
  "app",
  "admin",
  "static",
  "public",
  "about",
  "contact",
  "privacy",
  "terms",
  "kebijakan",
  "syarat",
  "legal"
];

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
    if (args.customSlug && RESERVED_SLUGS.includes(args.customSlug.toLowerCase())) {
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

    if (args.customSlug && RESERVED_SLUGS.includes(args.customSlug.toLowerCase())) {
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

export const getUrlByCode = query({
    args: { shortCode: v.string() },
    handler: async (ctx, args) => {
      return await ctx.db.query("links").withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode)).first();
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