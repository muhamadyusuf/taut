"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  CHART_COLORS,
  CHART_CURSOR,
  CHART_GRID,
  CHART_LABEL_TICK,
  CHART_TOOLTIP,
} from "@/app/_components/chartStyles";

export default function AnalyticsPage() {
  const links = useQuery(api.links.getMyLinks);

  // Siapkan data untuk chart (Top 5 Links)
  const chartData = links
    ?.slice()
    .sort((a, b) => b.clicks - a.clicks) // Urutkan dari klik terbanyak
    .slice(0, 5) // Ambil 5 teratas
    .map(link => ({
      name: link.title || link.shortCode,
      clicks: link.clicks,
      shortCode: link.shortCode
    }));

  const totalClicks = links?.reduce((acc, curr) => acc + curr.clicks, 0) || 0;

  const summary = [
    { label: "Total Clicks", value: totalClicks, tone: "text-brand" },
    { label: "Active Links", value: links?.length || 0, tone: "text-foreground" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground">Ringkasan performa tautanmu.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summary.map((item) => (
          <div key={item.label} className="card-saweria p-6">
            <p className="text-sm font-bold text-muted-foreground uppercase">{item.label}</p>
            <p className={`text-4xl font-bold mt-2 ${item.tone}`}>{item.value}</p>
          </div>
        ))}
        <div className="card-saweria p-6">
          <p className="text-sm font-bold text-muted-foreground uppercase">Top Performer</p>
          <p className="text-xl font-bold text-success mt-2 truncate">
            {chartData?.[0]?.name || "-"}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card-saweria p-6">
        <h3 className="font-bold text-foreground mb-6">Top 5 Performing Links</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={CHART_GRID} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} tick={CHART_LABEL_TICK} tickLine={false} axisLine={false} />
              <Tooltip {...CHART_TOOLTIP} cursor={CHART_CURSOR} />
              <Bar dataKey="clicks" radius={[0, 4, 4, 0]} barSize={30}>
                {chartData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
