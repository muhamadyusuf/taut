import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  links: defineTable({
    originalUrl: v.string(),
    shortCode: v.string(),
    userId: v.string(),
    clicks: v.number(),
    title: v.optional(v.string()), // Fitur baru: Judul Link
    createdAt: v.number(),         // Fitur baru: Tanggal buat
  })
  .index("by_shortCode", ["shortCode"])
  .index("by_userId", ["userId"]),
});