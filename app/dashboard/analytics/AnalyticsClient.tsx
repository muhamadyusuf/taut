"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { numberLocale } from "@/lib/i18n/dateLocale";

export default function AnalyticsClient() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.analytics;
  const numLocale = numberLocale(locale);
  const data = useQuery(api.analytics.getOverview, {});

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (data === null) return null;

  const summary = [
    {
      label: t.totalAllTime,
      value: data.totalAllTime.toLocaleString(numLocale),
      tone: "text-brand",
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
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      <div className="card-saweria p-6">
        <h3 className="mb-4 font-bold text-foreground">{t.topLinksTitle}</h3>
        {data.topLinks.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t.topLinksEmpty}
          </p>
        ) : (
          <ul className="space-y-3">
            {data.topLinks.map((row) => {
              const max = data.topLinks[0]?.count ?? 0;
              return (
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
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
