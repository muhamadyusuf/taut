import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const ADMIN_EMAIL = "muhamadyusuf0012@gmail.com";

function assertAdmin(email: string | undefined) {
  if (email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin only");
  }
}

// Ubah judul menjadi slug URL-friendly
function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Ringkasan otomatis dari isi artikel, dipakai bila kutipan dikosongkan
function makeExcerpt(html: string, length = 170) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

// Hitung perkiraan waktu baca (menit) dari konten HTML
function readingTime(html: string) {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Pastikan slug unik — kalau bentrok, tambahkan sufiks angka
async function uniqueSlug(
  ctx: QueryCtx,
  desired: string,
  ignoreId?: Id<"articles">
) {
  const base = slugify(desired) || `artikel-${Date.now()}`;
  let candidate = base;
  let i = 2;

  for (;;) {
    const existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .first();

    if (!existing || existing._id === ignoreId) return candidate;
    candidate = `${base}-${i++}`;
  }
}

// -------------------------------------------------------
// ADMIN
// -------------------------------------------------------

// Semua artikel (draft + terbit) untuk tabel admin
export const getAllArticlesAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const now = Date.now();
    const articles = await ctx.db.query("articles").order("desc").collect();

    return articles
      .sort(
        (a, b) =>
          (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt)
      )
      .map((a) => ({
        ...a,
        // Status ditentukan di server agar tidak bergantung jam browser
        state:
          a.status !== "published"
            ? ("draft" as const)
            : (a.publishedAt ?? a.createdAt) > now
              ? ("scheduled" as const)
              : ("published" as const),
      }));
  },
});

// Satu artikel untuk halaman edit
export const getArticleById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);
    return await ctx.db.get(args.id);
  },
});

// Cek ketersediaan slug saat mengetik permalink
export const checkSlugAvailability = query({
  args: { slug: v.string(), ignoreId: v.optional(v.id("articles")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const clean = slugify(args.slug);
    if (!clean) return { available: false, slug: clean };

    const existing = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", clean))
      .first();

    return {
      available: !existing || existing._id === args.ignoreId,
      slug: clean,
    };
  },
});

// Daftar kategori yang sudah pernah dipakai (untuk saran di editor)
export const getArticleCategories = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const articles = await ctx.db.query("articles").collect();
    const names = new Set<string>();
    for (const a of articles) {
      if (a.category) names.add(a.category);
    }
    return Array.from(names).sort();
  },
});

export const createArticle = mutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.string(), // "draft" | "published"
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const now = Date.now();
    const slug = await uniqueSlug(ctx, args.slug || args.title);

    return await ctx.db.insert("articles", {
      title: args.title.trim() || "(Tanpa judul)",
      slug,
      excerpt: args.excerpt,
      content: args.content,
      coverImage: args.coverImage,
      category: args.category,
      tags: args.tags ?? [],
      status: args.status,
      authorId: identity!.subject,
      authorName: identity?.name ?? "Admin",
      // Tanggal post: pakai yang diisi admin, kalau kosong pakai waktu terbit
      publishedAt:
        args.publishedAt ?? (args.status === "published" ? now : undefined),
      createdAt: now,
      updatedAt: now,
      views: 0,
    });
  },
});

export const updateArticle = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.string(),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Artikel tidak ditemukan");

    const { id, ...data } = args;
    const slug = await uniqueSlug(ctx, data.slug || data.title, id);

    await ctx.db.patch(id, {
      title: data.title.trim() || "(Tanpa judul)",
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage,
      category: data.category,
      tags: data.tags ?? [],
      status: data.status,
      publishedAt:
        data.publishedAt ??
        (data.status === "published"
          ? (current.publishedAt ?? Date.now())
          : current.publishedAt),
      updatedAt: Date.now(),
    });
  },
});

