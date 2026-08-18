"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Ban, CheckCircle2, Flag, Loader2, ShieldAlert } from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const REASON_LABEL: Record<string, string> = {
  phishing: "Penipuan / phishing",
  malware: "Perangkat perusak",
  spam: "Spam",
  konten: "Konten tidak pantas",
  lainnya: "Lainnya",
};

const STATUS_BADGE: Record<string, string> = {
  active: "bg-success-soft text-success",
  flagged: "bg-warning-soft text-warning",
  blocked: "bg-danger-soft text-danger",
};

export default function AbuseReviewPage() {
  const [tab, setTab] = useState<"open" | "reviewed" | "dismissed">("open");
  const reports = useQuery(api.abuse.listReports, { status: tab });
  const flagged = useQuery(api.abuse.listFlaggedLinks);
  const setLinkStatus = useMutation(api.abuse.setLinkStatus);

  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (
    linkId: Id<"links">,
    status: string,
    reason?: string
  ) => {
    setBusy(linkId);
    try {
      await setLinkStatus({ linkId, status, reason });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ShieldAlert size={24} className="text-brand" />
          Tinjauan Penyalahgunaan
        </h1>
        <p className="text-muted-foreground">
          Laporan pengunjung dan tautan yang ditandai pemeriksaan keamanan.
        </p>
      </div>

      {/* Tautan yang sedang ditandai atau diblokir */}
      <div className="card-saweria p-6">
        <h2 className="mb-4 font-bold text-foreground">Tautan bermasalah</h2>
        {flagged === undefined ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        ) : flagged.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Tidak ada tautan yang sedang ditandai atau diblokir.
          </p>
        ) : (
          <ul className="space-y-3">
            {flagged.map((link) => (
              <li
                key={link._id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4"
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    STATUS_BADGE[link.status ?? "active"]
                  }`}
                >
                  {link.status}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">
                    /{link.shortCode}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {link.originalUrl}
                  </p>
                  {link.flagReason && (
                    <p className="mt-0.5 text-xs text-danger">{link.flagReason}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide(link._id, "active")}
                    disabled={busy === link._id}
                    className="flex items-center gap-1.5 rounded-lg bg-success-soft px-3 py-2 text-xs font-bold text-success"
                  >
                    <CheckCircle2 size={14} /> Pulihkan
                  </button>
                  <button
                    onClick={() =>
                      decide(link._id, "blocked", "Diblokir oleh admin")
                    }
                    disabled={busy === link._id}
                    className="flex items-center gap-1.5 rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger"
                  >
                    <Ban size={14} /> Blokir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Laporan pengunjung */}
      <div className="card-saweria p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <Flag size={18} className="text-brand" />
            Laporan pengunjung
          </h2>
          <div className="inline-flex gap-1 rounded-full border border-border p-1">
            {(["open", "reviewed", "dismissed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  tab === t
                    ? "bg-brand text-brand-contrast"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "open" ? "Terbuka" : t === "reviewed" ? "Ditindak" : "Ditolak"}
              </button>
            ))}
          </div>
        </div>

        {reports === undefined ? (
          <Loader2 className="h-5 w-5 animate-spin text-brand" />
        ) : reports.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Tidak ada laporan pada tab ini.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report._id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start gap-3">
                  <span className="rounded-full bg-danger-soft px-2.5 py-1 text-xs font-bold text-danger">
                    {REASON_LABEL[report.reason] ?? report.reason}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-foreground">
                      /{report.shortCode}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {report.originalUrl ?? "Tautan sudah dihapus"}
                    </p>
                    {report.note && (
                      <p className="mt-1 text-xs text-foreground">“{report.note}”</p>
                    )}
                    <p className="mt-1 text-[11px] text-subtle">
                      {format(new Date(report.createdAt), "d MMM yyyy HH:mm", {
                        locale: localeId,
                      })}
                    </p>
                  </div>

                  {tab === "open" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => decide(report.linkId, "active")}
                        className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground"
                      >
                        Tolak laporan
                      </button>
                      <button
                        onClick={() =>
                          decide(
                            report.linkId,
                            "blocked",
                            `Dilaporkan: ${REASON_LABEL[report.reason] ?? report.reason}`
                          )
                        }
                        className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-bold text-danger"
                      >
                        Blokir tautan
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
