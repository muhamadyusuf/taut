"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Search, ExternalLink, MousePointerClick, Link as LinkIcon } from "lucide-react";

export default function AdminLinksPage() {
  const links = useQuery(api.admin.getAllLinksAdmin);
  const [search, setSearch] = useState("");

  const filtered = links?.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.shortCode.toLowerCase().includes(q) ||
      l.originalUrl.toLowerCase().includes(q) ||
      (l.title || "").toLowerCase().includes(q) ||
      l.userId.toLowerCase().includes(q)
    );
  });

  const totalClicks = links?.reduce((acc, l) => acc + l.clicks, 0) ?? 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Rekap Link</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seluruh tautan yang dibuat di platform
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <p className="text-xs text-muted-foreground font-medium">Total Link</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {links ? links.length.toLocaleString("id-ID") : "..."}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <p className="text-xs text-muted-foreground font-medium">Total Klik</p>
          <p className="text-3xl font-bold text-warning mt-1">
            {links ? totalClicks.toLocaleString("id-ID") : "..."}
          </p>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
          <p className="text-xs text-muted-foreground font-medium">Rata-rata Klik/Link</p>
          <p className="text-3xl font-bold text-brand mt-1">
            {links && links.length > 0
              ? (totalClicks / links.length).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
            <input
              type="text"
              placeholder="Cari link, URL, atau user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl outline-none focus:ring-2 focus:ring-4 focus:ring-ring focus:border-brand transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Judul / Short Code</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                  URL Asli
                </th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden lg:table-cell">
                  User ID
                </th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Klik</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground hidden md:table-cell">
                  Dibuat
                </th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered === undefined ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-subtle">
                    <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada link ditemukan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((link, index) => (
                  <tr
                    key={link._id}
                    className="border-b border-border hover:bg-brand-soft/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-subtle">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground truncate max-w-35">
                        {link.title || "Untitled"}
                      </p>
                      <p className="text-xs text-brand font-mono mt-0.5">
                        /{link.shortCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-muted-foreground truncate max-w-50 text-xs">
                        {link.originalUrl}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-subtle font-mono truncate max-w-30">
                        {link.userId.slice(5, 20)}...
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-warning font-bold text-sm">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        {link.clicks.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-subtle">
                        {new Date(link.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={`/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Buka
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-subtle">
            Menampilkan {filtered.length} dari {links?.length} link
          </div>
        )}
      </div>
    </div>
  );
}
