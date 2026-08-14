import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Eye,
  Newspaper,
  Tag,
  UserRound,
} from "lucide-react";
import ArticleViewCounter from "../_components/ArticleViewCounter";

type Props = { params: Promise<{ slug: string }> };

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Draft & artikel terjadwal hanya boleh dibaca admin. Token Clerk diteruskan ke
 * Convex supaya tombol "Pratinjau" di panel admin tetap berfungsi.
 */
async function getConvexToken() {
  try {
    const { getToken } = await auth();
    return (await getToken({ template: "convex" })) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const token = await getConvexToken();
  const article = await fetchQuery(
    api.articles.getArticleBySlug,
    { slug },
    { token }
  );

  if (!article) {
    return { title: "Artikel tidak ditemukan" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    // Draft/terjadwal jangan sampai terindeks saat dipratinjau
    robots: article.isPreview ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: new Date(article.publishedAt).toISOString(),
      authors: article.authorName ? [article.authorName] : undefined,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const token = await getConvexToken();

  const [article, related] = await Promise.all([
    fetchQuery(api.articles.getArticleBySlug, { slug }, { token }),
    fetchQuery(api.articles.getRelatedArticles, { slug, limit: 3 }),
  ]);

  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      {/* View hanya dihitung untuk artikel yang benar-benar sudah tayang */}
      {!article.isPreview && <ArticleViewCounter slug={article.slug} />}

      {article.isPreview && (
        <div className="mb-6 rounded-xl border border-warning bg-warning-soft px-4 py-3 text-sm font-medium text-warning">
          Mode pratinjau — artikel ini belum tayang untuk publik.
        </div>
      )}

      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Semua artikel
      </Link>

      {/* Kepala artikel */}
      <header className="mb-8">
        {article.category && (
          <Link
            href={`/blog?kategori=${encodeURIComponent(article.category)}`}
            className="inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg hover:opacity-80"
          >
            {article.category}
          </Link>
        )}

        <h1 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight text-foreground">
          {article.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <UserRound className="h-4 w-4" />
            {article.authorName || "Admin"}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" />
            {article.views.toLocaleString("id-ID")} kali dilihat
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {article.readingTime} menit baca
          </span>
        </div>
      </header>

      {/* Gambar utama */}
      {article.coverImage && (
        <div className="relative mb-10 aspect-16/9 w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>
      )}

      {/* Isi artikel */}
      <div
        className="article-content text-[16px]"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tag */}
      {article.tags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border pt-6">
          <Tag className="h-4 w-4 text-subtle" />
          {article.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Artikel lainnya */}
      {related.length > 0 && (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="mb-6 text-xl font-bold text-foreground">Baca juga</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r._id}
                href={`/blog/${r.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="relative aspect-16/9 bg-muted">
                  {r.coverImage ? (
                    <Image
                      src={r.coverImage}
                      alt={r.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Newspaper className="h-7 w-7 text-subtle" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-brand line-clamp-2">
                    {r.title}
                  </h3>
                  <div className="mt-auto flex items-center gap-3 text-[11px] text-subtle">
                    <span>{formatDate(r.publishedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {r.views.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
