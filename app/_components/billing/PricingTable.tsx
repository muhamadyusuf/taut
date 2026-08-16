"use client";

import { useState } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Check, Loader2, Sparkles } from "lucide-react";
import {
  PLANS,
  PLAN_IDS,
  formatIDR,
  planHighlights,
  yearlySavingPercent,
  type PlanId,
} from "@/convex/plans";

export type BillingCycle = "monthly" | "yearly";

type Props = {
  /** Paket yang sedang aktif — kartunya ditandai dan tombolnya dinonaktifkan. */
  currentPlan?: PlanId;
  /**
   * Diisi hanya di dasbor. Kalau kosong, kartu menampilkan ajakan mendaftar —
   * halaman harga publik dirender di server dan tidak boleh menerima fungsi.
   */
  onSelect?: (plan: PlanId, cycle: BillingCycle) => void;
  busyPlan?: PlanId | null;
};

const POPULAR: PlanId = "pro";

export default function PricingTable({ currentPlan, onSelect, busyPlan }: Props) {
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const saving = yearlySavingPercent("pro");

  return (
    <div className="space-y-8">
      {/* Pemilih siklus */}
      <div className="flex justify-center">
        <div
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
          role="group"
          aria-label="Siklus pembayaran"
        >
          {(["monthly", "yearly"] as const).map((value) => {
            const active = cycle === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setCycle(value)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                  active
                    ? "bg-brand text-brand-contrast"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {value === "monthly" ? "Bulanan" : "Tahunan"}
                {value === "yearly" && saving > 0 && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[11px] ${
                      active ? "bg-white/20" : "bg-success-soft text-success"
                    }`}
                  >
                    hemat {saving}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLAN_IDS.map((planId) => {
          const plan = PLANS[planId];
          const isCurrent = currentPlan === planId;
          const isPopular = planId === POPULAR;
          const price = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
          const busy = busyPlan === planId;

          return (
            <div
              key={planId}
              className={`card-saweria relative flex flex-col p-6 ${
                isPopular ? "ring-2 ring-brand" : ""
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold text-brand-contrast">
                  <Sparkles size={12} />
                  Paling banyak dipilih
                </span>
              )}

              <div className="mb-5">
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 min-h-10 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>
              </div>

              <div className="mb-6">
                {price === 0 ? (
                  <p className="text-4xl font-bold text-foreground">Gratis</p>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-foreground">
                      {formatIDR(price)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      per {cycle === "yearly" ? "tahun" : "bulan"}
                    </p>
                  </>
                )}
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {planHighlights(planId).map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-success"
                      aria-hidden
                    />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button
                  disabled
                  className="btn-ghost w-full cursor-default py-3 text-center"
                >
                  Paket Anda saat ini
                </button>
              ) : planId === "free" ? (
                <>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="btn-ghost w-full py-3">Mulai gratis</button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    {/* Sudah punya akun tapi sedang di paket berbayar: kartu ini
                        tetap perlu penutup supaya tingginya tidak timpang. */}
                    <p className="py-3 text-center text-sm text-muted-foreground">
                      Paket dasar, aktif selamanya
                    </p>
                  </SignedIn>
                </>
              ) : onSelect ? (
                <button
                  onClick={() => onSelect(planId, cycle)}
                  disabled={busy}
                  className="btn-saweria flex w-full items-center justify-center gap-2 py-3"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menyiapkan…
                    </>
                  ) : (
                    `Pilih ${plan.name}`
                  )}
                </button>
              ) : (
                <>
                  <SignedIn>
                    <Link href="/dashboard/billing" className="block">
                      <button className="btn-saweria w-full py-3">
                        Pilih {plan.name}
                      </button>
                    </Link>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="btn-saweria w-full py-3">
                        Pilih {plan.name}
                      </button>
                    </SignInButton>
                  </SignedOut>
                </>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Pembayaran lewat QRIS, transfer bank, dan e-wallet. Paket berlaku sesuai
        masa yang dibeli dan tidak diperpanjang otomatis — kami mengirim
        pengingat sebelum masa aktif habis.
      </p>
    </div>
  );
}
