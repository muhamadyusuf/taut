"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format, formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  Ban,
  CheckCircle2,
  Fingerprint,
  Globe2,
  Loader2,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UserX,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";

const SEVERITY_BADGE: Record<string, string> = {
  malicious: "bg-danger-soft text-danger",
  suspicious: "bg-warning-soft text-warning",
  info: "bg-muted text-muted-foreground",
};

const SEVERITY_LABEL: Record<string, string> = {
  malicious: "Berbahaya",
  suspicious: "Mencurigakan",
  info: "Informasi",
};

/** Peramban & sistem operasi dari User-Agent, sekadar untuk dibaca sekilas. */
function shortUserAgent(ua?: string): string {
  if (!ua) return "—";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : /Firefox\//.test(ua) ? "Firefox"
    : /curl|wget|python|go-http|axios|bot|spider/i.test(ua) ? "Skrip/Bot"
    : "Lainnya";

  const os =
    /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : "";

  return os ? `${browser} · ${os}` : browser;
}

function lokasi(city?: string, country?: string): string {
  if (city && country) return `${city}, ${country}`;
  return city || country || "—";
}

export default function SecurityPage() {
  const [severity, setSeverity] = useState<string>("");
  const [onlyUnhandled, setOnlyUnhandled] = useState(true);

  const summary = useQuery(api.security.summary);
  const offenders = useQuery(api.security.topOffenders, { limit: 20 });
  const events = useQuery(api.security.listEvents, {
    severity: severity || undefined,
    onlyUnhandled,
    limit: 200,
  });

  const markHandled = useMutation(api.security.markHandled);
  const markAllHandled = useMutation(api.security.markAllHandled);
  const setBlocked = useMutation(api.security.setBlocked);

  const [busy, setBusy] = useState<string | null>(null);

  const toggleBlock = async (
    clerkId: string,
    blocked: boolean,
    label: string
  ) => {
    const alasan = blocked
      ? prompt(`Alasan memblokir ${label}? (akan terlihat oleh pemilik akun)`)
      : null;
    if (blocked && alasan === null) return;
    if (!blocked && !confirm(`Buka blokir untuk ${label}?`)) return;

    setBusy(clerkId);
    try {
      await setBlocked({ clerkId, blocked, reason: alasan ?? undefined });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status akun.");
    } finally {
      setBusy(null);
    }
  };

  if (summary === undefined) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ShieldAlert size={24} className="text-brand" />
          Jebakan &amp; Keamanan
        </h1>
        <p className="text-muted-foreground">
          Siapa yang mengetuk pintu yang tidak seharusnya diketuk, dari mana, dan
          seberapa sering.
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Kejadian 24 jam",
            value: summary.events24h,
            icon: ShieldAlert,
            tone: "text-foreground",
          },
          {
            label: "Berbahaya 24 jam",
            value: summary.malicious24h,
            icon: Ban,
            tone: summary.malicious24h > 0 ? "text-danger" : "text-foreground",
          },
          {
            label: "Pelaku berbeda",
            value: summary.uniqueActors,
            icon: Fingerprint,
            tone: "text-foreground",
          },
          {
            label: "Teridentifikasi akun",
            value: summary.identified,
            icon: UserX,
            tone: "text-foreground",
          },
        ].map((card) => (
          <div key={card.label} className="card-saweria p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              <card.icon size={14} />
              {card.label}
            </div>
            <p className={`mt-2 text-3xl font-bold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {summary.events24h === 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success-soft px-5 py-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-success" size={18} />
          <p className="text-sm text-success">
            Tidak ada yang menyentuh umpan dalam 24 jam terakhir. Halaman ini
            memang sebaiknya sepi — isinya baru berarti saat ada yang muncul.
          </p>
        </div>
      )}

      {/* Pelaku teratas */}
      <div className="card-saweria p-6">
        <h2 className="mb-1 font-bold text-foreground">Pelaku teratas</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Dikelompokkan per akun bila pelakunya sedang login, per alamat IP bila
          tidak. Akun jauh lebih berarti: IP berganti sendiri, akun tidak.
        </p>

        {offenders === undefined ? (
          <Loader2 className="animate-spin text-brand" />
        ) : offenders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Belum ada pelaku tercatat.
          </p>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2 font-bold">Identitas</th>
                  <th className="px-2 py-2 font-bold">Lokasi</th>
                  <th className="px-2 py-2 font-bold">Ketukan</th>
                  <th className="px-2 py-2 font-bold">Terakhir</th>
                  <th className="px-2 py-2 font-bold">Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {offenders.map((o) => (
                  <tr key={o.actorKey} className="border-b border-border/60">
                    <td className="px-2 py-3">
                      {o.userId ? (
                        <div className="min-w-0">
                          <p className="truncate font-bold text-foreground">
                            {o.name ?? "(tanpa nama)"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {o.email ?? o.userId}
                          </p>
                          {o.plan && (
                            <span className="mt-1 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                              {o.plan}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe2 size={14} />
                          <span className="font-mono text-xs">
                            {o.ip ?? "anonim"}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin size={13} className="shrink-0" />
                        {lokasi(o.city ?? undefined, o.country ?? undefined)}
                      </span>
                      {o.userId && o.ip && (
                        <span className="mt-0.5 block font-mono text-[11px] text-subtle">
                          {o.ip}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3">
                      <span className="font-bold text-foreground">{o.hits}</span>
                      {o.malicious > 0 && (
                        <span className="ml-2 rounded-full bg-danger-soft px-2 py-0.5 text-[10px] font-bold text-danger">
                          {o.malicious} berbahaya
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">
                      {formatDistanceToNow(o.lastTs, {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </td>
                    <td className="px-2 py-3">
                      {o.userId ? (
                        <button
                          disabled={busy === o.userId}
                          onClick={() =>
                            toggleBlock(
                              o.userId!,
                              !o.blocked,
                              o.email ?? o.userId!
                            )
                          }
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                            o.blocked
                              ? "bg-success-soft text-success hover:opacity-80"
                              : "bg-danger-soft text-danger hover:opacity-80"
                          }`}
                        >
                          {busy === o.userId
                            ? "…"
                            : o.blocked
                              ? "Buka blokir"
                              : "Blokir akun"}
                        </button>
                      ) : (
                        <span
                          className="text-xs text-subtle"
                          title="Pemblokiran hanya berlaku untuk akun. Alamat IP berganti terlalu mudah untuk dijadikan dasar."
                        >
                          tanpa akun
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rekaman kejadian */}
      <div className="card-saweria p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-bold text-foreground">Rekaman kejadian</h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="input-field py-1.5 text-xs"
              aria-label="Saring keparahan"
            >
              <option value="">Semua keparahan</option>
              <option value="malicious">Berbahaya</option>
              <option value="suspicious">Mencurigakan</option>
              <option value="info">Informasi</option>
            </select>

            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyUnhandled}
                onChange={(e) => setOnlyUnhandled(e.target.checked)}
              />
              Belum ditinjau
            </label>

            <button
              onClick={async () => {
                if (!confirm("Tandai semua kejadian sudah ditinjau?")) return;
                await markAllHandled({});
              }}
              className="rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:text-foreground"
            >
              Tandai semua
            </button>
          </div>
        </div>

        {events === undefined ? (
          <Loader2 className="animate-spin text-brand" />
        ) : events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Tidak ada kejadian yang cocok dengan saringan ini.
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li
                key={e._id}
                className={`rounded-xl border p-4 ${
                  e.handledAt ? "border-border opacity-60" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          SEVERITY_BADGE[e.severity] ?? SEVERITY_BADGE.info
                        }`}
                      >
                        {SEVERITY_LABEL[e.severity] ?? e.severity}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {e.kindLabel}
                      </span>
                      {e.hits > 1 && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                          {e.hits}× ketukan
                        </span>
                      )}
                    </div>

                    <p className="mt-1.5 break-all font-mono text-xs text-muted-foreground">
                      {e.method ? `${e.method} ` : ""}
                      {e.target}
                    </p>

                    {e.detail && (
                      <p className="mt-1 text-xs text-subtle">{e.detail}</p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Fingerprint size={12} />
                        {e.userId
                          ? (e.email ?? e.name ?? e.userId)
                          : "tidak login"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {lokasi(e.city, e.country)}
                      </span>
                      {e.ip && (
                        <span className="font-mono">{e.ip}</span>
                      )}
                      <span>{shortUserAgent(e.userAgent)}</span>
                      <span title={format(e.lastTs, "d MMM yyyy HH:mm:ss", { locale: localeId })}>
                        {formatDistanceToNow(e.lastTs, {
                          addSuffix: true,
                          locale: localeId,
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      markHandled({
                        id: e._id as Id<"security_events">,
                        handled: !e.handledAt,
                      })
                    }
                    className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      e.handledAt
                        ? "bg-muted text-muted-foreground"
                        : "bg-success-soft text-success hover:opacity-80"
                    }`}
                  >
                    <CheckCircle2 size={13} />
                    {e.handledAt ? "Buka lagi" : "Tandai ditinjau"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-subtle">
        Catatan ini memuat alamat IP dan identitas akun, dan terhapus sendiri
        setelah 90 hari. Isinya hanya kejadian keamanan — bukan perilaku
        penjelajahan pengguna biasa.
      </p>
    </div>
  );
}
