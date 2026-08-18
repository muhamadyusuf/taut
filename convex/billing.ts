/**
 * LANGGANAN PAKET (sisi database)
 *
 * Perhatikan bedanya dengan convex/shop.ts: di sana Midtrans dipakai dengan key
 * MILIK PENJUAL (uang langsung masuk rekening mereka). Di sini yang dipakai
 * adalah akun Midtrans milik singkat.in sendiri. Dua jalur ini tidak boleh
 * bercampur — termasuk webhook-nya, yang sengaja beda endpoint.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { getEntitlements, getUserByClerkId } from "./entitlements";
import { EVENT_PASS, PLANS, type PlanId } from "./plans";

/** Lama berlaku tiap siklus, dalam hari. */
export const CYCLE_DAYS: Record<string, number> = {
  monthly: 30,
  yearly: 365,
};

export function priceOf(plan: PlanId, billingCycle: string): number {
  const def = PLANS[plan];
  return billingCycle === "yearly" ? def.priceYearly : def.priceMonthly;
}

// ---------------------------------------------------------------------------
// QUERY UNTUK UI
// ---------------------------------------------------------------------------

/** Riwayat pembelian paket milik user yang sedang login. */
export const myInvoices = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// ---------------------------------------------------------------------------
// DIPAKAI OLEH ACTION (Node) — checkout & webhook
// ---------------------------------------------------------------------------

export const getSubscriptionByOrderId = internalQuery({
  args: { providerOrderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_providerOrderId", (q) =>
        q.eq("providerOrderId", args.providerOrderId)
      )
      .first();
  },
});

export const createPendingSubscription = internalMutation({
  args: {
    userId: v.string(),
    plan: v.string(),
    billingCycle: v.string(),
    amount: v.number(),
    providerOrderId: v.string(),
    snapToken: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("subscriptions", {
      userId: args.userId,
      plan: args.plan,
      billingCycle: args.billingCycle,
      status: "pending",
      amount: args.amount,
      provider: "midtrans",
      providerOrderId: args.providerOrderId,
      snapToken: args.snapToken,
      createdAt: Date.now(),
    });
  },
});

/**
 * Mengaktifkan paket setelah pembayaran benar-benar lunas.
 *
 * Wajib aman dipanggil berulang: Midtrans mengirim notifikasi yang sama lebih
 * dari sekali (retry, dan status settlement bisa menyusul capture). Tanpa
 * penjaga ini, satu pembayaran bisa menambah masa aktif dua atau tiga kali.
 */
export const activateSubscription = internalMutation({
  args: { providerOrderId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_providerOrderId", (q) =>
        q.eq("providerOrderId", args.providerOrderId)
      )
      .first();

    if (!sub) return { ok: false, reason: "not_found" as const };
    if (sub.status === "active") {
      return { ok: true, reason: "already_active" as const };
    }

    const user = await getUserByClerkId(ctx, sub.userId);
    if (!user) return { ok: false, reason: "user_not_found" as const };

    const now = Date.now();
    const days = CYCLE_DAYS[sub.billingCycle] ?? 30;

    // Perpanjangan menumpuk pada sisa masa aktif yang belum terpakai, bukan
    // memotongnya. User yang memperpanjang lebih awal tidak dirugikan.
    const stillActive =
      user.planExpiresAt !== undefined && user.planExpiresAt > now;
    const base = stillActive && user.plan === sub.plan ? user.planExpiresAt! : now;
    const expiresAt = base + days * 24 * 60 * 60 * 1000;

    await ctx.db.patch(user._id, {
      plan: sub.plan,
      planExpiresAt: expiresAt,
    });

    await ctx.db.patch(sub._id, {
      status: "active",
      startedAt: now,
      expiresAt,
    });

    return { ok: true, reason: "activated" as const, expiresAt };
  },
});

/**
 * Menerbitkan kuota paket acara setelah pembayarannya lunas.
 *
 * Sengaja TIDAK menyentuh kolom plan pada users: paket acara menambah kuota
 * sertifikat, bukan menaikkan langganan. Menaikkan paket di sini akan diam-diam
 * memberi fitur premium lain yang tidak dibeli, lalu mencabutnya sebulan
 * kemudian.
 */
