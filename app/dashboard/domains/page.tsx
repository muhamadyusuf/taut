"use client";

import { useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Loader2,
  Lock,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { planName } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

/** Label statusnya diambil dari kamus; yang di sini hanya warna & ikonnya. */
const STATUS_VIEW: Record<string, { className: string; icon: React.ReactNode }> = {
  active: {
    className: "bg-success-soft text-success",
    icon: <CheckCircle2 size={14} />,
  },
  pending: {
    className: "bg-warning-soft text-warning",
    icon: <Clock size={14} />,
  },
  error: {
    className: "bg-danger-soft text-danger",
    icon: <AlertCircle size={14} />,
  },
};

export default function DomainsPage() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.domains;
  const data = useQuery(api.domains.getMine);
  const createPending = useMutation(api.domains.createPending);
  const removeDomain = useMutation(api.domains.remove);
  const registerDomain = useAction(api.domainActions.registerDomain);
  const checkDomain = useAction(api.domainActions.checkDomain);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("add");
    try {
      const id = await createPending({ domain: draft.trim() });
      setDraft("");
      // Pendaftaran ke Vercel menyusul segera setelah barisnya ada, supaya
      // petunjuk DNS langsung muncul tanpa langkah kedua dari pengguna.
      await registerDomain({ domainId: id });
    } catch (err) {
      alert(alertMessageFor(err, t.addFailed));
    } finally {
      setBusy(null);
    }
  };

  const handleCheck = async (id: Id<"domains">) => {
    setBusy(id);
    try {
      const result = await checkDomain({ domainId: id });
      if (result.status === "active") alert(t.nowActive);
    } catch (err) {
      alert(alertMessageFor(err, t.checkFailed));
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async (id: Id<"domains">, domain: string) => {
    if (!confirm(t.removeConfirm(domain))) {
      return;
    }
    setBusy(id);
    try {
      // Pelepasan domain di Vercel dijalankan backend sebagai kelanjutan
      // removeDomain — klien tidak lagi memanggilnya sendiri.
      const result = await removeDomain({ id });
      if (result.movedLinks > 0) {
        alert(t.removedMoved(result.movedLinks));
      }
    } catch (err) {
      alert(alertMessageFor(err, t.removeFailed));
    } finally {
      setBusy(null);
    }
  };

  if (data === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!data?.canAdd) {
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
            {t.lockedBodySuffix(planName("business", locale))}
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

  const atLimit = data.domains.length >= data.limit;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Globe size={22} className="text-brand" />
          {t.title}
        </h2>
        <p className="text-muted-foreground">
          {t.usage(data.domains.length, data.limit)}
        </p>
      </div>

      {data.domains.map((row) => {
        const view = STATUS_VIEW[row.status] ?? STATUS_VIEW.pending;
        const statusLabel =
          t.status[row.status as keyof typeof t.status] ?? t.status.pending;
        return (
          <div key={row._id} className="card-saweria space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${view.className}`}
              >
                {view.icon}
                {statusLabel}
              </span>
              <p className="min-w-0 flex-1 truncate font-bold text-foreground">
                {row.domain}
              </p>
              <button
                onClick={() => handleCheck(row._id)}
                disabled={busy === row._id}
                className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-brand-soft hover:text-brand"
              >
                {busy === row._id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {t.check}
              </button>
              <button
                onClick={() => handleRemove(row._id, row.domain)}
                disabled={busy === row._id}
                className="rounded-lg p-2 text-subtle transition hover:bg-danger-soft hover:text-danger"
                title={t.removeTitle}
              >
                <Trash2 size={18} />
              </button>
            </div>

            {row.note && (
              <p className="text-sm text-muted-foreground">{row.note}</p>
            )}

            {/* Petunjuk DNS ditampilkan apa adanya dari Vercel */}
            {row.verification && row.verification.length > 0 && (
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">{t.dnsHeading}</p>
                <div className="space-y-3">
                  {row.verification.map((record, i) => (
                    <div
                      key={`${record.type}-${i}`}
                      className="grid gap-2 text-xs sm:grid-cols-[70px_1fr_auto]"
                    >
                      <span className="font-bold text-brand">{record.type}</span>
                      <div className="min-w-0">
                        <p className="truncate text-muted-foreground">
                          {record.domain}
                        </p>
                        <p className="break-all font-mono text-foreground">
                          {record.value}
                        </p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(record.value)}
                        className="self-start rounded-lg p-1.5 text-subtle hover:text-brand"
                        title={t.copyValue}
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-subtle">{t.dnsHint}</p>
              </div>
            )}
          </div>
        );
      })}

      {atLimit ? (
        <div className="surface-panel p-5 text-sm text-muted-foreground">
          {t.atLimit(planName(data.plan, locale))}
        </div>
      ) : (
        <form onSubmit={handleAdd} className="card-saweria space-y-4 p-6">
          <label className="block text-sm font-bold text-foreground">
            {t.addLabel}
          </label>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t.addPlaceholder}
            className="input-field w-full"
            required
          />
          <button
            type="submit"
            disabled={busy === "add"}
            className="btn-saweria flex items-center gap-2 px-8 py-3"
          >
            {busy === "add" && <Loader2 size={16} className="animate-spin" />}
            {t.addButton}
          </button>
          <p className="text-xs text-muted-foreground">
            {t.addHintPrefix} <strong>{t.addPlaceholder}</strong>
            {t.addHintSuffix}
          </p>
        </form>
      )}
    </div>
  );
}
