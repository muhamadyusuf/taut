"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Lock, Palette, Save } from "lucide-react";
import { planName } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function BrandingPage() {
  const locale = useLocale();
  const dict = getDictionary(locale).dashboard;
  const t = dict.branding;
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
      alert(alertMessageFor(err, t.saveFailed));
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
          <h2 className="text-xl font-bold text-foreground">{t.lockedTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t.lockedBody(planName("business", locale))}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.currentPlan(planName(data?.plan ?? "free", locale))}
          </p>
          <Link href="/dashboard/billing" className="mt-6 inline-block">
            <button className="btn-saweria px-8 py-3">
              {t.seePlan(planName("business", locale))}
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
          {t.title}
        </h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Saklar utama */}
        <div className="card-saweria flex items-start justify-between gap-4 p-6">
          <div>
            <p className="font-bold text-foreground">{t.toggleTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.toggleHint}</p>
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
              {t.nameLabel} <span className="text-danger">*</span>
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60}
              required
              placeholder={t.namePlaceholder}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              {t.logoLabel}
            </label>
            <input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://..."
              className="input-field w-full"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t.logoHint}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground">
              {t.colorLabel}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-card"
                aria-label={t.colorAria}
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
              {t.taglineLabel}
            </label>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={120}
              placeholder={t.taglinePlaceholder}
              className="input-field w-full"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                {t.ctaLabelLabel}
              </label>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                maxLength={30}
                placeholder={t.ctaLabelPlaceholder}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-bold text-foreground">
                {t.ctaUrlLabel}
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
            {dict.common.save}
          </button>
          {savedAt && (
            <span className="text-sm text-success">{t.saved}</span>
          )}
        </div>
      </form>
    </div>
  );
}
