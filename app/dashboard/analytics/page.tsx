"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  return (
    <div className="max-w-5xl mx-auto space-y-8">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
            <p className="text-gray-500">Overview of your link performance.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-500 uppercase">Total Clicks</p>
                <p className="text-4xl font-bold text-[#ee6123] mt-2">{totalClicks}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-500 uppercase">Active Links</p>
                <p className="text-4xl font-bold text-[#0b1736] mt-2">{links?.length || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm font-bold text-gray-500 uppercase">Top Performer</p>
                <p className="text-xl font-bold text-green-600 mt-2 truncate">
                    {chartData?.[0]?.name || "-"}
                </p>
            </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Top 5 Performing Links</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{fill: '#f3f4f6'}}
                        />
                        <Bar dataKey="clicks" radius={[0, 4, 4, 0]} barSize={30}>
                             {chartData?.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#ee6123' : '#0b1736'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
}