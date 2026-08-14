import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { CalendarDays, Clock, Eye, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Artikel & Blog",
  description:
    "Tips, tutorial, dan kabar terbaru seputar manajemen tautan, QR code, dan digital marketing dari tim singkat.in.",
  openGraph: {
    title: "Artikel & Blog | singkat.in",
    description:
      "Tips, tutorial, dan kabar terbaru seputar manajemen tautan dari tim singkat.in.",
  },
};

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;

  const [articles, categories] = await Promise.all([
    fetchQuery(api.articles.getPublishedArticles, { category: kategori }),
    fetchQuery(api.articles.getPublicCategories, {}),
  ]);

  const [featured, ...rest] = articles;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Judul halaman */}
      <header className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg">
          <Newspaper className="h-3.5 w-3.5" />
          Blog
        </span>
        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-foreground">
          Artikel <span className="text-brand">singkat.in</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground leading-relaxed">
          Tips, tutorial, dan kabar terbaru seputar manajemen tautan, QR code,
          dan strategi digital.
        </p>
      </header>

      {/* Filter kategori */}
      {categories.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !kategori
                ? "bg-brand text-brand-contrast"
                : "bg-card border border-border text-muted-foreground hover:text-brand hover:border-brand"
            }`}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/blog?kategori=${encodeURIComponent(c.name)}`}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                kategori === c.name
                  ? "bg-brand text-brand-contrast"
                  : "bg-card border border-border text-muted-foreground hover:text-brand hover:border-brand"
              }`}
            >
              {c.name}
              <span className="ml-1.5 opacity-60">{c.count}</span>
            </Link>
          ))}
        </div>
      )}

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-24 text-muted-foreground">
          <Newspaper className="h-10 w-10 text-subtle" />
          <p className="font-semibold text-foreground">Belum ada artikel</p>
          <p className="text-sm">
            {kategori
              ? `Tidak ada artikel dalam kategori "${kategori}".`
              : "Artikel pertama sedang disiapkan. Nantikan ya!"}
          </p>
        </div>
      ) : (
        <>
          {/* Artikel utama */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-10 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="relative aspect-16/10 md:aspect-auto md:min-h-[300px] bg-muted">
              {featured.coverImage ? (
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  unoptimized
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Newspaper className="h-12 w-12 text-subtle" />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center gap-3 p-8">
              {featured.category && (
                <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg">
                  {featured.category}
                </span>
              )}
              <h2 className="text-2xl md:text-3xl font-extrabold leading-snug text-foreground transition-colors group-hover:text-brand">
                {featured.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {featured.excerpt}
              </p>
              <ArticleMeta
                publishedAt={featured.publishedAt}
                views={featured.views}
                readingTime={featured.readingTime}
              />
            </div>
          </Link>

          {/* Sisanya */}
          {rest.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((a) => (
                <Link
                  key={a._id}
                  href={`/blog/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="relative aspect-16/9 bg-muted">
                    {a.coverImage ? (
                      <Image
                        src={a.coverImage}
                        alt={a.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Newspaper className="h-8 w-8 text-subtle" />
                      </div>
                    )}
                    {a.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-brand backdrop-blur-sm">
                        {a.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    <h3 className="font-bold leading-snug text-foreground transition-colors group-hover:text-brand line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {a.excerpt}
                    </p>
                    <div className="mt-auto pt-3">
                      <ArticleMeta
                        publishedAt={a.publishedAt}
                        views={a.views}
                        readingTime={a.readingTime}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ArticleMeta({
  publishedAt,
  views,
  readingTime,
}: {
  publishedAt: number;
  views: number;
  readingTime: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle">
      <span className="flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {formatDate(publishedAt)}
      </span>
      <span className="flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" />
        {views.toLocaleString("id-ID")} dilihat
      </span>
      <span className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {readingTime} menit baca
      </span>
    </div>
  );
}