export const activateEventPass = internalMutation({
  args: { providerOrderId: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_providerOrderId", (q) =>
        q.eq("providerOrderId", args.providerOrderId)
      )
      .first();

    if (!sub) return { ok: false, reason: "not_found" as const };
    if (sub.status === "active") return { ok: true, reason: "already_active" as const };

    const now = Date.now();
    const expiresAt = now + EVENT_PASS.validDays * 24 * 60 * 60 * 1000;

    await ctx.db.insert("event_passes", {
      userId: sub.userId,
      quota: EVENT_PASS.quota,
      used: 0,
      expiresAt,
      providerOrderId: args.providerOrderId,
      createdAt: now,
    });

    await ctx.db.patch(sub._id, { status: "active", startedAt: now, expiresAt });

    return { ok: true, reason: "activated" as const, expiresAt };
  },
});

export const markSubscriptionFailed = internalMutation({
  args: { providerOrderId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_providerOrderId", (q) =>
        q.eq("providerOrderId", args.providerOrderId)
      )
      .first();

    if (!sub) return;
    // Pembayaran yang sudah pernah lunas tidak boleh dibatalkan oleh notifikasi
    // susulan yang datang terlambat atau di luar urutan.
    if (sub.status === "active") return;

    await ctx.db.patch(sub._id, { status: args.status });
  },
});

// ---------------------------------------------------------------------------
// PENURUNAN PAKET SAAT MASA AKTIF HABIS
// ---------------------------------------------------------------------------

/**
 * Merapikan akun yang masa aktifnya sudah lewat.
 *
 * Ini hanya kerja kebersihan supaya data tidak menyesatkan saat dibaca admin.
 * Hak akses tidak bergantung pada fungsi ini: resolvePlan() di convex/plans.ts
 * sudah menghitung langganan kedaluwarsa sebagai gratis, jadi telat atau
 * gagalnya cron tidak pernah membuat user menikmati paket yang sudah habis.
 */
export const expireOverduePlans = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let downgraded = 0;

    for (const planId of ["pro", "business"] as const) {
      const users = await ctx.db
        .query("users")
        .withIndex("by_plan", (q) => q.eq("plan", planId))
        .collect();

      for (const user of users) {
        if (user.planExpiresAt !== undefined && user.planExpiresAt < now) {
          await ctx.db.patch(user._id, { plan: "free", planExpiresAt: undefined });
          downgraded += 1;
        }
      }
    }

    const subs = await ctx.db.query("subscriptions").collect();
    for (const sub of subs) {
      if (
        sub.status === "active" &&
        sub.expiresAt !== undefined &&
        sub.expiresAt < now
      ) {
        await ctx.db.patch(sub._id, { status: "expired" });
      }
    }

    return { downgraded };
  },
});

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------

/** Ringkasan pendapatan langganan untuk dasbor admin. */
export const getRevenueSummary = query({
  handler: async (ctx) => {
    const { isAdmin } = await getEntitlements(ctx);
    if (!isAdmin) throw new Error("Unauthorized: Admin only");

    const subs = await ctx.db.query("subscriptions").collect();
    const paid = subs.filter((s) => s.status === "active" && s.amount > 0);

    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      totalRevenue: paid.reduce((acc, s) => acc + s.amount, 0),
      revenue30d: paid
        .filter((s) => s.createdAt >= thirtyDaysAgo)
        .reduce((acc, s) => acc + s.amount, 0),
      activeSubscribers: new Set(
        subs
          .filter((s) => s.status === "active" && (s.expiresAt ?? 0) > now)
          .map((s) => s.userId)
      ).size,
      pendingCheckouts: subs.filter((s) => s.status === "pending").length,
    };
  },
});

// ---------------------------------------------------------------------------
// PROFIL PEMBELI (dibaca action saat menyiapkan pembayaran)
// ---------------------------------------------------------------------------

/** Sisa kuota paket acara milik pengguna yang sedang login. */
export const myEventPasses = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const now = Date.now();
    const passes = await ctx.db
      .query("event_passes")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const active = passes.filter((p) => p.expiresAt > now);

    return {
      active,
      remaining: active.reduce((acc, p) => acc + (p.quota - p.used), 0),
    };
  },
});

export const getBillingProfile = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByClerkId(ctx, args.userId);
    if (!user) return null;

    return {
      email: user.email ?? null,
      name: user.name ?? null,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt ?? null,
    };
  },
});
