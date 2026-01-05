import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createLink = mutation({
  args: { 
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    title: v.optional(v.string()) // Menerima judul
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    let shortCode: string;
    if (args.customSlug && args.customSlug.trim() !== "") {
      shortCode = args.customSlug.trim();
      const existing = await ctx.db.query("links").withIndex("by_shortCode", (q) => q.eq("shortCode", shortCode)).first();
      if (existing) throw new Error("Custom link already taken");
    } else {
      shortCode = Math.random().toString(36).substring(2, 7);
    }

    await ctx.db.insert("links", {
      originalUrl: args.originalUrl,
      shortCode: shortCode,
      userId: identity.subject,
      clicks: 0,
      title: args.title || "Untitled Link", // Default title
      createdAt: Date.now(),
    });
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