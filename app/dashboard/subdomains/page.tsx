"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Check,
  Globe,
  Loader2,
  Lock,
  Trash2,
  X,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { isUnlimited, planName } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function SubdomainsPage() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.subdomains;
  const data = useQuery(api.subdomains.getMine);
  const claim = useMutation(api.subdomains.claim);
  const release = useMutation(api.subdomains.release);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  // Pemeriksaan ketersediaan berjalan seiring ketikan, tapi hanya setelah
  // panjangnya masuk akal — memanggil server untuk satu huruf tidak berguna.
  const availability = useQuery(
    api.subdomains.checkAvailability,
    draft.trim().length >= 3 ? { subdomain: draft.trim() } : "skip"
  );

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await claim({ subdomain: draft.trim() });
      setDraft("");
    } catch (err) {
      alert(alertMessageFor(err, t.claimFailed));
    } finally {
      setBusy(false);
    }
  };

  const handleRelease = async (id: Id<"subdomains">, name: string) => {
    if (!confirm(t.releaseConfirm(name))) {
      return;
    }
    try {
      const result = await release({ id });
      alert(
        result.movedLinks > 0 ? t.releasedMoved(result.movedLinks) : t.released
      );
    } catch (err) {
      alert(alertMessageFor(err, t.releaseFailed));
    }
  };

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!data?.canClaim) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="card-saweria p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
            <Lock size={26} />
          </div>
          <h2 className="text-xl font-bold text-foreground">{t.lockedTitle}</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            {t.lockedBodyPrefix}{" "}
            <span className="font-bold text-foreground">{t.lockedBodyExample}</span>{" "}
            {t.lockedBodySuffix(planName("pro", locale))}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.currentPlan(planName(data?.plan ?? "free", locale))}
          </p>
          <Link href="/dashboard/billing" className="mt-6 inline-block">
            <button className="btn-saweria px-8 py-3">{t.seePlans}</button>
          </Link>
        </div>
      </div>
    );
  }

  const limitLabel = isUnlimited(data.limit) ? t.unlimited : `${data.limit}`;
  const atLimit = !isUnlimited(data.limit) && data.subdomains.length >= data.limit;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Globe size={22} className="text-brand" />
          {t.title}
        </h2>
        <p className="text-muted-foreground">
          {t.usage(data.subdomains.length, limitLabel)}
        </p>
      </div>

      {/* Daftar yang dimiliki */}
      {data.subdomains.length > 0 && (
        <div className="space-y-3">
          {data.subdomains.map((row) => (
            <div
              key={row._id}
              className="card-saweria flex flex-wrap items-center gap-4 p-5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success-soft text-success">
                <Check size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-foreground">
                  {row.subdomain}.singkat.in
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.activeHint}
                </p>
              </div>
              <button
                onClick={() => handleRelease(row._id, row.subdomain)}
                className="rounded-lg p-2 text-subtle transition hover:bg-danger-soft hover:text-danger"
                title={t.releaseTitle}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulir klaim */}
      {atLimit ? (
        <div className="surface-panel p-5 text-sm text-muted-foreground">
          {t.atLimit(planName(data.plan, locale), planName("business", locale))}
        </div>
      ) : (
        <form onSubmit={handleClaim} className="card-saweria space-y-4 p-6">
          <label className="block text-sm font-bold text-foreground">
            {t.claimLabel}
          </label>

          <div className="flex items-stretch gap-0">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.toLowerCase())}
              placeholder={t.claimPlaceholder}
              maxLength={32}
              className="input-field w-full rounded-r-none"
              required
            />
            <span className="flex items-center rounded-r-xl border border-l-0 border-border bg-muted px-4 text-sm font-bold text-muted-foreground">
              .singkat.in
            </span>
          </div>

          {/* Umpan balik ketersediaan */}
          {draft.trim().length >= 3 && availability && (
            <p
              className={`flex items-center gap-1.5 text-sm ${
                availability.available ? "text-success" : "text-danger"
              }`}
            >
              {availability.available ? <Check size={14} /> : <X size={14} />}
              {availability.available ? t.available : availability.reason}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || (availability ? !availability.available : true)}
            className="btn-saweria flex items-center gap-2 px-8 py-3 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {t.claimButton}
          </button>

          <p className="text-xs text-muted-foreground">{t.claimHint}</p>
        </form>
      )}
    </div>
  );
}
