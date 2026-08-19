"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Globe, Loader2, Lock, MonitorSmartphone, Share2 } from "lucide-react";
import {
  CHART_AXIS_TICK,
  CHART_GRID,
  CHART_TOOLTIP,
} from "@/app/_components/chartStyles";
import { isUnlimited, planName } from "@/convex/plans";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocale, numberLocale } from "@/lib/i18n/dateLocale";

const RANGES = [7, 30, 90];

/** Daftar peringkat sederhana dengan bilah proporsi. */
function Breakdown({
  title,
  icon,
  rows,
  empty,
  numLocale,
}: {
  title: string;
  icon: React.ReactNode;
  rows: { label: string; count: number }[];
  empty: string;
  numLocale: string;
}) {
  const max = rows[0]?.count ?? 0;

  return (
    <div className="card-saweria p-6">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
        {icon}
        {title}
      </h3>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-foreground">{row.label}</span>
                <span className="shrink-0 text-sm font-bold text-muted-foreground">
                  {row.count.toLocaleString(numLocale)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${max > 0 ? (row.count / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AnalyticsClient() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.analytics;
  const numLocale = numberLocale(locale);
  const [days, setDays] = useState(30);
  const data = useQuery(api.analytics.getOverview, { days });
  const events = useQuery(api.analytics.getRecentEvents, { limit: 15 });

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (data === null) return null;

  const retentionLabel = isUnlimited(data.retentionDays)
    ? t.unlimited
    : t.days(data.retentionDays);

  const summary = [
    {
      label: t.clicksInRange(data.rangeDays),
      value: data.totalInRange.toLocaleString(numLocale),
      tone: "text-brand",
    },
    {
      label: t.totalAllTime,
      value: data.totalAllTime.toLocaleString(numLocale),
      tone: "text-foreground",
    },
    {
      label: t.activeLinks,
      value: data.activeLinks.toLocaleString(numLocale),
      tone: "text-foreground",
    },
    {
      label: t.topLink,
      value: data.topLinks[0]?.label ?? "—",
      tone: "text-success",
      small: true,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
          <p className="text-muted-foreground">{t.subtitle(retentionLabel)}</p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {RANGES.map((rangeDays) => {
            const beyondPlan =
              !isUnlimited(data.retentionDays) && rangeDays > data.retentionDays;
            return (
              <button
                key={rangeDays}
                onClick={() => setDays(rangeDays)}
                disabled={beyondPlan}
                title={
                  beyondPlan
                    ? t.rangeLocked(planName(data.plan, locale), retentionLabel)
                    : undefined
                }
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  days === rangeDays
                    ? "bg-brand text-brand-contrast"
                    : beyondPlan
                      ? "cursor-not-allowed text-subtle"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.days(rangeDays)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ringkasan angka */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="card-saweria p-6">
            <p className="text-sm font-bold uppercase text-muted-foreground">
              {item.label}
            </p>
            <p
              className={`mt-2 font-bold ${item.tone} ${
                item.small ? "truncate text-xl" : "text-4xl"
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Grafik deret waktu */}
      <div className="card-saweria p-6">
        <h3 className="mb-6 font-bold text-foreground">{t.chartTitle}</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.timeseries}>
              <defs>
                <linearGradient id="clickFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis
                dataKey="date"
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: string) =>
                  format(new Date(`${value}T00:00:00`), "d MMM", { locale: dateLocale(locale) })
                }
                minTickGap={24}
              />
              <YAxis tick={CHART_AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
              <Tooltip
                {...CHART_TOOLTIP}
                labelFormatter={(value: string) =>
                  format(new Date(`${value}T00:00:00`), "EEEE, d MMMM yyyy", {
                    locale: dateLocale(locale),
                  })
                }
                formatter={(value?: number) => [
                  (value ?? 0).toLocaleString(numLocale),
                  t.clicksTooltip,
                ]}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="var(--brand)"
                strokeWidth={2}
                fill="url(#clickFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rincian — hanya paket berbayar */}
      {data.hasDetailed ? (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            <Breakdown
              title={t.countries}
              icon={<Globe size={18} className="text-brand" />}
              rows={data.topCountries}
              empty={t.countriesEmpty}
              numLocale={numLocale}
            />
            <Breakdown
              title={t.devices}
              icon={<MonitorSmartphone size={18} className="text-brand" />}
              rows={data.topDevices}
              empty={t.devicesEmpty}
              numLocale={numLocale}
            />
            <Breakdown
              title={t.referrers}
              icon={<Share2 size={18} className="text-brand" />}
              rows={data.topReferrers}
              empty={t.referrersEmpty}
              numLocale={numLocale}
            />
          </div>

          {events && events.length > 0 && (
            <div className="card-saweria p-6">
              <h3 className="mb-4 font-bold text-foreground">{t.recentTitle}</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 font-bold">{t.colTime}</th>
                      <th className="pb-2 font-bold">{t.colLink}</th>
                      <th className="pb-2 font-bold">{t.colLocation}</th>
                      <th className="pb-2 font-bold">{t.colDevice}</th>
                      <th className="pb-2 font-bold">{t.colSource}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e) => (
                      <tr key={e.id} className="border-b border-border last:border-0">
                        <td className="py-2.5 text-muted-foreground">
                          {format(new Date(e.ts), "d MMM HH:mm", { locale: dateLocale(locale) })}
                        </td>
                        <td className="max-w-[160px] truncate py-2.5 text-foreground">
                          {e.linkTitle}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {[e.city, e.country].filter(Boolean).join(", ") || "—"}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {[e.device, e.browser].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td className="py-2.5 text-muted-foreground">
                          {e.referrerHost ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card-saweria flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <Lock size={20} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-foreground">{t.lockedTitle}</p>
            <p className="text-sm text-muted-foreground">
              {t.lockedBody(planName("pro", locale), retentionLabel)}
            </p>
          </div>
          <Link href="/dashboard/billing" className="shrink-0">
            <button className="btn-saweria px-6 py-2.5">{t.lockedCta}</button>
          </Link>
        </div>
      )}
    </div>
  );
}
