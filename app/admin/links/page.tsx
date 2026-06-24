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
        <h1 className="text-2xl font-bold text-[#0b1736]">Rekap Link</h1>
        <p className="text-gray-500 text-sm mt-1">
          Seluruh tautan yang dibuat di platform
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Link</p>
          <p className="text-3xl font-bold text-[#0b1736] mt-1">
            {links ? links.length.toLocaleString("id-ID") : "..."}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Klik</p>
          <p className="text-3xl font-bold text-orange-500 mt-1">
            {links ? totalClicks.toLocaleString("id-ID") : "..."}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Rata-rata Klik/Link</p>
          <p className="text-3xl font-bold text-[#0193ff] mt-1">
            {links && links.length > 0
              ? (totalClicks / links.length).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      {/* Search + Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari link, URL, atau user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0193ff]/20 focus:border-[#0193ff] transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Judul / Short Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                  URL Asli
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                  User ID
                </th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Klik</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                  Dibuat
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered === undefined ? (
                // Loading skeleton
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <LinkIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p>Tidak ada link ditemukan</p>
                  </td>
                </tr>
              ) : (
                filtered.map((link, index) => (
                  <tr
                    key={link._id}
                    className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0b1736] truncate max-w-35">
                        {link.title || "Untitled"}
                      </p>
                      <p className="text-xs text-[#0193ff] font-mono mt-0.5">
                        /{link.shortCode}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-500 truncate max-w-50 text-xs">
                        {link.originalUrl}
                      </p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-xs text-gray-400 font-mono truncate max-w-30">
                        {link.userId.slice(5, 20)}...
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-bold text-sm">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        {link.clicks.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-400">
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
                        className="inline-flex items-center gap-1 text-xs text-[#0193ff] hover:underline"
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
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Menampilkan {filtered.length} dari {links?.length} link
          </div>
        )}
      </div>
    </div>
  );
}
