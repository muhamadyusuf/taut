"use client";

import { Crown, Sparkles, User } from "lucide-react";
import { PLANS, type PlanId } from "@/convex/plans";

/**
 * Penanda paket yang dipakai di seluruh aplikasi.
 *
 * Ketiganya dibedakan bukan hanya oleh warna: masing-masing punya ikon sendiri
 * dan tulisan namanya. Warna saja tidak cukup — sekitar satu dari dua belas
 * laki-laki kesulitan membedakan rona tertentu, dan lencana yang hanya berbeda
 * warna akan terbaca sama bagi mereka.
 */

const STYLES: Record<
  PlanId,
  { icon: typeof User; className: string; ring: string }
> = {
  free: {
    icon: User,
    className: "bg-muted text-muted-foreground",
    ring: "ring-border",
  },
  pro: {
    icon: Sparkles,
    className: "bg-brand text-brand-contrast",
    ring: "ring-brand",
  },
  business: {
    // Emas untuk tingkat tertinggi: dibaca sebagai "paling atas" lintas budaya,
    // dan cukup jauh dari biru merek sehingga tidak tertukar dengan Pro.
    icon: Crown,
    className: "bg-[#b8860b] text-white dark:bg-[#d4a017] dark:text-[#1a1200]",
    ring: "ring-[#b8860b]",
  },
};

export default function PlanBadge({
  plan,
  size = "md",
  showLabel = true,
  expired = false,
}: {
  plan: PlanId;
  size?: "sm" | "md";
  showLabel?: boolean;
  /** Tampilkan sebagai paket yang baru saja berakhir, bukan paket aktif. */
  expired?: boolean;
}) {
  const style = STYLES[plan];
  const Icon = style.icon;

  const dims =
    size === "sm"
      ? "px-2 py-0.5 text-[10px] gap-1"
      : "px-2.5 py-1 text-xs gap-1.5";
  const iconSize = size === "sm" ? 11 : 13;

  if (expired) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-danger-soft text-danger font-bold ${dims}`}
        title="Masa aktif paket sudah berakhir"
      >
        <Icon size={iconSize} aria-hidden />
        {showLabel && <>Kedaluwarsa</>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${style.className} ${dims}`}
      title={`Paket ${PLANS[plan].name}`}
    >
      <Icon size={iconSize} aria-hidden />
      {showLabel && <>{PLANS[plan].name}</>}
    </span>
  );
}
