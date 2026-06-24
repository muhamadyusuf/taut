"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { getUserInfoBatch, type ClerkUserInfo } from "./actions";
import {
  Search,
  Link as LinkIcon,
  Smartphone,
  ShoppingBag,
  MousePointerClick,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import Image from "next/image";

export default function AdminUsersPage() {
  const userStats = useQuery(api.admin.getUserStats);
  const [userInfo, setUserInfo] = useState<Record<string, ClerkUserInfo>>({});
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Fetch Clerk user info once we have user IDs from Convex
  useEffect(() => {
    if (!userStats || userStats.length === 0) return;
    const ids = userStats.map((u) => u.userId);
    getUserInfoBatch(ids).then((infos) => {
      const map: Record<string, ClerkUserInfo> = {};
      for (const info of infos) map[info.id] = info;
      setUserInfo(map);
    });
  }, [userStats]);

  const filtered = userStats?.filter((u) => {
    const info = userInfo[u.userId];
    const q = search.toLowerCase();
    return (
      u.userId.toLowerCase().includes(q) ||
      (info?.email ?? "").toLowerCase().includes(q) ||
      (info?.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1736]">Pengguna Aktif</h1>
        <p className="text-gray-500 text-sm mt-1">
          Semua pengguna beserta link, microsite, dan toko yang mereka buat
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0193ff]/20 focus:border-[#0193ff] transition"
          />
        </div>
      </div>

      {/* User Cards */}
      <div className="space-y-3">
        {filtered === undefined ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse h-24"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
            <User className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p>Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          filtered.map((u, index) => {
            const info = userInfo[u.userId];
            const isExpanded = expanded === u.userId;

            return (
              <div
                key={u.userId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Card Header */}
                <div
                  className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : u.userId)}
                >
                  {/* Rank & Avatar */}
                  <div className="shrink-0 flex items-center gap-3">
                    <span className="w-7 text-center text-sm font-bold text-gray-300">
                      {index + 1}
                    </span>
                    {info?.imageUrl ? (
                      <Image
                        src={info.imageUrl}
                        alt={info.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0193ff] to-[#0b1736] flex items-center justify-center text-white text-sm font-bold">
                        {(info?.name?.[0] ?? u.userId[5]).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0b1736] truncate">
                      {info?.name ?? (
                        <span className="text-gray-400 text-sm">Memuat...</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {info?.email ?? u.userId}
                    </p>
                  </div>

                  {/* Stats Pills */}
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <StatPill
                      icon={<MousePointerClick className="h-3.5 w-3.5" />}
                      value={u.totalClicks}
                      color="text-orange-500"
                      bg="bg-orange-50"
                    />
                    <StatPill
                      icon={<LinkIcon className="h-3.5 w-3.5" />}
                      value={u.linkCount}
                      color="text-blue-600"
                      bg="bg-blue-50"
                    />
                    <StatPill
                      icon={<Smartphone className="h-3.5 w-3.5" />}
                      value={u.micrositeCount}
                      color="text-purple-600"
                      bg="bg-purple-50"
                    />
                    <StatPill
                      icon={<ShoppingBag className="h-3.5 w-3.5" />}
                      value={u.shopCount}
                      color="text-green-600"
                      bg="bg-green-50"
                    />
                  </div>

                  {/* Expand */}
                  <div className="shrink-0 ml-2 text-gray-400">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expandable Detail */}
                {isExpanded && (
                  <UserDetail userId={u.userId} userStats={u} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  color,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${bg} ${color} text-xs font-semibold`}>
      {icon}
      {value.toLocaleString("id-ID")}
    </div>
  );
}

function UserDetail({
  userId,
  userStats,
}: {
  userId: string;
  userStats: {
    linkCount: number;
    micrositeCount: number;
    shopCount: number;
    totalClicks: number;
    micrositeSlugs: string[];
    shopSlugs: string[];
  };
}) {
  const links = useQuery(api.admin.getLinksByUserId, { userId });

  return (
    <div className="border-t border-gray-100 p-5 bg-gray-50/40">
      {/* Mobile stats row */}
      <div className="flex items-center gap-3 sm:hidden mb-4 flex-wrap">
        <StatPill
          icon={<MousePointerClick className="h-3.5 w-3.5" />}
          value={userStats.totalClicks}
          color="text-orange-500"
          bg="bg-orange-50"
        />
        <StatPill
          icon={<LinkIcon className="h-3.5 w-3.5" />}
          value={userStats.linkCount}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatPill
          icon={<Smartphone className="h-3.5 w-3.5" />}
          value={userStats.micrositeCount}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatPill
          icon={<ShoppingBag className="h-3.5 w-3.5" />}
          value={userStats.shopCount}
          color="text-green-600"
          bg="bg-green-50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Links */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <LinkIcon className="h-3.5 w-3.5 text-blue-500" />
            Tautan ({userStats.linkCount})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {links === undefined ? (
              <div className="text-xs text-gray-300 animate-pulse">Memuat...</div>
            ) : links.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada tautan</p>
            ) : (
              links.slice(0, 10).map((link) => (
                <div
                  key={link._id}
                  className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#0b1736] truncate">
                      {link.title || "Untitled"}
                    </p>
                    <p className="text-[10px] text-[#0193ff] font-mono">
                      /{link.shortCode}
                    </p>
                  </div>
                  <span className="text-xs text-orange-500 font-bold shrink-0">
                    {link.clicks} klik
                  </span>
                </div>
              ))
            )}
            {links && links.length > 10 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                +{links.length - 10} lainnya
              </p>
            )}
          </div>
        </div>

        {/* Microsites */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <Smartphone className="h-3.5 w-3.5 text-purple-500" />
            Microsite ({userStats.micrositeCount})
          </p>
          <div className="space-y-1.5">
            {userStats.micrositeSlugs.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada microsite</p>
            ) : (
              userStats.micrositeSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/bio/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-gray-100 text-xs text-purple-600 font-mono hover:bg-purple-50 transition-colors"
                >
                  /bio/{slug}
                </a>
              ))
            )}
          </div>
        </div>

        {/* Shops */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
            <ShoppingBag className="h-3.5 w-3.5 text-green-500" />
            Toko ({userStats.shopCount})
          </p>
          <div className="space-y-1.5">
            {userStats.shopSlugs.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada toko</p>
            ) : (
              userStats.shopSlugs.map((slug) => (
                <a
                  key={slug}
                  href={`/s/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white rounded-lg px-3 py-2 border border-gray-100 text-xs text-green-600 font-mono hover:bg-green-50 transition-colors"
                >
                  /s/{slug}
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
