"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, Loader2, Receipt, Ticket } from "lucide-react";
import {
  EVENT_PASS,
  eventPassName,
  formatIDR,
  isPlanId,
  isUnlimited,
  planName,
  type PlanId,
} from "@/convex/plans";
import PricingTable, { type BillingCycle } from "@/app/_components/billing/PricingTable";
import { loadSnap } from "@/lib/midtransSnap";
import { errorMessage } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocale, numberLocale } from "@/lib/i18n/dateLocale";

/** Baris pemakaian kuota dengan bilah sederhana. */
function QuotaRow({
  label,
  used,
  limit,
  numLocale,
  unlimitedLabel,
}: {
  label: string;
  used: number;
  limit: number;
  numLocale: string;
  unlimitedLabel: string;
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
          {used.toLocaleString(numLocale)}
          {unlimited
            ? ` / ${unlimitedLabel}`
            : ` / ${limit.toLocaleString(numLocale)}`}
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
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.billing;
  const numLocale = numberLocale(locale);
  const me = useQuery(api.users.getMe);
  const invoices = useQuery(api.billing.myInvoices);
  const createCheckout = useAction(api.billingActions.createSubscriptionCheckout);
  const createEventCheckout = useAction(api.billingActions.createEventPassCheckout);
  const eventPasses = useQuery(api.billing.myEventPasses);

  // Paket acara bukan PlanId — ia pembelian sekali bayar, bukan langganan.
  // Tipe state dilebarkan alih-alih dipaksa cast, supaya pembedaan itu tetap
  // terbaca oleh pemeriksa tipe.
  const [busyPlan, setBusyPlan] = useState<PlanId | "event" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSelect = async (plan: PlanId, cycle: BillingCycle) => {
    setBusyPlan(plan);
    setNotice(null);
    try {
      const checkout = await createCheckout({ plan, billingCycle: cycle });
      const snap = await loadSnap(checkout.clientKey, checkout.isProduction);

      snap.pay(checkout.token, {
        onSuccess: () => setNotice(t.paySuccess),
        onPending: () => setNotice(t.payPending),
        onError: () => setNotice(t.payError),
        onClose: () => setNotice(t.payClosed),
      });
    } catch (err) {
      setNotice(errorMessage(err, t.checkoutFailed));
    } finally {
      setBusyPlan(null);
    }
  };

  const handleEventPass = async () => {
    setBusyPlan("event");
    setNotice(null);
    try {
      const checkout = await createEventCheckout({});
      const snap = await loadSnap(checkout.clientKey, checkout.isProduction);
      snap.pay(checkout.token, {
        onSuccess: () => setNotice(t.eventSuccess(EVENT_PASS.quota)),
        onPending: () => setNotice(t.eventPending),
        onError: () => setNotice(t.payError),
        onClose: () => setNotice(t.payClosedShort),
      });
    } catch (err) {
      setNotice(errorMessage(err, t.checkoutFailed));
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
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
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
              {t.activePlanLabel}
            </p>
            <p className="mt-1 text-3xl font-bold text-foreground">
              {planName(plan, locale)}
            </p>

            {me?.legacyFree && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
                <CheckCircle2 size={13} />
                {t.legacyBadge}
              </p>
            )}

            {me?.planExpiresAt && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock size={14} />
                {t.activeUntil}{" "}
                {format(new Date(me.planExpiresAt), "d MMMM yyyy", {
                  locale: dateLocale(locale),
                })}
              </p>
            )}
          </div>
        </div>

        {limits && usage && (
          <div className="mt-6 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
            <QuotaRow
              label={t.quota.microsites}
              used={usage.microsites}
              limit={limits.microsites}
              numLocale={numLocale}
              unlimitedLabel={t.quotaUnlimited}
            />
            <QuotaRow
              label={t.quota.forms}
              used={usage.forms}
              limit={limits.forms}
              numLocale={numLocale}
              unlimitedLabel={t.quotaUnlimited}
            />
            <QuotaRow
              label={t.quota.certificates(usage.period)}
              used={usage.certificatesSent}
              limit={limits.certificatesPerMonth}
              numLocale={numLocale}
              unlimitedLabel={t.quotaUnlimited}
            />
            <QuotaRow
              label={t.quota.products}
              used={usage.products}
              limit={limits.products}
              numLocale={numLocale}
              unlimitedLabel={t.quotaUnlimited}
            />
          </div>
        )}
      </div>

      {/* Paket Acara — sekali bayar, di luar langganan */}
      <div className="card-saweria p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Ticket size={18} className="text-brand" />
              <h3 className="font-bold text-foreground">{eventPassName(locale)}</h3>
            </div>
            <p className="mt-2 max-w-lg text-sm text-muted-foreground">
              {t.eventPassBody(
                EVENT_PASS.quota.toLocaleString(numLocale),
                EVENT_PASS.validDays
              )}
            </p>

            {eventPasses && eventPasses.remaining > 0 && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
                <CheckCircle2 size={13} />
                {t.eventPassRemaining(eventPasses.remaining.toLocaleString(numLocale))}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {formatIDR(EVENT_PASS.price, locale)}
            </p>
            <button
              onClick={handleEventPass}
              disabled={busyPlan === "event"}
              className="btn-saweria mt-3 flex items-center gap-2 px-6 py-2.5"
            >
              {busyPlan === "event" && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {t.eventPassBuy}
            </button>
          </div>
        </div>
      </div>

      {/* Pilihan paket */}
      <div>
        <h3 className="mb-6 text-lg font-bold text-foreground">{t.changePlan}</h3>
        <PricingTable
          currentPlan={plan}
          onSelect={handleSelect}
          busyPlan={busyPlan === "event" ? null : busyPlan}
          locale={locale}
        />
      </div>

      {/* Riwayat tagihan */}
      {invoices && invoices.length > 0 && (
        <div className="card-saweria p-6">
          <h3 className="mb-4 flex items-center gap-2 font-bold text-foreground">
            <Receipt size={18} className="text-brand" />
            {t.invoicesHeading}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-bold">{t.invoiceDate}</th>
                  <th className="pb-2 font-bold">{t.invoicePlan}</th>
                  <th className="pb-2 font-bold">{t.invoiceAmount}</th>
                  <th className="pb-2 font-bold">{t.invoiceStatus}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-border last:border-0">
                    <td className="py-3 text-muted-foreground">
                      {format(new Date(inv.createdAt), "d MMM yyyy", {
                        locale: dateLocale(locale),
                      })}
                    </td>
                    <td className="py-3 text-foreground">
                      {isPlanId(inv.plan) ? planName(inv.plan, locale) : inv.plan}{" "}
                      <span className="text-muted-foreground">
                        ({inv.billingCycle === "yearly" ? t.cycleYearly : t.cycleMonthly})
                      </span>
                    </td>
                    <td className="py-3 text-foreground">
                      {formatIDR(inv.amount, locale)}
                    </td>
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
                          ? t.statusPaid
                          : inv.status === "pending"
                            ? t.statusPending
                            : inv.status === "expired"
                              ? t.statusExpired
                              : t.statusFailed}
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
