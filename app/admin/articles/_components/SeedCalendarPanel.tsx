"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CalendarRange,
  Check,
  Loader2,
  Sparkles,
  TriangleAlert,
  Undo2,
  X,
} from "lucide-react";

function toDateTimeLocal(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Besok pukul 09.00 waktu lokal admin
function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

type Result = {
  created: number;
  skipped: number;
  total: number;
  firstAt: number | null;
  lastAt: number | null;
};

export default function SeedCalendarPanel() {
  const status = useQuery(api.seed.getSeedStatus);
  const seedArticles = useMutation(api.seed.seedScheduledArticles);
  const removeSeed = useMutation(api.seed.removeUnpublishedSeedArticles);

  const [open, setOpen] = useState(false);
  const [startAt, setStartAt] = useState(() => toDateTimeLocal(defaultStart()));
  const [intervalDays, setIntervalDays] = useState(3);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (status === undefined) return null;

  const startTs = new Date(startAt).getTime();
  const validStart = !Number.isNaN(startTs);
  const spanDays = (status.remaining - 1) * intervalDays;
  const endTs = validStart ? startTs + spanDays * 24 * 60 * 60 * 1000 : 0;

  const handleSeed = async () => {
    setRunning(true);
    setError("");
    try {
      const res = await seedArticles({
        startAt: validStart ? startTs : undefined,
        intervalDays,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengimpor artikel.");
    } finally {
      setRunning(false);
    }
  };

  const handleRemove = async () => {
    setRunning(true);
    try {
      await removeSeed();
      setResult(null);
      setConfirmRemove(false);
      setOpen(false);
    } finally {
      setRunning(false);
    }
  };

  return (
    <>
      {/* Kartu ringkas di halaman daftar artikel */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-info-soft text-info">
          <CalendarRange className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground">Kalender Editorial SEO</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {status.imported === 0
              ? `${status.total} topik siap dijadwalkan bertahap ke depan, tersebar di ${status.categories.length} kategori.`
              : status.remaining === 0
                ? `Seluruh ${status.total} topik sudah masuk ke daftar artikel.`
                : `${status.imported} dari ${status.total} topik sudah diimpor — sisa ${status.remaining} topik.`}
          </p>
        </div>

        {status.remaining > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover"
          >
            <Sparkles className="h-4 w-4" />
            Atur Jadwal
          </button>
        )}
      </div>

      {/* Dialog pengaturan jadwal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-bold text-foreground">
                Jadwalkan Kalender Editorial
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-subtle hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {result ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-success-soft px-4 py-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <div className="text-sm text-foreground">
                      <p className="font-semibold">
                        {result.created} artikel berhasil dijadwalkan.
                      </p>
                      {result.skipped > 0 && (
                        <p className="mt-0.5 text-muted-foreground">
                          {result.skipped} topik dilewati karena slugnya sudah ada.
                        </p>
                      )}
                      {result.firstAt && result.lastAt && (
                        <p className="mt-1.5 text-muted-foreground">
                          Terbit bertahap dari {formatDate(result.firstAt)} sampai{" "}
                          {formatDate(result.lastAt)}.
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Artikel bisa Anda sunting kapan saja lewat daftar di bawah.
                    Yang belum sampai tanggal terbitnya tidak tampil di halaman
                    blog publik dan tidak masuk sitemap.
                  </p>

                  <button
                    onClick={() => {
                      setResult(null);
                      setOpen(false);
                    }}
                    className="w-full rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-hover"
                  >
                    Selesai
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3 rounded-xl border border-border bg-warning-soft px-4 py-3">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <p className="text-xs leading-relaxed text-foreground">
                      Sunting isinya sesuai gaya bahasa Anda sebelum tanggal
                      terbit. Artikel yang dibiarkan seragam apa adanya justru
                      berisiko dinilai sebagai konten massal oleh mesin pencari.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Artikel pertama terbit
                    </label>
                    <input
                      type="datetime-local"
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      className="w-full rounded-xl border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                      Jarak antarartikel
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[2, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          onClick={() => setIntervalDays(d)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                            intervalDays === d
                              ? "bg-brand text-brand-contrast"
                              : "border border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {d} hari
                        </button>
                      ))}
                    </div>
                  </div>

                  {validStart && status.remaining > 0 && (
                    <div className="rounded-xl bg-muted px-4 py-3 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {status.remaining} artikel
                        </span>{" "}
                        akan terbit bertahap dari{" "}
                        <span className="font-semibold text-foreground">
                          {formatDate(startTs)}
                        </span>{" "}
                        sampai{" "}
                        <span className="font-semibold text-foreground">
                          {formatDate(endTs)}
                        </span>
                        .
                      </p>
                      <p className="mt-1 text-xs text-subtle">
                        Sekitar {Math.round(spanDays / 30)} bulan · topik dari 10
                        kategori diselang-seling, bukan berurutan per kategori.
                      </p>
                    </div>
                  )}

                  {error && (
                    <p className="text-sm text-danger">{error}</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSeed}
                      disabled={running || !validStart}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-contrast hover:bg-brand-hover disabled:opacity-50"
                    >
                      {running ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                      Jadwalkan {status.remaining} Artikel
                    </button>
                  </div>

                  {status.imported > 0 && (
                    <button
                      onClick={() => setConfirmRemove(true)}
                      className="flex w-full items-center justify-center gap-1.5 pt-1 text-xs font-semibold text-danger hover:opacity-80"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      Batalkan impor sebelumnya
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi pembatalan impor */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-card p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft">
              <Undo2 className="h-6 w-6 text-danger" />
            </div>
            <h3 className="font-bold text-foreground">Batalkan Impor?</h3>
            <p className="text-sm text-muted-foreground">
              Hanya artikel hasil impor yang <strong>belum tayang</strong> dan
              belum pernah dibaca yang akan dihapus. Artikel yang sudah terbit
              atau sudah Anda sunting tetap aman.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRemove(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Batal
              </button>
              <button
                onClick={handleRemove}
                disabled={running}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {running && <Loader2 className="h-4 w-4 animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