// Ganti status cepat dari tabel (Terbitkan / Jadikan draft)
export const setArticleStatus = mutation({
  args: { id: v.id("articles"), status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Artikel tidak ditemukan");

    await ctx.db.patch(args.id, {
      status: args.status,
      publishedAt:
        args.status === "published"
          ? (article.publishedAt ?? Date.now())
          : article.publishedAt,
      updatedAt: Date.now(),
    });
  },
});

export const deleteArticle = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);
    await ctx.db.delete(args.id);
  },
});

// Ringkasan untuk kartu statistik di halaman admin
export const getArticleStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    assertAdmin(identity?.email);

    const articles = await ctx.db.query("articles").collect();
    const now = Date.now();

    return {
      total: articles.length,
      published: articles.filter(
        (a) => a.status === "published" && (a.publishedAt ?? 0) <= now
      ).length,
      scheduled: articles.filter(
        (a) => a.status === "published" && (a.publishedAt ?? 0) > now
      ).length,
      draft: articles.filter((a) => a.status === "draft").length,
      totalViews: articles.reduce((acc, a) => acc + a.views, 0),
    };
  },
});

// -------------------------------------------------------
// PUBLIK (tanpa login)
// -------------------------------------------------------

// Daftar artikel yang sudah terbit (artikel terjadwal belum tampil)
export const getPublishedArticles = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const visible = articles
      .filter((a) => (a.publishedAt ?? a.createdAt) <= now)
      .filter((a) => !args.category || a.category === args.category)
      .sort(
        (a, b) =>
          (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt)
      );

    const sliced = args.limit ? visible.slice(0, args.limit) : visible;

    // Konten penuh tidak dikirim ke halaman daftar
    return sliced.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || makeExcerpt(a.content),
      coverImage: a.coverImage,
      category: a.category,
      tags: a.tags ?? [],
      authorName: a.authorName,
      publishedAt: a.publishedAt ?? a.createdAt,
      views: a.views,
      readingTime: readingTime(a.content),
    }));
  },
});

// Daftar kategori beserta jumlah artikelnya (untuk filter di halaman blog)
export const getPublicCategories = query({
  handler: async (ctx) => {
    const now = Date.now();
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    const counts: Record<string, number> = {};
    for (const a of articles) {
      if ((a.publishedAt ?? a.createdAt) > now) continue;
      if (!a.category) continue;
      counts[a.category] = (counts[a.category] || 0) + 1;
    }

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  },
});

export const getArticleBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!article) return null;

    // Draft & artikel terjadwal hanya boleh dilihat admin (mode pratinjau)
    const isLive =
      article.status === "published" &&
      (article.publishedAt ?? article.createdAt) <= Date.now();

    if (!isLive) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity?.email !== ADMIN_EMAIL) return null;
    }

    return {
      ...article,
      excerpt: article.excerpt || makeExcerpt(article.content),
      publishedAt: article.publishedAt ?? article.createdAt,
      tags: article.tags ?? [],
      readingTime: readingTime(article.content),
      isPreview: !isLive,
    };
  },
});

// Artikel lain untuk bagian "Baca juga"
export const getRelatedArticles = query({
  args: { slug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const current = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    return articles
      .filter(
        (a) =>
          a.slug !== args.slug && (a.publishedAt ?? a.createdAt) <= now
      )
      .sort((a, b) => {
        // Kategori sama diprioritaskan, lalu yang paling baru
        const sameA = current?.category && a.category === current.category ? 1 : 0;
        const sameB = current?.category && b.category === current.category ? 1 : 0;
        if (sameA !== sameB) return sameB - sameA;
        return (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt);
      })
      .slice(0, args.limit ?? 3)
      .map((a) => ({
        _id: a._id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt || makeExcerpt(a.content, 110),
        coverImage: a.coverImage,
        category: a.category,
        publishedAt: a.publishedAt ?? a.createdAt,
        views: a.views,
      }));
  },
});

// Tambah 1 view — dipanggil dari halaman detail artikel
export const incrementArticleViews = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const article = await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!article || article.status !== "published") return;

    await ctx.db.patch(article._id, { views: article.views + 1 });
  },
});
