import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertWithinLimit, countOwned, userHasFeature } from "./entitlements";
import {
  inspectMicrositeSlug,
  sanitizeMicrositeSlug,
} from "./micrositeSlug";

// ---------------------------------------------------------
// 1. READ: AMBIL LIST MICROSITE (Untuk Dashboard Utama)
// ---------------------------------------------------------
export const getMyMicrosites = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    return await ctx.db
      .query("microsites")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc") // Urutkan dari yang terbaru
      .collect();
  },
});

// ---------------------------------------------------------
// 2. READ: AMBIL DETAIL MICROSITE (Untuk Editor)
// ---------------------------------------------------------
export const getMicrositeById = query({
  args: { id: v.id("microsites") },
  handler: async (ctx, args) => {
    const microsite = await ctx.db.get(args.id);
    if (!microsite) return null;
    return microsite;
  },
});

// ---------------------------------------------------------
// 3. CREATE: BUAT MICROSITE BARU
// ---------------------------------------------------------
/**
 * Ketersediaan slug, untuk umpan balik langsung di formulir.
 *
 * Ini kenyamanan, bukan penjaga: pemeriksaan yang mengikat tetap dilakukan
 * ulang di dalam createMicrosite, karena nama bisa saja diambil orang lain di
 * sela antara pengetikan dan penyimpanan.
 */
export const checkSlugAvailability = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { available: false, reason: "Belum masuk." };

    const clean = sanitizeMicrositeSlug(args.slug);
    const verdict = inspectMicrositeSlug(clean);
    if (!verdict.ok) return { available: false, reason: verdict.reason };

    const taken = await ctx.db
      .query("microsites")
      .withIndex("by_slug", (q) => q.eq("slug", clean))
      .first();

    return taken
      ? { available: false, reason: "Nama ini sudah dipakai." }
      : { available: true, reason: null };
  },
});

export const createMicrosite = mutation({
  args: { 
    slug: v.string(), 
    title: v.string() 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Kuota paket: Gratis 1 halaman, Pro 5, Bisnis tanpa batas.
    // Dicek sebelum validasi slug supaya user tidak sempat memilih nama dulu
    // baru ditolak.
    const existingCount = await countOwned(ctx, "microsites", identity.subject);
    await assertWithinLimit(ctx, "microsites", existingCount);

    // Aturan yang sama dengan yang dipakai pratinjau di formulir.
    const cleanSlug = sanitizeMicrositeSlug(args.slug);
    const verdict = inspectMicrositeSlug(cleanSlug);
    if (!verdict.ok) throw new Error(verdict.reason);

    // Cek apakah Slug sudah dipakai orang lain
    const existing = await ctx.db
      .query("microsites")
      .withIndex("by_slug", q => q.eq("slug", cleanSlug))
      .first();
      
    if (existing) throw new Error("Link Bio ini sudah terpakai, silakan pilih nama lain.");

    // Buat data default
    const newId = await ctx.db.insert("microsites", {
        userId: identity.subject,
        slug: cleanSlug,
        title: args.title,
        bio: "",
        theme: "simple-blue", 
        buttonStyle: "rounded", // Default style
        links: [], 
        socials: {}, // Default kosong
        visitorCount: 0,
    });
    return newId;
  },
});

// ---------------------------------------------------------
// 4. UPDATE: SIMPAN PERUBAHAN (Lengkap)
// ---------------------------------------------------------
export const updateMicrosite = mutation({
  args: {
    id: v.id("microsites"),
    slug: v.string(),
    title: v.string(),
    bio: v.optional(v.string()),
    theme: v.string(),
    buttonStyle: v.optional(v.string()), // e.g: "rounded", "sharp", "outline"
    
    // Gambar & Background
    imageUrl: v.optional(v.string()),
    backgroundUrl: v.optional(v.string()),

    // Links (Array lebih detail)
    links: v.array(
      v.object({
        id: v.string(),
        type: v.string(), // "link" | "header"
        label: v.string(),
        url: v.optional(v.string()),
        active: v.boolean(),
        thumbnail: v.optional(v.string()), // Tambahan: Gambar kecil di dalam tombol
        icon: v.optional(v.string()),      // Tambahan: Ikon (opsional)
      })
    ),

    // Social Media Links (Object fleksibel)
    socials: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        tiktok: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        youtube: v.optional(v.string()),
        email: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    
    // Cek Kepemilikan Data
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
        throw new Error("Anda tidak memiliki izin mengedit halaman ini.");
    }

    const cleanSlug = args.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

    // Cek Unik Slug (Hanya validasi jika slug berubah)
    if (existing.slug !== cleanSlug) {
        const slugTaken = await ctx.db
            .query("microsites")
            .withIndex("by_slug", q => q.eq("slug", cleanSlug))
            .first();
        if (slugTaken) throw new Error("URL Link Bio ini sudah dipakai orang lain.");
    }

    // Simpan Perubahan
    await ctx.db.patch(args.id, {
        slug: cleanSlug,
        title: args.title,
        bio: args.bio,
        theme: args.theme,
        buttonStyle: args.buttonStyle ?? "rounded",
        links: args.links,
        socials: args.socials,
        imageUrl: args.imageUrl,         
        backgroundUrl: args.backgroundUrl,
    });
  },
});

// ---------------------------------------------------------
// 5. DELETE: HAPUS MICROSITE
// ---------------------------------------------------------
export const deleteMicrosite = mutation({
  args: { id: v.id("microsites") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Tidak diizinkan menghapus halaman ini.");
    }

    await ctx.db.delete(args.id);
  },
});

// ---------------------------------------------------------
// 6. PUBLIC: VIEW HALAMAN BIO
// ---------------------------------------------------------
/**
 * Halaman bio pertama milik seorang pengguna.
 *
 * Dipakai akar domain/subdomain penyewa untuk memutuskan ke mana pengunjung
 * dibawa saat mereka mengetik alamatnya tanpa kode apa pun.
 */
export const getFirstByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const microsite = await ctx.db
      .query("microsites")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return microsite ? { slug: microsite.slug, title: microsite.title } : null;
  },
});

export const getPublicMicrosite = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const microsite = await ctx.db
      .query("microsites")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (!microsite) return null;

    // Badge "Powered by singkat.in" mengikuti paket pemilik halaman, bukan
    // paket pengunjung — halaman ini dibuka orang yang tidak login.
    const showBranding = !(await userHasFeature(
      ctx,
      microsite.userId,
      "remove_branding"
    ));

    return { ...microsite, showBranding };
  },
});

// ---------------------------------------------------------
// 7. PUBLIC: INCREMENT VIEW (Hitung Pengunjung)
// ---------------------------------------------------------
export const incrementView = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const microsite = await ctx.db
      .query("microsites")
      .withIndex("by_slug", q => q.eq("slug", args.slug))
      .first();

    if (microsite) {
      await ctx.db.patch(microsite._id, {
        visitorCount: (microsite.visitorCount || 0) + 1,
      });
    }
  },
});