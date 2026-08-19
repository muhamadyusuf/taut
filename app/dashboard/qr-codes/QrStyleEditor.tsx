"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QRCode } from "react-qrcode-logo";
import { Loader2, Lock, RotateCcw, Save, Wand2 } from "lucide-react";
import { planName, type PlanId } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export type QrStyle = {
  fgColor: string;
  bgColor: string;
  logoUrl?: string;
  logoSizeRatio: number;
  dotStyle: string;
  quietZone: number;
};

const DOT_STYLES = ["squares", "dots", "fluid"] as const;

/** Kunci-nya dipakai untuk mencari label di kamus, bukan ditampilkan apa adanya. */
const PRESETS = [
  { key: "classic", fg: "#000000", bg: "#ffffff" },
  { key: "blue", fg: "#0a2970", bg: "#ffffff" },
  { key: "green", fg: "#14532d", bg: "#f0fdf4" },
  { key: "maroon", fg: "#7f1d1d", bg: "#fef2f2" },
] as const;

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
  const locale = useLocale();
  const dict = getDictionary(locale).dashboard;
  const t = dict.qrStyle;
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
      alert(alertMessageFor(err, t.saveFailed));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t.resetConfirm)) return;
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
          <p className="font-bold text-foreground">{t.lockedTitle}</p>
          <p className="text-sm text-muted-foreground">
            {t.lockedBody(planName("pro", locale), planName(plan, locale))}
          </p>
        </div>
        <Link href="/dashboard/billing" className="shrink-0">
          <button className="btn-saweria px-6 py-2.5">{t.lockedCta}</button>
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
          {t.openButton}
        </button>
      </div>
    );
  }

  return (
    <div className="card-saweria mb-8 p-6">
      <h3 className="mb-5 flex items-center gap-2 font-bold text-foreground">
        <Wand2 size={18} className="text-brand" />
        {t.heading}
      </h3>

      <div className="grid gap-8 md:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          {/* Preset cepat */}
          <div>
            <p className="mb-2 text-sm font-bold text-foreground">{t.presetLabel}</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
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
                  {t.presets[p.key]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                {t.fgLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.fgColor}
                  onChange={(e) => set("fgColor", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card"
                  aria-label={t.fgLabel}
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
                {t.bgLabel}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.bgColor}
                  onChange={(e) => set("bgColor", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card"
                  aria-label={t.bgLabel}
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
              {t.dotShapeLabel}
            </label>
            <div className="flex gap-2">
              {DOT_STYLES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("dotStyle", value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-bold transition-colors ${
                    draft.dotStyle === value
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border text-muted-foreground hover:border-brand"
                  }`}
                >
                  {t.dotStyles[value]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              {t.logoUrlLabel}{" "}
              <span className="font-normal text-muted-foreground">{t.logoUrlHint}</span>
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
              {t.logoSizeLabel(Math.round(draft.logoSizeRatio * 100))}
            </label>
            <input
              type="range"
              min={10}
              max={30}
              value={Math.round(draft.logoSizeRatio * 100)}
              onChange={(e) => set("logoSizeRatio", Number(e.target.value) / 100)}
              className="w-full accent-[var(--brand)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">{t.logoSizeHint}</p>
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
          <p className="text-xs text-muted-foreground">{t.preview}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-saweria flex items-center gap-2 px-6 py-2.5"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {dict.common.save}
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost px-6 py-2.5">
          {dict.common.cancel}
        </button>
        <button
          onClick={handleReset}
          className="ml-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-danger"
        >
          <RotateCcw size={14} />
          {t.reset}
        </button>
      </div>
    </div>
  );
}
