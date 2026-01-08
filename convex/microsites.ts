import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 1. Generate URL untuk Upload File
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// 2. Ambil List Microsite Milik User (FUNGSI YANG HILANG TADI)
export const getMyMicrosites = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    return await ctx.db
      .query("microsites")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});

// 3. Ambil Detail 1 Microsite (Untuk Editor)
export const getMicrositeById = query({
  args: { id: v.id("microsites") },
  handler: async (ctx, args) => {
    const data = await ctx.db.get(args.id);
    if (!data) return null;

    // Convert Storage ID jadi URL Gambar yang bisa dilihat
    const imageUrl = data.imageStorageId 
      ? await ctx.storage.getUrl(data.imageStorageId) 
      : null;
    
    const backgroundUrl = data.backgroundStorageId
      ? await ctx.storage.getUrl(data.backgroundStorageId)
      : null;

    return { ...data, imageUrl, backgroundUrl };
  },
});

// 4. Create Baru
export const createMicrosite = mutation({
  args: { slug: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Cek Slug Unik Global
    const existing = await ctx.db.query("microsites").withIndex("by_slug", q => q.eq("slug", args.slug)).first();
    if (existing) throw new Error("Link Bio ini sudah terpakai.");

    const newId = await ctx.db.insert("microsites", {
        userId: identity.subject,
        slug: args.slug,
        title: args.title,
        theme: "simple-blue",
        links: [] // Kosongkan dulu
    });
    return newId;
  },
});

// 5. Update Lengkap
export const updateMicrosite = mutation({
  args: {
    id: v.id("microsites"),
    slug: v.string(),
    title: v.string(),
    bio: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    backgroundStorageId: v.optional(v.string()),
    theme: v.string(),
    // Gunakan v.any() untuk array links yang kompleks (header/link)
    links: v.any(), 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Cek kepemilikan
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
        throw new Error("Bukan milik anda");
    }

    // Update Data
    await ctx.db.patch(args.id, {
        slug: args.slug,
        title: args.title,
        bio: args.bio,
        imageStorageId: args.imageStorageId,
        backgroundStorageId: args.backgroundStorageId,
        theme: args.theme,
        links: args.links
    });
  },
});

// 6. Public View (Untuk Halaman Bio)
export const getPublicMicrosite = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const data = await ctx.db.query("microsites").withIndex("by_slug", q => q.eq("slug", args.slug)).first();
    if (!data) return null;

    return {
        ...data,
        imageUrl: data.imageStorageId ? await ctx.storage.getUrl(data.imageStorageId) : null,
        backgroundUrl: data.backgroundStorageId ? await ctx.storage.getUrl(data.backgroundStorageId) : null,
    };
  },
});

// 7. Hapus Microsite
export const deleteMicrosite = mutation({
  args: { id: v.id("microsites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Tidak diizinkan");
    }

    await ctx.db.delete(args.id);
  },
});