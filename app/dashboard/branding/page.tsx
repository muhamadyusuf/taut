"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Lock, Palette, Save } from "lucide-react";
import { PLANS } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";

export default function BrandingPage() {
  const data = useQuery(api.brand.getMyBrand);
  const saveBrand = useMutation(api.brand.saveBrand);

  const [enabled, setEnabled] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0193ff");
  const [tagline, setTagline] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Isi formulir sekali begitu data dari server tiba.
  useEffect(() => {
    const s = data?.settings;
    if (!s) return;
    setEnabled(s.enabled);
    setDisplayName(s.displayName);
    setLogoUrl(s.logoUrl ?? "");
    setPrimaryColor(s.primaryColor ?? "#0193ff");
    setTagline(s.tagline ?? "");
    setCtaLabel(s.ctaLabel ?? "");
    setCtaUrl(s.ctaUrl ?? "");
  }, [data?.settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveBrand({
        enabled,
        displayName,
        logoUrl: logoUrl || undefined,
        primaryColor: primaryColor || undefined,
        tagline: tagline || undefined,
        ctaLabel: ctaLabel || undefined,
        ctaUrl: ctaUrl || undefined,
      });
      setSavedAt(Date.now());
    } catch (err) {
      alert(alertMessageFor(err, "Gagal menyimpan pengaturan merek."));
    } finally {
      setSaving(false);
    }
  };

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  // Belum berhak: tampilkan apa yang akan didapat, bukan formulir yang mati.
  if (!data?.canCustomize) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card-saweria p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Lock size={26} />
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Halaman antara bermerek Anda sendiri
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Alih-alih menghapus jeda lima detik, paket{" "}
            {PLANS.business.name} menyerahkannya kepada Anda: logo, warna, dan
            pesan Anda sendiri yang muncul sebelum pengunjung diteruskan ke
            tujuan.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Paket Anda sekarang: <strong>{PLANS[data?.plan ?? "free"].name}</strong>
          </p>
          <Link href="/dashboard/billing" className="mt-6 inline-block">
            <button className="btn-saweria px-8 py-3">
              Lihat paket {PLANS.business.name}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Palette size={22} className="text-brand" />
          Halaman Antara
        </h2>
        <p className="text-muted-foreground">
          Atur tampilan yang dilihat pengunjung sebelum diteruskan ke tautan
          tujuan Anda.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Saklar utama */}
        <div className="card-saweria flex items-start justify-between gap-4 p-6">
          <div>
            <p className="font-bold text-foreground">Pakai halaman bermerek</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Kalau dimatikan, tautan Anda melompat langsung ke tujuan tanpa
              halaman antara sama sekali.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              enabled ? "bg-brand" : "bg-border-strong"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="card-saweria space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              Nama merek <span className="text-danger">*</span>
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              required
              placeholder="Nama bisnis atau organisasi Anda"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              URL logo
            </label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="input-field w-full"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Harus https. Bentuk persegi paling rapi.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              Warna utama
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-card"
                aria-label="Pilih warna utama"
              />
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#0193ff"
                className="input-field w-40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              Pesan singkat
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={120}
              placeholder="Satu kalimat tentang Anda"
              className="input-field w-full"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                Label tombol
              </label>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                maxLength={30}
                placeholder="Kunjungi situs kami"
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                Tujuan tombol
              </label>
              <input
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                placeholder="https://..."
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-saweria flex items-center gap-2 px-8 py-3"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Simpan
          </button>
          {savedAt && (
            <span className="text-sm text-success">Tersimpan.</span>
          )}
        </div>
      </form>
    </div>
  );
}
