"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check, Loader2, Lock, Smartphone, X } from "lucide-react";
import { PLANS, isUnlimited, type PlanId } from "@/convex/plans";
import {
  MICROSITE_SLUG_MIN,
  sanitizeMicrositeSlug,
} from "@/convex/micrositeSlug";
import { alertMessageFor } from "@/lib/planError";

/**
 * Formulir pembuatan halaman bio.
 *
 * Menggantikan window.prompt(). Prompt bawaan tidak bisa memvalidasi apa pun,
 * tidak bisa menunjukkan alamat yang akan terbentuk, dan di ponsel muncul
 * sebagai dialog sistem yang terputus dari aplikasi — tiga hal yang justru
 * paling dibutuhkan pada langkah ini, karena alamatnya sulit diubah setelah
 * disebarkan.
 */
export default function CreateMicrositeModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const createMicrosite = useMutation(api.microsites.createMicrosite);
  const me = useQuery(api.users.getMe);

  const [title, setTitle] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slug = sanitizeMicrositeSlug(slugInput);

  // Ketersediaan hanya ditanyakan setelah panjangnya masuk akal — memanggil
  // server untuk satu huruf tidak memberi jawaban yang berguna.
  const availability = useQuery(
    api.microsites.checkSlugAvailability,
    slug.length >= MICROSITE_SLUG_MIN ? { slug } : "skip"
  );

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setSlugInput("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const plan: PlanId = (me?.plan as PlanId) ?? "free";
  const limit = me?.limits?.microsites ?? 1;
  const used = me?.usage?.microsites ?? 0;
  const atLimit = !isUnlimited(limit) && used >= limit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const id = await createMicrosite({
        slug,
        title: title.trim() || "Halaman Baru",
      });
      onCreated(id);
    } catch (err) {
      setError(alertMessageFor(err, "Gagal membuat halaman bio."));
    } finally {
      setLoading(false);
    }
  };

  const siap = availability?.available === true && !atLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-0 backdrop-blur-sm sm:items-center sm:p-6">
      {/* Di ponsel modal menempel ke bawah layar: jempol ada di sana, dan
          papan ketik yang muncul tidak menutupi tombol simpan. */}
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[30px] border border-border bg-card p-6 shadow-xl sm:rounded-[30px] sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Smartphone size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Buat Halaman Bio
              </h2>
              <p className="text-xs text-muted-foreground">
                Satu alamat untuk semua tautanmu.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Kuota ditampilkan di depan, bukan sebagai kejutan setelah menekan
            simpan dan sudah terlanjur memilih nama. */}
        {atLimit ? (
          <div className="mb-6 rounded-2xl border border-dashed border-border p-5 text-center">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand">
              <Lock size={20} />
            </div>
            <p className="font-bold text-foreground">
              Jatah halaman bio paket {PLANS[plan].name} sudah terpakai
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Terpakai {used} dari {limit}. Hapus salah satu, atau naikkan paket
              untuk menambah.
            </p>
            <Link href="/dashboard/billing" onClick={onClose}>
              <button className="btn-saweria mt-4 px-6 py-2.5">
                Lihat paket
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Nama Halaman</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Toko Saya"
                autoFocus
                className="input-field w-full"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Bisa diubah kapan saja nanti.
              </p>
            </div>

            <div>
              <label className="form-label">Alamat Halaman</label>
              <div className="flex items-center overflow-hidden rounded-xl border border-border bg-input transition focus-within:border-brand focus-within:ring-4 focus-within:ring-ring">
                <span className="whitespace-nowrap border-r border-border px-4 py-4 text-sm font-medium text-muted-foreground">
                  {process.env.NEXT_PUBLIC_APP_URL}/bio/
                </span>
                <input
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value)}
                  placeholder="toko-saya"
                  required
                  className="w-full bg-transparent p-4 text-sm font-bold text-brand focus:outline-none"
                />
              </div>

              {/* Hasil bersihnya ditampilkan hanya bila berbeda dari ketikan,
                  supaya perubahan otomatis tidak pernah mengejutkan. */}
              {slug && slug !== slugInput.trim() && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Akan disimpan sebagai{" "}
                  <span className="font-bold text-foreground">{slug}</span>
                </p>
              )}

              {slug.length >= MICROSITE_SLUG_MIN && availability && (
                <p
                  className={`mt-2 flex items-center gap-1.5 text-sm ${
                    availability.available ? "text-success" : "text-danger"
                  }`}
                >
                  {availability.available ? <Check size={14} /> : <X size={14} />}
                  {availability.available
                    ? "Alamat ini tersedia."
                    : availability.reason}
                </p>
              )}

              {slugInput.length > 0 && slug.length < MICROSITE_SLUG_MIN && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Minimal {MICROSITE_SLUG_MIN} karakter — huruf kecil, angka,
                  dan tanda hubung.
                </p>
              )}
            </div>

            {!isUnlimited(limit) && (
              <p className="text-xs text-muted-foreground">
                Terpakai {used} dari {limit} halaman bio pada paket{" "}
                {PLANS[plan].name}.
              </p>
            )}

            {error && (
              <div className="rounded-xl border border-danger/25 bg-danger-soft p-4 text-sm text-danger">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-6 py-3 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !siap}
                className="btn-saweria flex items-center gap-2 px-8 py-3 font-bold disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Buat Halaman
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
