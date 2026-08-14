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
import { CHART_COLORS } from "@/app/_components/chartStyles";
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
      color: "text-brand",
      bg: "bg-brand-soft",
    },
    {
      label: "Total Link",
      value: stats?.totalLinks ?? "-",
      icon: LinkIcon,
      color: "text-info",
      bg: "bg-info-soft",
    },
    {
      label: "Total Klik",
      value: stats?.totalClicks ?? "-",
      icon: MousePointerClick,
      color: "text-warning",
      bg: "bg-warning-soft",
    },
    {
      label: "Total Microsite",
      value: stats?.totalMicrosites ?? "-",
      icon: Smartphone,
      color: "text-info",
      bg: "bg-info-soft",
    },
    {
      label: "Total Toko",
      value: stats?.totalShops ?? "-",
      icon: ShoppingBag,
      color: "text-success",
      bg: "bg-success-soft",
    },
    {
      label: "Total Pesanan",
      value: stats?.totalOrders ?? "-",
      icon: ShoppingCart,
      color: "text-danger",
      bg: "bg-danger-soft",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Admin</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ringkasan seluruh aktivitas platform singkat.in
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${isLoading ? "animate-pulse text-subtle" : "text-foreground"}`}>
                {isLoading ? "..." : card.value.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Links Created Per Day */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-brand" />
            <h2 className="font-bold text-foreground">Tautan Dibuat per Hari</h2>
            <span className="ml-auto text-xs text-subtle">30 hari terakhir</span>
          </div>
          <div className="h-65">
            {linksPerDay ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={linksPerDay}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card-elevated)", color: "var(--foreground)",
                      boxShadow: "var(--shadow-card-hover)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [val ?? 0, "Tautan"] as [number, string]}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="var(--brand)"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: "var(--brand)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-subtle">Memuat...</div>
              </div>
            )}
          </div>
        </div>

        {/* Top Links by Clicks */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-6">
            <MousePointerClick className="h-5 w-5 text-warning" />
            <h2 className="font-bold text-foreground">Top 10 Link Terbanyak Diklik</h2>
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
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fontSize: 10, fill: "var(--foreground)" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card-elevated)", color: "var(--foreground)",
                      boxShadow: "var(--shadow-card-hover)",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [(val as number ?? 0).toLocaleString("id-ID"), "Klik"] as [string, string]}
                  />
                  <Bar dataKey="clicks" radius={[0, 6, 6, 0]} barSize={18}>
                    {topLinks.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-subtle">Memuat...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
