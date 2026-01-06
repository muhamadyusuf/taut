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
});