import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---------------------------------------------------------
  // TABEL URL SHORTENER (Tetap)
  // ---------------------------------------------------------
  links: defineTable({
    originalUrl: v.string(),
    shortCode: v.string(),
    userId: v.string(),
    clicks: v.number(),
    title: v.optional(v.string()),
    createdAt: v.number(),
  })
  .index("by_shortCode", ["shortCode"])
  .index("by_userId", ["userId"]),

  categories: defineTable({
    name: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  })
  .index("by_userId", ["userId"]),

  link_categories: defineTable({
    linkId: v.id("links"),
    categoryId: v.id("categories"),
  })
  .index("by_linkId", ["linkId"])
  .index("by_categoryId", ["categoryId"]),

  // ---------------------------------------------------------
  // TABEL MICROSITES (Diperbaharui)
  // ---------------------------------------------------------
  microsites: defineTable({
    userId: v.string(),
    slug: v.string(),
    title: v.string(),
    bio: v.optional(v.string()),
    
    // Tampilan
    theme: v.string(),
    buttonStyle: v.optional(v.string()), // e.g: "rounded", "sharp", "outline"
    
    // Gambar (URL String)
    imageUrl: v.optional(v.string()), 
    backgroundUrl: v.optional(v.string()), 

    // Statistik
    visitorCount: v.optional(v.number()),

    // Social Media Links (Objek Terpisah)
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

    // Array Link/Konten
    links: v.array(
      v.object({
        id: v.string(),
        type: v.string(), // "link" | "header"
        label: v.string(),
        url: v.optional(v.string()),
        active: v.boolean(),
        thumbnail: v.optional(v.string()), // Gambar kecil di tombol
        icon: v.optional(v.string()),      // Class icon (jika pakai library icon)
      })
    ),
  })
  .index("by_userId", ["userId"])
  .index("by_slug", ["slug"]),
});