import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  links: defineTable({
    originalUrl: v.string(),
    shortCode: v.string(),
    userId: v.string(),
    clicks: v.number(),
    title: v.optional(v.string()),
    createdAt: v.number(),
    // HAPUS categoryId dari sini, kita pindah ke tabel penghubung
  })
  .index("by_shortCode", ["shortCode"])
  .index("by_userId", ["userId"]),

  categories: defineTable({
    name: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  })
  .index("by_userId", ["userId"]),

  // TABEL BARU: PENGHUBUNG (Many-to-Many)
  link_categories: defineTable({
    linkId: v.id("links"),
    categoryId: v.id("categories"),
  })
  .index("by_linkId", ["linkId"])       // Agar cepat cari kategori dari sebuah link
  .index("by_categoryId", ["categoryId"]), // Agar cepat cari semua link dalam satu kategori

microsites: defineTable({
    userId: v.string(),
    slug: v.string(), 
    title: v.string(),
    bio: v.optional(v.string()),
    
    // IMAGE SUPPORT (Menyimpan Storage ID dari Convex)
    imageStorageId: v.optional(v.string()), // Foto Profil
    backgroundStorageId: v.optional(v.string()), // Background Image
    
    theme: v.string(), 
    
    // STRUKTUR LINK BARU (Mendukung Kategori/Header)
    links: v.array(
      v.object({
        id: v.string(),
        type: v.string(), // "link" atau "header" (kategori)
        label: v.string(),
        url: v.optional(v.string()), // Header tidak butuh URL
        active: v.boolean(),
        thumbnail: v.optional(v.string()), // Opsional: Ikon link
      })
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_slug", ["slug"]),
  });