"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { AlertCircle, CheckCircle2, Clock, Loader2, Receipt } from "lucide-react";
import {
  PLANS,
  formatIDR,
  isUnlimited,
  type PlanId,
} from "@/convex/plans";
import PricingTable, { type BillingCycle } from "@/app/_components/billing/PricingTable";
import { loadSnap } from "@/lib/midtransSnap";
import { errorMessage } from "@/lib/planError";

/** Baris pemakaian kuota dengan bilah sederhana. */
function QuotaRow({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number;
}) {
  const unlimited = isUnlimited(limit);
  const ratio = unlimited ? 0 : Math.min(used / Math.max(limit, 1), 1);
  const nearFull = !unlimited && ratio >= 0.8;

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-sm text-foreground">{label}</span>
        <span
          className={`text-sm font-bold ${
            nearFull ? "text-warning" : "text-muted-foreground"
          }`}
        >
          {used.toLocaleString("id-ID")}
          {unlimited ? " / tanpa batas" : ` / ${limit.toLocaleString("id-ID")}`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${
            nearFull ? "bg-warning" : "bg-brand"
          }`}
          style={{ width: unlimited ? "100%" : `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingPage() {
  const me = useQuery(api.users.getMe);
  const invoices = useQuery(api.billing.myInvoices);
  const createCheckout = useAction(api.billingActions.createSubscriptionCheckout);

  const [busyPlan, setBusyPlan] = useState<PlanId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSelect = async (plan: PlanId, cycle: BillingCycle) => {
    setBusyPlan(plan);
    setNotice(null);
    try {
      const checkout = await createCheckout({ plan, billingCycle: cycle });
      const snap = await loadSnap(checkout.clientKey, checkout.isProduction);

      snap.pay(checkout.token, {
        onSuccess: () =>
          setNotice(
            "Pembayaran berhasil. Paket Anda aktif dalam beberapa detik setelah dikonfirmasi Midtrans."
          ),
        onPending: () =>
          setNotice(
            "Pembayaran sedang diproses. Paket aktif otomatis begitu pembayaran Anda lunas."
          ),
        onError: () => setNotice("Pembayaran gagal. Belum ada biaya yang ditagihkan."),
        onClose: () =>
          setNotice("Jendela pembayaran ditutup. Tagihan tersimpan dan bisa dilanjutkan."),
      });
    } catch (err) {
      setNotice(errorMessage(err, "Gagal menyiapkan pembayaran."));
    } finally {
      setBusyPlan(null);
    }
  };

  if (me === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const plan: PlanId = (me?.plan as PlanId) ?? "free";
  const limits = me?.limits;
  const usage = me?.usage;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paket &amp; Tagihan</h2>
        <p className="text-muted-foreground">
          Kelola langganan dan lihat sisa kuota Anda.
        </p>
      </div>

      {notice && (
        <div className="surface-panel flex items-start gap-3 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-sm text-foreground">{notice}</p>
        </div>
      )}

      {/* Status paket saat ini */}
      <div className="card-saweria p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase text-muted-foreground">
              Paket aktif
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {PLANS[plan].name}
            </p>

            {me?.legacyFree && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
                <CheckCircle2 size={13} />
                Akun awal — kuota inti tanpa batas selamanya
              </p>
            )}

            {me?.planExpiresAt && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock size={14} />
                Aktif sampai{" "}
                {format(new Date(me.planExpiresAt), "d MMMM yyyy", {
                  locale: localeId,
                })}
              </p>
            )}
          </div>
        </div>

        {limits && usage && (
          <div className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <QuotaRow
              label="Halaman bio"
              used={usage.microsites}
              limit={limits.microsites}
            />
            <QuotaRow label="Formulir" used={usage.forms} limit={limits.forms} />
            <QuotaRow
              label={`Sertifikat (${usage.period})`}
              used={usage.certificatesSent}
              limit={limits.certificatesPerMonth}
            />
            <QuotaRow
              label="Produk toko"
              used={usage.products}
              limit={limits.products}
            />
          </div>
        )}
      </div>

      {/* Pilihan paket */}
      <div>
        <h3 className="mb-6 text-lg font-bold text-foreground">Ubah paket</h3>
        <PricingTable
          currentPlan={plan}
          onSelect={handleSelect}
          busyPlan={busyPlan}
        />
      </div>

      {/* Riwayat tagihan */}
      {invoices && invoices.length > 0 && (
        <div className="card-saweria p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
            <Receipt size={18} className="text-brand" />
            Riwayat tagihan
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-bold">Tanggal</th>
                  <th className="pb-2 font-bold">Paket</th>
                  <th className="pb-2 font-bold">Jumlah</th>
                  <th className="pb-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-border last:border-0">
                    <td className="py-3 text-muted-foreground">
                      {format(new Date(inv.createdAt), "d MMM yyyy", {
                        locale: localeId,
                      })}
                    </td>
                    <td className="py-3 text-foreground">
                      {PLANS[inv.plan as PlanId]?.name ?? inv.plan}{" "}
                      <span className="text-muted-foreground">
                        ({inv.billingCycle === "yearly" ? "tahunan" : "bulanan"})
                      </span>
                    </td>
                    <td className="py-3 text-foreground">{formatIDR(inv.amount)}</td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          inv.status === "active"
                            ? "bg-success-soft text-success"
                            : inv.status === "pending"
                              ? "bg-warning-soft text-warning"
                              : "bg-danger-soft text-danger"
                        }`}
                      >
                        {inv.status === "active"
                          ? "Lunas"
                          : inv.status === "pending"
                            ? "Menunggu"
                            : inv.status === "expired"
                              ? "Berakhir"
                              : "Gagal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
