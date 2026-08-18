"use client";

import Link from "next/link";
import { Clock, KeyRound, Lock } from "lucide-react";

/**
 * Bidang proteksi tautan: kedaluwarsa dan sandi.
 *
 * Dipakai bersama oleh modal tambah dan modal edit. Disatukan sebagai komponen
 * karena keduanya harus menawarkan hal yang persis sama — dua salinan JSX yang
 * berdiri sendiri pasti akan berbeda perlahan begitu salah satunya disentuh.
 */

export type ProtectionState = {
  expiryDate: string;
  maxClicks: string;
  password: string;
  clearPassword: boolean;
};

export const EMPTY_PROTECTION: ProtectionState = {
  expiryDate: "",
  maxClicks: "",
  password: "",
  clearPassword: false,
};

/**
 * Ubah isi formulir jadi argumen mutation.
 *
 * `password` sengaja dihilangkan sepenuhnya bila kolomnya dibiarkan kosong —
 * berbeda dari string kosong, yang berarti "hapus sandinya". Tanpa pembedaan
 * itu, menyimpan perubahan judul saja akan mencabut sandi yang sudah terpasang.
 */
export function protectionToArgs(state: ProtectionState) {
  return {
    expiresAt: state.expiryDate ? new Date(state.expiryDate).getTime() : null,
    maxClicks: state.maxClicks ? Number(state.maxClicks) : null,
    ...(state.clearPassword
      ? { password: "" }
      : state.password
        ? { password: state.password }
        : {}),
  };
}

export default function LinkProtectionFields({
  value,
  onChange,
  canProtect,
  hasPassword = false,
}: {
  value: ProtectionState;
  onChange: (next: ProtectionState) => void;
  canProtect: boolean;
  /** Tautan ini sudah bersandi — mengubah label dan memunculkan opsi hapus. */
  hasPassword?: boolean;
}) {
  const set = <K extends keyof ProtectionState>(
    key: K,
    v: ProtectionState[K]
  ) => onChange({ ...value, [key]: v });

  if (!canProtect) {
    return (
      <Link href="/dashboard/billing" className="block">
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-4 transition hover:border-brand">
          <Lock size={18} className="shrink-0 text-subtle" />
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">
              Kedaluwarsa &amp; sandi tautan
            </span>{" "}
            tersedia di paket berbayar.
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-5">
      <p className="flex items-center gap-2 text-sm font-bold text-foreground">
        <Lock size={16} className="text-brand" />
        Proteksi tautan
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Clock size={13} /> Berlaku sampai
          </label>
          <input
            type="datetime-local"
            value={value.expiryDate}
            onChange={(e) => set("expiryDate", e.target.value)}
            className="input-field w-full"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-muted-foreground">
            Maksimal jumlah klik
          </label>
          <input
            type="number"
            min={1}
            value={value.maxClicks}
            onChange={(e) => set("maxClicks", e.target.value)}
            placeholder="Tanpa batas"
            className="input-field w-full"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
          <KeyRound size={13} /> Sandi
        </label>
        <input
          type="password"
          value={value.password}
          onChange={(e) =>
            onChange({ ...value, password: e.target.value, clearPassword: false })
          }
          placeholder={
            hasPassword ? "Terpasang — isi untuk mengganti" : "Kosongkan untuk tanpa sandi"
          }
          className="input-field w-full"
        />
        {hasPassword && (
          <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={value.clearPassword}
              onChange={(e) =>
                onChange({
                  ...value,
                  clearPassword: e.target.checked,
                  password: e.target.checked ? "" : value.password,
                })
              }
            />
            Hapus sandi dari tautan ini
          </label>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Kosongkan tanggal dan batas klik untuk membuat tautan berlaku selamanya.
      </p>
    </div>
  );
}
