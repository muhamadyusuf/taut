"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, MousePointerClick, TrendingUp, Users2 } from "lucide-react";
import { getUserInfoBatch, type ClerkUserInfo } from "../users/actions";

const COLORS = [
  "#0193ff", "#ee6123", "#0b1736", "#10b981", "#8b5cf6",
  "#f59e0b", "#ef4444", "#14b8a6", "#f97316", "#6366f1",
];

function shortName(info: ClerkUserInfo | undefined, userId: string): string {
  if (info?.name) {
    const parts = info.name.trim().split(" ");
    return parts[0].slice(0, 12) + (parts[0].length > 12 ? "…" : "");
  }
  return userId.slice(5, 13) + "…";
}

export default function AdminAnalyticsPage() {
  const linksPerDay = useQuery(api.admin.getLinksCreatedPerDay);
  const topLinks = useQuery(api.admin.getTopLinksByClicks, { limit: 15 });
  const clicksPerUser = useQuery(api.admin.getClicksPerUser);
  const [userInfo, setUserInfo] = useState<Record<string, ClerkUserInfo>>({});

  useEffect(() => {
    if (!clicksPerUser || clicksPerUser.length === 0) return;
    const ids = clicksPerUser.map((u) => u.userId);
    getUserInfoBatch(ids).then((infos) => {
      const map: Record<string, ClerkUserInfo> = {};
      for (const info of infos) map[info.id] = info;
      setUserInfo(map);
    });
  }, [clicksPerUser]);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1736]">Statistik Platform</h1>
        <p className="text-gray-500 text-sm mt-1">
          Analitik mendalam penggunaan link dan pengakses platform
        </p>
      </div>

      {/* Section 1: Grafik Penggunaan Link (trend creation) */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-[#0193ff]" />
          <div>
            <h2 className="font-bold text-[#0b1736]">Grafik Penggunaan Link</h2>
            <p className="text-xs text-gray-400">Jumlah tautan baru dibuat per hari (30 hari terakhir)</p>
          </div>
        </div>
        <div className="h-75">
          {linksPerDay ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={linksPerDay}
                margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                    formatter={(val) => [val ?? 0, "Tautan dibuat"] as [number, string]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0193ff"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0193ff", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton />
          )}
        </div>
      </section>

      {/* Section 2: Grafik Pengakses Link (clicks) */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <MousePointerClick className="h-5 w-5 text-orange-500" />
          <div>
            <h2 className="font-bold text-[#0b1736]">Grafik Pengakses Link</h2>
            <p className="text-xs text-gray-400">Top 15 link berdasarkan jumlah klik</p>
          </div>
        </div>
        <div className="h-105">
          {topLinks ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topLinks.map((l) => ({
                  name: l.title ? l.title.slice(0, 18) + (l.title.length > 18 ? "…" : "") : l.shortCode,
                  shortCode: l.shortCode,
                  clicks: l.clicks,
                }))}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 11, fill: "#374151" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    fontSize: "13px",
                  }}
                  formatter={(val) => [(val as number ?? 0).toLocaleString("id-ID"), "Klik"] as [string, string]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.shortCode
                      ? `/${payload[0].payload.shortCode}`
                      : label
                  }
                />
                <Bar dataKey="clicks" radius={[0, 6, 6, 0]} barSize={20}>
                  {topLinks.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Skeleton />
          )}
        </div>
      </section>

      {/* Section 3: Distribusi Klik per Pengguna */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Users2 className="h-5 w-5 text-purple-500" />
            <div>
              <h2 className="font-bold text-[#0b1736]">Distribusi Klik per Pengguna</h2>
              <p className="text-xs text-gray-400">Top 10 pengguna berdasarkan total klik</p>
            </div>
          </div>
          <div className="h-75">
            {clicksPerUser ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clicksPerUser.map((u) => ({
                      name: shortName(userInfo[u.userId], u.userId),
                      fullName: userInfo[u.userId]?.name ?? u.userId,
                      value: u.clicks,
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {clicksPerUser.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [(val as number ?? 0).toLocaleString("id-ID"), "Klik"] as [string, string]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName ?? ""
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton />
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <div>
              <h2 className="font-bold text-[#0b1736]">Klik per Pengguna</h2>
              <p className="text-xs text-gray-400">Bar chart top 10 pengguna</p>
            </div>
          </div>
          <div className="h-75">
            {clicksPerUser ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={clicksPerUser.map((u) => ({
                    name: shortName(userInfo[u.userId], u.userId),
                    fullName: userInfo[u.userId]?.name ?? u.userId,
                    clicks: u.clicks,
                  }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [(val as number ?? 0).toLocaleString("id-ID"), "Klik"] as [string, string]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.fullName ?? label
                    }
                  />
                  <Bar dataKey="clicks" radius={[6, 6, 0, 0]} barSize={28}>
                    {clicksPerUser.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Skeleton />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-pulse text-gray-200 text-sm">Memuat data...</div>
    </div>
  );
}
