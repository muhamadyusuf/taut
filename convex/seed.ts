import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { SEED_ARTICLES } from "./seedData";
// Peran admin dibaca dari kolom `role`, sama seperti sisa backend.
import { assertAdmin } from "./entitlements";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Default jadwal: mulai besok pukul 09.00 WIB (02.00 UTC). Menerbitkan pagi
 * hari membuat artikel sempat terindeks sebelum jam sibuk.
 */
function defaultStartAt(now: number) {
  const d = new Date(now);
  d.setUTCHours(2, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.getTime();
}

/**
 * Ringkasan kalender editorial — dipakai panel admin untuk menampilkan berapa
 * topik yang tersedia dan berapa yang sudah masuk database.
 */
export const getSeedStatus = query({
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const existing = await ctx.db.query("articles").collect();
    const slugs = new Set(existing.map((a) => a.slug));
    const imported = SEED_ARTICLES.filter((s) => slugs.has(s.slug)).length;

    const categories = new Set(SEED_ARTICLES.map((s) => s.category));

    return {
      total: SEED_ARTICLES.length,
      imported,
      remaining: SEED_ARTICLES.length - imported,
      categories: Array.from(categories).sort(),
    };
  },
});

/**
 * Memasukkan kalender editorial sebagai artikel berstatus "published" dengan
 * publishedAt di masa depan — halaman publik baru menampilkannya saat waktunya
 * tiba, jadi tidak ada 100 artikel yang muncul serentak.
 *
 * Idempoten: slug yang sudah ada dilewati, jadi aman dijalankan berulang.
 */
export const seedScheduledArticles = mutation({
  args: {
    startAt: v.optional(v.number()),
    intervalDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await assertAdmin(ctx);
    const identity = await ctx.auth.getUserIdentity();

    const now = Date.now();
    const interval = Math.max(1, args.intervalDays ?? 3) * DAY;
    const start = args.startAt ?? defaultStartAt(now);

    let created = 0;
    let skipped = 0;
    let firstAt: number | null = null;
    let lastAt: number | null = null;

    for (let i = 0; i < SEED_ARTICLES.length; i++) {
      const seed = SEED_ARTICLES[i];
      const publishedAt = start + i * interval;

      const existing = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", seed.slug))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("articles", {
        title: seed.title,
        slug: seed.slug,
        excerpt: seed.excerpt,
        content: seed.content,
        category: seed.category,
        tags: seed.tags,
        status: "published",
        authorId: identity!.subject,
        authorName: identity?.name ?? "Tim singkat.in",
        publishedAt,
        createdAt: now,
        updatedAt: now,
        views: 0,
      });

      created++;
      if (firstAt === null) firstAt = publishedAt;
      lastAt = publishedAt;
    }

    return { created, skipped, total: SEED_ARTICLES.length, firstAt, lastAt };
  },
});

/**
 * Membatalkan impor. Hanya menghapus artikel hasil seed yang BELUM tayang dan
 * belum pernah dibaca — artikel yang sudah terbit atau sudah Anda sunting
 * (viewnya bertambah) tidak ikut terhapus.
 */
export const removeUnpublishedSeedArticles = mutation({
  handler: async (ctx) => {
    await assertAdmin(ctx);

    const now = Date.now();
    const seedSlugs = new Set(SEED_ARTICLES.map((s) => s.slug));
    const articles = await ctx.db.query("articles").collect();

    let removed = 0;
    for (const a of articles) {
      const isFutureSeed =
        seedSlugs.has(a.slug) && (a.publishedAt ?? a.createdAt) > now;
      if (isFutureSeed && a.views === 0) {
        await ctx.db.delete(a._id);
        removed++;
      }
    }

    return { removed };
  },
});
