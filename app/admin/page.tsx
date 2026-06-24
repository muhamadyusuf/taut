"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
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
  Cell,
} from "recharts";
import {
  Link as LinkIcon,
  Users,
  MousePointerClick,
  Smartphone,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

export default function AdminOverviewPage() {
  const stats = useQuery(api.admin.getAdminStats);
  const linksPerDay = useQuery(api.admin.getLinksCreatedPerDay);
  const topLinks = useQuery(api.admin.getTopLinksByClicks, { limit: 10 });

  const isLoading = stats === undefined;

  const statCards = [
    {
      label: "Total Pengguna",
      value: stats?.totalUsers ?? "-",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Link",
      value: stats?.totalLinks ?? "-",
      icon: LinkIcon,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Total Klik",
      value: stats?.totalClicks ?? "-",
      icon: MousePointerClick,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      label: "Total Microsite",
      value: stats?.totalMicrosites ?? "-",
      icon: Smartphone,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Toko",
      value: stats?.totalShops ?? "-",
      icon: ShoppingBag,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Total Pesanan",
      value: stats?.totalOrders ?? "-",
      icon: ShoppingCart,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1736]">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan seluruh aktivitas platform singkat.in
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${isLoading ? "animate-pulse text-gray-200" : "text-[#0b1736]"}`}>
                {isLoading ? "..." : card.value.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Links Created Per Day */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-[#0193ff]" />
            <h2 className="font-bold text-[#0b1736]">Tautan Dibuat per Hari</h2>
            <span className="ml-auto text-xs text-gray-400">30 hari terakhir</span>
          </div>
          <div className="h-65">
            {linksPerDay ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={linksPerDay}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    interval={4}
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
                    formatter={(val) => [val ?? 0, "Tautan"] as [number, string]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0193ff"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "#0193ff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-300">Memuat...</div>
              </div>
            )}
          </div>
        </div>

        {/* Top Links by Clicks */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <MousePointerClick className="h-5 w-5 text-orange-500" />
            <h2 className="font-bold text-[#0b1736]">Top 10 Link Terbanyak Diklik</h2>
          </div>
          <div className="h-65">
            {topLinks ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topLinks.map((l) => ({
                    name: l.title || l.shortCode,
                    clicks: l.clicks,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fontSize: 10, fill: "#374151" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [(val as number ?? 0).toLocaleString("id-ID"), "Klik"] as [string, string]}
                  />
                  <Bar dataKey="clicks" radius={[0, 6, 6, 0]} barSize={18}>
                    {topLinks.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? "#ee6123" : index < 3 ? "#0193ff" : "#0b1736"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-gray-300">Memuat...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
