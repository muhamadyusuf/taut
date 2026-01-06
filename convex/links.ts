import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

// Update link (misal ganti judul atau slug)
export const updateLink = mutation({
    args: { id: v.id("links"), newShortCode: v.optional(v.string()), newTitle: v.optional(v.string()) },
    handler: async (ctx, args) => {
        // Logic validasi sama seperti sebelumnya...
        // Kita persingkat di sini untuk fokus ke UI
        const fields: { shortCode?: string; title?: string } = {};
        if (args.newShortCode) fields.shortCode = args.newShortCode;
        if (args.newTitle) fields.title = args.newTitle;
        await ctx.db.patch(args.id, fields);
    }
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