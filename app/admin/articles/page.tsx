"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  CalendarClock,
  Eye,
  ExternalLink,
  FileText,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import SeedCalendarPanel from "./_components/SeedCalendarPanel";

type Filter = "all" | "published" | "scheduled" | "draft";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "published", label: "Terbit" },
  { key: "scheduled", label: "Terjadwal" },
  { key: "draft", label: "Draft" },
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminArticlesPage() {
  const articles = useQuery(api.articles.getAllArticlesAdmin);
  const stats = useQuery(api.articles.getArticleStats);
  const setStatus = useMutation(api.articles.setArticleStatus);
  const deleteArticle = useMutation(api.articles.deleteArticle);

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Id<"articles"> | null>(null);

  const rows = useMemo(() => {
    if (!articles) return [];
    const keyword = search.trim().toLowerCase();

    return articles
      .filter((a) => filter === "all" || a.state === filter)
      .filter(
        (a) =>
          !keyword ||
          a.title.toLowerCase().includes(keyword) ||
          a.slug.includes(keyword) ||
          (a.category ?? "").toLowerCase().includes(keyword)
      );
  }, [articles, filter, search]);

  const handleDelete = async (id: Id<"articles">) => {
    await deleteArticle({ id });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Artikel</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola artikel blog singkat.in — tanggal posting dan jumlah dilihat
            terpantau di sini
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast shadow transition-colors hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
          Tulis Artikel
        </Link>
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Artikel"
          value={stats?.total}
          icon={Newspaper}
          tone="blue"
        />
        <StatCard
          label="Terbit"
          value={stats?.published}
          icon={FileText}
          tone="green"
        />
        <StatCard
          label="Terjadwal"
          value={stats?.scheduled}
          icon={CalendarClock}
          tone="amber"
        />
        <StatCard
          label="Total Dilihat"
          value={stats?.totalViews}
          icon={Eye}
          tone="purple"
        />
      </div>

      {/* Impor kalender editorial */}
      <SeedCalendarPanel />

      {/* Filter + pencarian */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-card p-1 border border-border">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filter === f.key
                  ? "bg-brand text-brand-contrast"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau kategori…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tabel */}
      {articles === undefined ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card py-20 text-subtle">
          <Newspaper className="h-10 w-10 text-subtle" />
          <p className="font-medium">
            {articles.length === 0 ? "Belum ada artikel" : "Tidak ada artikel yang cocok"}
          </p>
          {articles.length === 0 && (
            <Link
              href="/admin/articles/new"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Tulis artikel pertama
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Judul</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3 whitespace-nowrap">Tanggal Posting</th>
                  <th className="px-5 py-3 text-right whitespace-nowrap">Dilihat</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((a) => (
                  <tr key={a._id} className="hover:bg-muted/70">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        {a.coverImage ? (
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={a.coverImage}
                              alt={a.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-muted text-subtle">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/articles/${a._id}`}
                              className="font-semibold text-foreground hover:text-brand"
                            >
                              {a.title}
                            </Link>
                            <StatusBadge state={a.state} />
                          </div>
                          <p className="mt-0.5 truncate text-xs text-subtle">
                            /blog/{a.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {a.category ? (
                        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                          {a.category}
                        </span>
                      ) : (
                        <span className="text-xs text-subtle">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-muted-foreground">
                      <p className="text-xs font-medium">
                        {a.state === "draft"
                          ? "Belum diterbitkan"
                          : a.state === "scheduled"
                            ? "Dijadwalkan"
                            : "Diterbitkan"}
                      </p>
                      <p className="text-xs text-subtle">
                        {formatDate(a.publishedAt ?? a.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                        <Eye className="h-3.5 w-3.5 text-subtle" />
                        {a.views.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() =>
                            setStatus({
                              id: a._id,
                              status: a.status === "published" ? "draft" : "published",
                            })
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {a.status === "published" ? "Jadikan Draft" : "Terbitkan"}
                        </button>
                        {a.state === "published" && (
                          <a
                            href={`/blog/${a.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Lihat"
                            className="rounded-lg p-2 text-subtle transition-colors hover:bg-brand-soft hover:text-brand"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          href={`/admin/articles/${a._id}`}
                          title="Edit"
                          className="rounded-lg p-2 text-subtle transition-colors hover:bg-brand-soft hover:text-brand"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(a._id)}
                          title="Hapus"
                          className="rounded-lg p-2 text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft">
              <Trash2 className="h-6 w-6 text-danger" />
            </div>
            <h3 className="font-bold text-foreground">Hapus Artikel?</h3>
            <p className="text-sm text-muted-foreground">
              Artikel ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
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

function StatusBadge({ state }: { state: Filter }) {
  const map: Record<string, { label: string; className: string }> = {
    published: { label: "Terbit", className: "bg-success-soft text-success" },
    scheduled: { label: "Terjadwal", className: "bg-warning-soft text-warning" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  };
  const item = map[state] ?? map.draft;
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  tone: "blue" | "green" | "amber" | "purple";
}) {
  const tones = {
    blue: "bg-brand-soft text-brand",
    green: "bg-success-soft text-success",
    amber: "bg-warning-soft text-warning",
    purple: "bg-info-soft text-info",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">
          {value === undefined ? "—" : value.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
