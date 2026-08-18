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
import { PLANS, isUnlimited } from "@/convex/plans";
import { alertMessageFor } from "@/lib/planError";

export default function SubdomainsPage() {
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
      alert(alertMessageFor(err, "Gagal mengambil subdomain."));
    } finally {
      setBusy(false);
    }
  };

  const handleRelease = async (id: Id<"subdomains">, name: string) => {
    if (
      !confirm(
        `Lepaskan ${name}.singkat.in?\n\nTautan yang hidup di alamat ini akan dikembalikan ke domain utama, bukan dihapus. Alamat lamanya akan berhenti bekerja.`
      )
    ) {
      return;
    }
    try {
      const result = await release({ id });
      alert(
        result.movedLinks > 0
          ? `Subdomain dilepas. ${result.movedLinks} tautan dipindahkan ke domain utama.`
          : "Subdomain dilepas."
      );
    } catch (err) {
      alert(alertMessageFor(err, "Gagal melepas subdomain."));
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
          <h2 className="text-xl font-bold text-foreground">
            Alamat sendiri: nama.singkat.in
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Tautan Anda tampil sebagai{" "}
            <span className="font-bold text-foreground">tokosaya.singkat.in/promo</span>{" "}
            alih-alih menumpang di alamat bersama. Tersedia mulai paket{" "}
            {PLANS.pro.name}.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Paket Anda sekarang: <strong>{PLANS[data?.plan ?? "free"].name}</strong>
          </p>
          <Link href="/dashboard/billing" className="mt-6 inline-block">
            <button className="btn-saweria px-8 py-3">Lihat paket</button>
          </Link>
        </div>
      </div>
    );
  }

  const limitLabel = isUnlimited(data.limit) ? "tanpa batas" : `${data.limit}`;
  const atLimit = !isUnlimited(data.limit) && data.subdomains.length >= data.limit;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Globe size={22} className="text-brand" />
          Subdomain
        </h2>
        <p className="text-muted-foreground">
          Alamat sendiri untuk tautanmu. Terpakai {data.subdomains.length} dari{" "}
          {limitLabel}.
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
                  Aktif. Pilih alamat ini saat membuat tautan baru.
                </p>
              </div>
              <button
                onClick={() => handleRelease(row._id, row.subdomain)}
                className="rounded-lg p-2 text-subtle transition hover:bg-danger-soft hover:text-danger"
                title="Lepaskan subdomain"
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
          Jatah subdomain paket {PLANS[data.plan].name} sudah terpakai semua.
          Lepaskan salah satu, atau naik ke paket {PLANS.business.name} untuk
          menambah.
        </div>
      ) : (
        <form onSubmit={handleClaim} className="card-saweria space-y-4 p-6">
          <label className="block text-sm font-bold text-foreground">
            Ambil subdomain baru
          </label>

          <div className="flex items-stretch gap-0">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.toLowerCase())}
              placeholder="tokosaya"
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
              {availability.available
                ? "Tersedia."
                : availability.reason}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || (availability ? !availability.available : true)}
            className="btn-saweria flex items-center gap-2 px-8 py-3 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Ambil subdomain
          </button>

          <p className="text-xs text-muted-foreground">
            Huruf kecil, angka, dan tanda hubung. Nama yang menyerupai merek
            atau lembaga resmi dicadangkan demi keamanan seluruh pengguna.
          </p>
        </form>
      )}
    </div>
  );
}
