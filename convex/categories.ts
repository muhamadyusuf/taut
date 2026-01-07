import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Ambil semua kategori user
export const getMyCategories = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Buat kategori baru
export const createCategory = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.insert("categories", {
      name: args.name,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const updateCategory = mutation({
  args: { 
    id: v.id("categories"), 
    name: v.string() 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const category = await ctx.db.get(args.id);
    // Cek kepemilikan
    if (!category || category.userId !== identity.subject) {
      throw new Error("Tidak diizinkan");
    }

    // Update nama
    await ctx.db.patch(args.id, {
      name: args.name,
    });
  },
});

// Hapus kategori
export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== identity.subject) {
        throw new Error("Tidak diizinkan");
    }

    // 1. Hapus relasi link_categories yang terhubung ke kategori ini
    const relations = await ctx.db
      .query("link_categories")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.id))
      .collect();

    for (const rel of relations) {
      await ctx.db.delete(rel._id);
    }

    // 2. Hapus Kategorinya
    await ctx.db.delete(args.id);
  },
});