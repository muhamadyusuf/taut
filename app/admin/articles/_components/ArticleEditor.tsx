"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Eye,
  ImageIcon,
  Loader2,
  Pencil,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import RichTextEditor from "./RichTextEditor";

type Props = {
  articleId?: Id<"articles">;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// epoch -> nilai untuk <input type="datetime-local">
function toDateTimeLocal(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ArticleEditor({ articleId }: Props) {
  const router = useRouter();

  const article = useQuery(
    api.articles.getArticleById,
    articleId ? { id: articleId } : "skip"
  );
  const categories = useQuery(api.articles.getArticleCategories);

  const createArticle = useMutation(api.articles.createArticle);
  const updateArticle = useMutation(api.articles.updateArticle);
  const deleteArticle = useMutation(api.articles.deleteArticle);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [publishAt, setPublishAt] = useState(() => toDateTimeLocal(Date.now()));

  const [saving, setSaving] = useState<null | "draft" | "published">(null);
  const [notice, setNotice] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Isi form saat data artikel lama sudah tersedia
  useEffect(() => {
    if (!articleId || !article || loaded) return;
    setTitle(article.title);
    setSlug(article.slug);
    setSlugTouched(true);
    setContent(article.content);
    setExcerpt(article.excerpt ?? "");
    setCoverImage(article.coverImage ?? "");
    setCategory(article.category ?? "");
    setTags(article.tags ?? []);
    setPublishAt(toDateTimeLocal(article.publishedAt ?? article.createdAt));
    setLoaded(true);
  }, [article, articleId, loaded]);

  // Slug ikut judul selama admin belum mengubahnya manual
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const isPublished = article?.status === "published";
  const publishTs = useMemo(() => {
    const ts = new Date(publishAt).getTime();
    return Number.isNaN(ts) ? Date.now() : ts;
  }, [publishAt]);
  const isScheduled = publishTs > Date.now();

  const addTag = (raw: string) => {
    const clean = raw.trim().replace(/,$/, "");
    if (!clean || tags.includes(clean)) return;
    setTags([...tags, clean]);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      setNotice("Judul artikel belum diisi.");
      return;
    }
    setSaving(status);
    setNotice("");
    try {
      const payload = {
        title: title.trim(),
        slug: slug || undefined,
        excerpt: excerpt.trim() || undefined,
        content,
        coverImage: coverImage.trim() || undefined,
        category: category.trim() || undefined,
        tags,
        status,
        publishedAt: status === "published" ? publishTs : undefined,
      };

      if (articleId) {
        await updateArticle({ id: articleId, ...payload });
        setNotice(
          status === "published"
            ? isScheduled
              ? "Artikel dijadwalkan terbit."
              : "Artikel diperbarui dan sudah tayang."
            : "Draft tersimpan."
        );
      } else {
        const newId = await createArticle(payload);
        router.replace(`/admin/articles/${newId}`);
        return;
      }
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Gagal menyimpan artikel.");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;
    await deleteArticle({ id: articleId });
    router.push("/admin/articles");
  };

  // Menunggu data artikel lama termuat
  if (articleId && article === undefined) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (articleId && article === null) {
    return (
      <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-3">
        <p className="font-semibold text-foreground">Artikel tidak ditemukan</p>
        <Link href="/admin/articles" className="text-sm text-brand hover:underline">
          Kembali ke daftar artikel
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/articles"
            className="p-2 rounded-lg text-subtle hover:text-foreground hover:bg-card transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-foreground truncate">
              {articleId ? "Edit Artikel" : "Tulis Artikel Baru"}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {articleId && article
                ? `${article.views} kali dilihat · terakhir disunting ${formatDateTime(article.updatedAt)}`
                : "Tulis, atur tanggal terbit, lalu publikasikan"}
            </p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-border bg-brand-soft px-4 py-3 text-sm text-brand-soft-fg">
          <Check className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ── Kolom utama ── */}
        <div className="space-y-5 min-w-0">
          {/* Judul */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tambahkan judul artikel"
            className="w-full rounded-2xl border border-border bg-card px-6 py-5 text-2xl font-bold text-foreground placeholder:text-subtle placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {/* Permalink */}
          {(slug || title) && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm">
              <span className="text-muted-foreground font-medium">Permalink:</span>
              <span className="text-subtle">singkat.in/blog/</span>
              {editingSlug ? (
                <>
                  <input
                    autoFocus
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    onBlur={() => setSlug(slugify(slug))}
                    className="flex-1 min-w-[140px] border-b border-brand px-1 py-0.5 text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSlug(slugify(slug));
                      setEditingSlug(false);
                    }}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    OK
                  </button>
                </>
              ) : (
                <>
                  <span className="font-semibold text-foreground break-all">
                    {slug || "…"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingSlug(true)}
                    className="ml-1 flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                  >
                    <Pencil className="h-3 w-3" />
                    Ubah
                  </button>
                </>
              )}
            </div>
          )}

          {/* Editor */}
          <RichTextEditor value={content} onChange={setContent} />

          {/* Kutipan / excerpt */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-bold text-foreground">Kutipan</h3>
            </div>
            <div className="p-5">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Ringkasan singkat artikel. Tampil di daftar blog dan hasil pencarian."
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-2 text-xs text-subtle">
                Kosongkan untuk memakai potongan awal isi artikel secara otomatis.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-5 lg:sticky lg:top-6">
          {/* Kotak Terbitkan */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-bold text-foreground">Terbitkan</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    !articleId
                      ? "bg-muted text-muted-foreground"
                      : isPublished && isScheduled
                        ? "bg-warning-soft text-warning"
                        : isPublished
                          ? "bg-success-soft text-success"
                          : "bg-muted text-muted-foreground"
                  }`}
                >
                  {!articleId
                    ? "Baru"
                    : isPublished && isScheduled
                      ? "Terjadwal"
                      : isPublished
                        ? "Terbit"
                        : "Draft"}
                </span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Tanggal posting
                </label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1.5 text-xs text-subtle">
                  {isScheduled
                    ? `Akan terbit otomatis pada ${formatDateTime(publishTs)}.`
                    : `Tampil dengan tanggal ${formatDateTime(publishTs)}.`}
                </p>
              </div>

              {articleId && article && (
                <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2.5 text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    Jumlah dilihat
                  </span>
                  <span className="font-bold text-foreground">
                    {article.views.toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSave("published")}
                  disabled={saving !== null}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand hover:bg-brand-hover disabled:bg-border-strong px-4 py-2.5 text-sm font-semibold text-brand-contrast transition-colors"
                >
                  {saving === "published" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isScheduled ? "Jadwalkan" : isPublished ? "Perbarui" : "Terbitkan"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSave("draft")}
                  disabled={saving !== null}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  {saving === "draft" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan Draft
                </button>

                {articleId && slug && (
                  <a
                    href={`/blog/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Pratinjau
                  </a>
                )}
              </div>

              {articleId && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full flex items-center justify-center gap-1.5 pt-1 text-xs font-semibold text-danger hover:text-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus artikel
                </button>
              )}
            </div>
          </div>

          {/* Gambar utama */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-bold text-foreground">Gambar Utama</h3>
            </div>
            <div className="p-5 space-y-3">
              {coverImage ? (
                <div className="relative h-36 w-full rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={coverImage}
                    alt="Pratinjau gambar utama"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    title="Hapus gambar"
                    className="absolute top-2 right-2 rounded-lg bg-black/60 p-1.5 text-white hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex h-36 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-subtle">
                  <ImageIcon className="h-7 w-7" />
                  <p className="text-xs">Belum ada gambar</p>
                </div>
              )}
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://contoh.com/gambar.jpg"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Kategori */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-bold text-foreground">Kategori</h3>
            </div>
            <div className="p-5">
              <input
                list="article-categories"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Misal: Tutorial"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <datalist id="article-categories">
                {(categories ?? []).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {(categories ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(categories ?? []).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        category === c
                          ? "bg-brand text-brand-contrast"
                          : "bg-muted text-muted-foreground hover:bg-border"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tag */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-3">
              <h3 className="text-sm font-bold text-foreground">Tag</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" />
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => {
                    addTag(tagInput);
                    setTagInput("");
                  }}
                  placeholder="Ketik lalu tekan Enter"
                  className="w-full rounded-xl border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="hover:text-danger"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Konfirmasi hapus */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft">
              <Trash2 className="h-6 w-6 text-danger" />
            </div>
            <h3 className="font-bold text-foreground">Hapus Artikel?</h3>
            <p className="text-sm text-muted-foreground">
              Artikel ini akan dihapus permanen beserta statistik jumlah dilihatnya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
