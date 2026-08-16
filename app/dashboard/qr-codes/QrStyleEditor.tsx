"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCode } from "react-qrcode-logo";
import { Loader2, Lock, RotateCcw, Save, Wand2 } from "lucide-react";
import { PLANS, type PlanId } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";

export type QrStyle = {
  fgColor: string;
  bgColor: string;
  logoUrl?: string;
  logoSizeRatio: number;
  dotStyle: string;
  quietZone: number;
};

const DOT_STYLES = [
  { value: "squares", label: "Kotak" },
  { value: "dots", label: "Bulat" },
  { value: "fluid", label: "Menyatu" },
];

const PRESETS: { label: string; fg: string; bg: string }[] = [
  { label: "Klasik", fg: "#000000", bg: "#ffffff" },
  { label: "Biru", fg: "#0a2970", bg: "#ffffff" },
  { label: "Hijau", fg: "#14532d", bg: "#f0fdf4" },
  { label: "Marun", fg: "#7f1d1d", bg: "#fef2f2" },
];

export default function QrStyleEditor({
  style,
  canCustomize,
  plan,
  previewValue,
}: {
  style: QrStyle;
  canCustomize: boolean;
  plan: PlanId;
  previewValue: string;
}) {
  const saveSettings = useMutation(api.qr.saveSettings);
  const resetSettings = useMutation(api.qr.resetSettings);

  const [draft, setDraft] = useState<QrStyle>(style);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof QrStyle>(key: K, value: QrStyle[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings({
        fgColor: draft.fgColor,
        bgColor: draft.bgColor,
        logoUrl: draft.logoUrl || undefined,
        logoSizeRatio: draft.logoSizeRatio,
        dotStyle: draft.dotStyle,
        quietZone: draft.quietZone,
      });
      setOpen(false);
    } catch (err) {
      alert(alertMessageFor(err, "Gagal menyimpan gaya QR."));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Kembalikan ke gaya bawaan singkat.in?")) return;
    await resetSettings({});
    setOpen(false);
  };

  if (!canCustomize) {
    return (
      <div className="card-saweria mb-8 flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Lock size={20} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground">QR dengan warna &amp; logo Anda</p>
          <p className="text-sm text-muted-foreground">
            Paket {PLANS.pro.name} membuka warna kustom, logo sendiri, bentuk
            modul, dan unduhan SVG untuk cetak besar. Paket Anda sekarang:{" "}
            {PLANS[plan].name}.
          </p>
        </div>
        <Link href="/dashboard/billing" className="shrink-0">
          <button className="btn-saweria px-6 py-2.5">Lihat paket</button>
        </Link>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mb-8">
        <button
          onClick={() => setOpen(true)}
          className="btn-ghost flex items-center gap-2 px-5 py-2.5"
        >
          <Wand2 size={16} />
          Ubah gaya QR
        </button>
      </div>
    );
  }

  return (
    <div className="card-saweria mb-8 p-6">
      <h3 className="mb-5 flex items-center gap-2 font-bold text-foreground">
        <Wand2 size={18} className="text-brand" />
        Gaya QR
      </h3>

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          {/* Preset cepat */}
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">Preset</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    set("fgColor", p.fg);
                    set("bgColor", p.bg);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-brand"
                >
                  <span
                    className="h-4 w-4 rounded border border-border"
                    style={{ background: p.fg }}
                  />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                Warna kode
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.fgColor}
                  onChange={(e) => set("fgColor", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card"
                  aria-label="Warna kode"
                />
                <input
                  value={draft.fgColor}
                  onChange={(e) => set("fgColor", e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                Warna latar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.bgColor}
                  onChange={(e) => set("bgColor", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card"
                  aria-label="Warna latar"
                />
                <input
                  value={draft.bgColor}
                  onChange={(e) => set("bgColor", e.target.value)}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              Bentuk modul
            </label>
            <div className="flex gap-2">
              {DOT_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("dotStyle", s.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
                    draft.dotStyle === s.value
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border text-muted-foreground hover:border-brand"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              URL logo <span className="font-normal text-muted-foreground">(kosongkan untuk tanpa logo)</span>
            </label>
            <input
              value={draft.logoUrl ?? ""}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="https://..."
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              Ukuran logo — {Math.round(draft.logoSizeRatio * 100)}%
            </label>
            <input
              type="range"
              min={10}
              max={30}
              value={Math.round(draft.logoSizeRatio * 100)}
              onChange={(e) => set("logoSizeRatio", Number(e.target.value) / 100)}
              className="w-full accent-[var(--brand)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Di atas 30% logo menutupi terlalu banyak modul dan QR mulai gagal
              dipindai.
            </p>
          </div>
        </div>

        {/* Pratinjau langsung */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="rounded-xl border border-border p-3"
            style={{ background: draft.bgColor }}
          >
            <QRCode
              value={previewValue}
              size={160}
              ecLevel="H"
              fgColor={draft.fgColor}
              bgColor={draft.bgColor}
              logoImage={draft.logoUrl || undefined}
              logoWidth={160 * draft.logoSizeRatio}
              logoHeight={160 * draft.logoSizeRatio}
              logoOpacity={1}
              quietZone={draft.quietZone}
              qrStyle={draft.dotStyle as "squares" | "dots" | "fluid"}
            />
          </div>
          <p className="text-xs text-muted-foreground">Pratinjau</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-saweria flex items-center gap-2 px-6 py-2.5"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost px-6 py-2.5">
          Batal
        </button>
        <button
          onClick={handleReset}
          className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-danger"
        >
          <RotateCcw size={14} />
          Kembalikan ke bawaan
        </button>
      </div>
    </div>
  );
}
