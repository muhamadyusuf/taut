"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
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
import { PLANS } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";

const EVENT_LABELS: Record<string, string> = {
  "link.created": "Tautan dibuat",
  "link.clicked": "Tautan diklik",
};

export default function DeveloperPage() {
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
          <h2 className="text-xl font-bold text-foreground">API &amp; Webhook</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Buat dan baca tautan dari sistem Anda sendiri, dan terima
            pemberitahuan otomatis saat ada kejadian. Tersedia di paket{" "}
            {PLANS.business.name}.
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

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await createKey({ name: keyName });
      setFreshKey(result.key);
      setKeyName("");
    } catch (err) {
      alert(alertMessageFor(err, "Gagal membuat kunci."));
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
      alert(alertMessageFor(err, "Gagal menambahkan webhook."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Developer</h2>
        <p className="text-muted-foreground">
          Kunci API dan webhook untuk menyambungkan singkat.in ke sistem Anda.
        </p>
      </div>

      {/* Kunci yang baru dibuat — satu-satunya kesempatan menyalinnya */}
      {freshKey && (
        <div className="rounded-2xl border border-success/30 bg-success-soft p-5">
          <p className="flex items-center gap-2 font-bold text-success">
            <Check size={16} />
            Kunci berhasil dibuat
          </p>
          <p className="mt-1 text-sm text-success/90">
            Salin sekarang. Kunci ini tidak akan ditampilkan lagi — yang kami
            simpan hanya sidik jarinya.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg bg-card px-3 py-2 font-mono text-sm text-foreground">
              {freshKey}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(freshKey)}
              className="rounded-lg bg-card p-2 text-muted-foreground hover:text-brand"
              title="Salin"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => setFreshKey(null)}
              className="rounded-lg px-3 py-2 text-sm font-bold text-success"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* Kunci API */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          <KeyRound size={18} className="text-brand" />
          Kunci API
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
                ? `Dipakai ${format(new Date(key.lastUsedAt), "d MMM yyyy", { locale: localeId })}`
                : "Belum pernah dipakai"}
            </p>
            <button
              onClick={() => {
                if (confirm(`Cabut kunci "${key.name}"? Sistem yang memakainya akan langsung berhenti bekerja.`)) {
                  revokeKey({ id: key._id as Id<"api_keys"> });
                }
              }}
              className="rounded-lg p-2 text-subtle hover:bg-danger-soft hover:text-danger"
              title="Cabut kunci"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <form onSubmit={handleCreateKey} className="card-saweria flex gap-3 p-4">
          <input
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Nama kunci, mis. Zapier"
            className="input-field flex-1"
            required
          />
          <button disabled={busy} className="btn-saweria shrink-0 px-6">
            Buat kunci
          </button>
        </form>
      </section>

      {/* Webhook */}
      <section className="space-y-4">
        <h3 className="flex items-center gap-2 font-bold text-foreground">
          <Webhook size={18} className="text-brand" />
          Webhook
        </h3>

        {hookData?.webhooks.map((hook) => (
          <div key={hook._id} className="card-saweria space-y-2 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 truncate font-mono text-sm text-foreground">
                {hook.url}
              </p>
              <button
                onClick={() => {
                  if (confirm("Hapus webhook ini?")) {
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
                  {EVENT_LABELS[event] ?? event}
                </span>
              ))}
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground">
                Rahasia tanda tangan
              </summary>
              <code className="mt-2 block break-all rounded-lg bg-muted p-2 font-mono text-foreground">
                {hook.secret}
              </code>
              <p className="mt-1 text-muted-foreground">
                Setiap kiriman membawa header{" "}
                <code>X-Singkat-Signature: sha256=&lt;hmac&gt;</code>. Hitung
                HMAC-SHA256 dari body mentah memakai rahasia ini untuk
                memastikan kiriman benar berasal dari kami.
              </p>
            </details>
          </div>
        ))}

        <form onSubmit={handleCreateHook} className="card-saweria space-y-4 p-4">
          <input
            value={hookUrl}
            onChange={(e) => setHookUrl(e.target.value)}
            placeholder="https://sistem-anda.com/webhook"
            className="input-field w-full"
            required
          />
          <div className="flex flex-wrap gap-2">
            {Object.entries(EVENT_LABELS).map(([value, label]) => {
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
            Tambah webhook
          </button>
        </form>

        {/* Riwayat pengiriman — webhook yang gagal diam-diam adalah keluhan
            dukungan paling umum pada fitur semacam ini. */}
        {hookData && hookData.deliveries.length > 0 && (
          <div className="card-saweria p-4">
            <p className="mb-3 text-sm font-bold text-foreground">
              Pengiriman terakhir
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
                    {d.statusCode ?? (d.status === "success" ? "OK" : "gagal")}
                  </span>
                  <span className="text-muted-foreground">
                    {EVENT_LABELS[d.event] ?? d.event}
                  </span>
                  <span className="ml-auto text-subtle">
                    {format(new Date(d.createdAt), "d MMM HH:mm", { locale: localeId })}
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
