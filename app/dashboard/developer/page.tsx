"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import {
  Check,
  Copy,
  KeyRound,
  Loader2,
  Lock,
  Trash2,
  Webhook,
} from "lucide-react";
import type { Id } from "@/convex/_generated/dataModel";
import { planName } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocale } from "@/lib/i18n/dateLocale";

export default function DeveloperPage() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.developer;
  const eventLabel = (event: string) => t.events[event] ?? event;
  const keyData = useQuery(api.apiKeys.listMine);
  const hookData = useQuery(api.webhooks.listMine);

  const createKey = useMutation(api.apiKeys.create);
  const revokeKey = useMutation(api.apiKeys.revoke);
  const createHook = useMutation(api.webhooks.create);
  const removeHook = useMutation(api.webhooks.remove);

  const [keyName, setKeyName] = useState("");
  const [freshKey, setFreshKey] = useState<string | null>(null);
  const [hookUrl, setHookUrl] = useState("");
  const [hookEvents, setHookEvents] = useState<string[]>(["link.created"]);
  const [busy, setBusy] = useState(false);

  if (keyData === undefined || hookData === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!keyData?.canUse) {
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
          <Link href="/dashboard/billing" className="mt-6 inline-block">
            <button className="btn-saweria px-8 py-3">
              {t.seePlan(planName("business", locale))}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await createKey({ name: keyName });
      setFreshKey(result.key);
      setKeyName("");
    } catch (err) {
      alert(alertMessageFor(err, t.createKeyFailed));
    } finally {
      setBusy(false);
    }
  };

  const handleCreateHook = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createHook({ url: hookUrl.trim(), events: hookEvents });
      setHookUrl("");
    } catch (err) {
      alert(alertMessageFor(err, t.addHookFailed));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Kunci yang baru dibuat — satu-satunya kesempatan menyalinnya */}
      {freshKey && (
        <div className="rounded-2xl border border-success/30 bg-success-soft p-5">
          <p className="flex items-center gap-2 font-bold text-success">
            <Check size={16} />
            {t.keyCreated}
          </p>
          <p className="mt-1 text-sm text-success/90">{t.keyCreatedHint}</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-card px-3 py-2 font-mono text-sm text-foreground">
              {freshKey}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(freshKey)}
              className="rounded-lg bg-card p-2 text-muted-foreground hover:text-brand"
              title={t.copy}
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => setFreshKey(null)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-success"
            >
              {t.done}
            </button>
          </div>
        </div>
      )}

      {/* Kunci API */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          <KeyRound size={18} className="text-brand" />
          {t.apiKeysHeading}
        </h3>

        {keyData.keys.map((key) => (
          <div
            key={key._id}
            className="card-saweria flex flex-wrap items-center gap-3 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-foreground">{key.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {key.prefix}••••••••
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {key.lastUsedAt
                ? t.lastUsed(
                    format(new Date(key.lastUsedAt), "d MMM yyyy", { locale: dateLocale(locale) })
                  )
                : t.neverUsed}
            </p>
            <button
              onClick={() => {
                if (confirm(t.revokeConfirm(key.name))) {
                  revokeKey({ id: key._id as Id<"api_keys"> });
                }
              }}
              className="rounded-lg p-2 text-subtle hover:bg-danger-soft hover:text-danger"
              title={t.revokeTitle}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <form onSubmit={handleCreateKey} className="card-saweria flex gap-3 p-4">
          <input
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder={t.keyNamePlaceholder}
            className="input-field flex-1"
            required
          />
          <button disabled={busy} className="btn-saweria shrink-0 px-6">
            {t.createKey}
          </button>
        </form>
      </section>

      {/* Webhook */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          <Webhook size={18} className="text-brand" />
          {t.webhooksHeading}
        </h3>

        {hookData?.webhooks.map((hook) => (
          <div key={hook._id} className="card-saweria space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                {hook.url}
              </p>
              <button
                onClick={() => {
                  if (confirm(t.deleteHookConfirm)) {
                    removeHook({ id: hook._id as Id<"webhooks"> });
                  }
                }}
                className="rounded-lg p-2 text-subtle hover:bg-danger-soft hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {hook.events.map((event) => (
                <span
                  key={event}
                  className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-soft-fg"
                >
                  {eventLabel(event)}
                </span>
              ))}
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                {t.signingSecret}
              </summary>
              <code className="mt-2 block break-all rounded-lg bg-muted p-2 font-mono text-foreground">
                {hook.secret}
              </code>
              <p className="mt-1 text-muted-foreground">
                {t.signingHintPrefix}{" "}
                <code>X-Singkat-Signature: sha256=&lt;hmac&gt;</code>
                {t.signingHintSuffix}
              </p>
            </details>
          </div>
        ))}

        <form onSubmit={handleCreateHook} className="card-saweria space-y-4 p-4">
          <input
            value={hookUrl}
            onChange={(e) => setHookUrl(e.target.value)}
            placeholder={t.hookUrlPlaceholder}
            className="input-field w-full"
            required
          />
          <div className="flex flex-wrap gap-2">
            {Object.entries(t.events).map(([value, label]) => {
              const active = hookEvents.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setHookEvents((prev) =>
                      active ? prev.filter((e) => e !== value) : [...prev, value]
                    )
                  }
                  className={`rounded-lg border px-3 py-1.5 text-sm font-bold transition-colors ${
                    active
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button disabled={busy} className="btn-saweria px-6 py-2.5">
            {t.addHook}
          </button>
        </form>

        {/* Riwayat pengiriman — webhook yang gagal diam-diam adalah keluhan
            dukungan paling umum pada fitur semacam ini. */}
        {hookData && hookData.deliveries.length > 0 && (
          <div className="card-saweria p-4">
            <p className="mb-3 text-sm font-bold text-foreground">
              {t.deliveriesHeading}
            </p>
            <ul className="space-y-2 text-xs">
              {hookData.deliveries.map((d) => (
                <li key={d._id} className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 font-bold ${
                      d.status === "success"
                        ? "bg-success-soft text-success"
                        : "bg-danger-soft text-danger"
                    }`}
                  >
                    {d.statusCode ?? (d.status === "success" ? "OK" : t.deliveryFailed)}
                  </span>
                  <span className="text-muted-foreground">
                    {eventLabel(d.event)}
                  </span>
                  <span className="ml-auto text-subtle">
                    {format(new Date(d.createdAt), "d MMM HH:mm", { locale: dateLocale(locale) })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
