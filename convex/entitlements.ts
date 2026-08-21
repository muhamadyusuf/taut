/**
 * LAPISAN ENTITLEMENT
 *
 * Satu-satunya tempat yang boleh menjawab "user ini boleh apa?".
 *
 * Wajib dipanggil DI DALAM mutation/query Convex. Menyembunyikan tombol di
 * React saja tidak menahan siapa pun: siapa pun bisa memanggil fungsi Convex
 * langsung dari console browser dengan token login mereka sendiri.
 */

import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import {
  FEATURE_LABELS,
  LIMIT_LABELS,
  PLANS,
  cheapestPlanWith,
  getLimit,
  getLimits,
  isUnlimited,
  isWithinLimit,
  planHasFeature,
  resolvePlan,
  type FeatureKey,
  type LimitKey,
  type Limits,
  type PlanId,
} from "./plans";

type Ctx = QueryCtx | MutationCtx;

export type Entitlements = {
  userId: string;
  email?: string;
  plan: PlanId;
  legacyFree: boolean;
  isAdmin: boolean;
  limits: Limits;
  planExpiresAt?: number;
};

// ---------------------------------------------------------------------------
// IDENTITAS
// ---------------------------------------------------------------------------

export async function requireIdentity(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  await assertNotBlocked(ctx, identity.subject);
  return identity;
}

/**
 * Menahan akun yang sudah diblokir admin.
 *
 * Diperiksa di lapisan identitas, bukan di tiap fitur satu per satu: akun yang
 * diblokir harus berhenti di semua pintu sekaligus, dan daftar pintu itu terus
 * bertambah setiap fitur baru ditulis.
 */
export async function assertNotBlocked(ctx: Ctx, clerkId: string): Promise<void> {
  const user = await getUserByClerkId(ctx, clerkId);
  if (!user?.blockedAt) return;

  // Penolakan ini TIDAK dicatat, dan itu disengaja: handler berakhir dengan
  // melempar, sehingga tulisan apa pun di sini akan dibatalkan bersama seluruh
  // transaksi. Mencatatnya hanya akan menghasilkan kode yang terlihat bekerja
  // padahal tidak. Riwayat pelanggaran akun yang bersangkutan toh sudah ada di
  // halaman keamanan — itulah yang jadi dasar pemblokirannya.
  throw new ConvexError({
    code: "ACCOUNT_BLOCKED",
    message: user.blockReason
      ? `Akun Anda dinonaktifkan: ${user.blockReason}`
      : "Akun Anda dinonaktifkan. Hubungi dukungan bila menurut Anda ini keliru.",
  });
}

export async function getUserByClerkId(
  ctx: Ctx,
  clerkId: string
): Promise<Doc<"users"> | null> {
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
}

/**
 * Entitlement milik sebuah akun, tanpa melihat siapa yang memanggil.
 *
 * Dipakai di jalur publik: pengunjung yang mengisi formulir atau membuka
 * tautan tidak punya identitas, tapi kuota yang berlaku adalah kuota PEMILIK
 * formulir/tautan tersebut.
 *
 * Aman dipanggil untuk akun yang barisnya belum sempat dibuat (misal ia
 * memanggil mutation sebelum dasbor sempat menjalankan users.ensureCurrent):
 * dianggap paket gratis, bukan error.
 */
export async function getEntitlementsForUser(
  ctx: Ctx,
  clerkId: string
): Promise<Entitlements> {
  const user = await getUserByClerkId(ctx, clerkId);
  const plan = resolvePlan(user);
  const legacyFree = user?.legacyFree ?? false;

  return {
    userId: clerkId,
    email: user?.email,
    plan,
    legacyFree,
    isAdmin: user?.role === "admin",
    limits: getLimits(plan, legacyFree),
    planExpiresAt: user?.planExpiresAt,
  };
}

/** Entitlement user yang sedang login. Akun terblokir ditolak di sini juga. */
export async function getEntitlements(ctx: Ctx): Promise<Entitlements> {
  const identity = await requireIdentity(ctx);
  const ent = await getEntitlementsForUser(ctx, identity.subject);
  return { ...ent, email: ent.email ?? identity.email ?? undefined };
}

// ---------------------------------------------------------------------------
// PENGECEKAN FITUR
// ---------------------------------------------------------------------------

export async function can(ctx: Ctx, feature: FeatureKey): Promise<boolean> {
  const { plan } = await getEntitlements(ctx);
  return planHasFeature(plan, feature);
}

/**
 * Versi untuk jalur publik: apakah PEMILIK sebuah entitas punya fitur tertentu.
 * Contoh pemakaian nanti: halaman antara melihat paket pemilik tautan untuk
 * memutuskan tampilkan iklan, lewati langsung, atau pakai branding pemilik.
 */
export async function userHasFeature(
  ctx: Ctx,
  clerkId: string,
  feature: FeatureKey
): Promise<boolean> {
  const { plan } = await getEntitlementsForUser(ctx, clerkId);
  return planHasFeature(plan, feature);
}

/** Versi jalur publik untuk kuota. Tidak melempar — pemanggil yang memutuskan. */
export async function isWithinLimitForUser(
  ctx: Ctx,
  clerkId: string,
  key: LimitKey,
  currentCount: number
): Promise<boolean> {
  const { plan, legacyFree } = await getEntitlementsForUser(ctx, clerkId);
  return isWithinLimit(plan, key, currentCount, legacyFree);
}

/**
 * Menahan akses ke fitur premium. Error-nya terstruktur supaya UI bisa
 * memunculkan ajakan upgrade yang tepat, bukan sekadar toast merah.
 */
export async function assertFeature(ctx: Ctx, feature: FeatureKey): Promise<Entitlements> {
  const ent = await getEntitlements(ctx);
  if (planHasFeature(ent.plan, feature)) return ent;

  const required = cheapestPlanWith(feature);
  throw new ConvexError({
    code: "UPGRADE_REQUIRED",
    feature,
    currentPlan: ent.plan,
    requiredPlan: required,
    message: required
      ? `${FEATURE_LABELS[feature]} tersedia mulai paket ${PLANS[required].name}.`
      : `${FEATURE_LABELS[feature]} belum tersedia.`,
  });
}

// ---------------------------------------------------------------------------
// PENGECEKAN KUOTA
// ---------------------------------------------------------------------------

/**
 * Menahan pembuatan entitas baru kalau kuota paket sudah penuh.
 * `currentCount` = jumlah yang sudah ada SEBELUM penambahan ini.
 */
export async function assertWithinLimit(
  ctx: Ctx,
  key: LimitKey,
  currentCount: number
): Promise<Entitlements> {
  const ent = await getEntitlements(ctx);
  if (isWithinLimit(ent.plan, key, currentCount, ent.legacyFree)) return ent;

  const limit = getLimit(ent.plan, key, ent.legacyFree);
  const upgrade = nextPlanWithHigherLimit(ent.plan, key, ent.legacyFree);

  throw new ConvexError({
    code: "QUOTA_EXCEEDED",
    limitKey: key,
    limit,
    currentPlan: ent.plan,
    requiredPlan: upgrade,
    message: upgrade
      ? `Paket ${PLANS[ent.plan].name} dibatasi ${limit} ${LIMIT_LABELS[key]}. Naik ke paket ${PLANS[upgrade].name} untuk menambah.`
      : `Batas ${limit} ${LIMIT_LABELS[key]} sudah tercapai.`,
  });
}

/** Paket termurah yang batasnya lebih longgar dari paket sekarang. */
function nextPlanWithHigherLimit(
  current: PlanId,
  key: LimitKey,
  legacyFree: boolean
): PlanId | null {
  const currentLimit = getLimit(current, key, legacyFree);
  if (isUnlimited(currentLimit)) return null;

  for (const id of ["pro", "business"] as const) {
    const candidate = getLimit(id, key);
    if (isUnlimited(candidate) || candidate > currentLimit) return id;
  }
  return null;
}

/** Menghitung isi tabel milik user. Semua tabel di sini punya index by_userId. */
export async function countOwned(
  ctx: Ctx,
  table: "links" | "microsites" | "forms" | "products" | "categories",
  userId: string
): Promise<number> {
  const rows = await ctx.db
    .query(table)
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();
  return rows.length;
}

// ---------------------------------------------------------------------------
// KUOTA BULANAN (sertifikat, panggilan API)
// ---------------------------------------------------------------------------

/** Periode "YYYY-MM" menurut zona Asia/Jakarta (UTC+7). */
export function currentPeriod(now: number = Date.now()): string {
  const jakarta = new Date(now + 7 * 60 * 60 * 1000);
  const month = String(jakarta.getUTCMonth() + 1).padStart(2, "0");
  return `${jakarta.getUTCFullYear()}-${month}`;
}

export type MeteredKey = "certificatesSent" | "apiCalls";

export async function getUsage(
  ctx: Ctx,
  userId: string,
  period: string = currentPeriod()
): Promise<Doc<"usage_counters"> | null> {
  return await ctx.db
    .query("usage_counters")
    .withIndex("by_userId_period", (q) => q.eq("userId", userId).eq("period", period))
    .first();
}

/**
 * Menahan pemakaian yang dihitung per bulan, lalu menambah pencatatnya.
 * Dipanggil dari mutation saja (butuh tulis).
 *
 * `amount` bisa lebih dari 1 untuk operasi massal — pengecekannya tetap satu
 * kali di depan, jadi kirim massal 100 sertifikat tidak bisa menembus sisa
 * kuota 10 dengan cara dipecah menjadi seratus panggilan.
 */
export async function consumeMonthlyQuota(
  ctx: MutationCtx,
  limitKey: Extract<LimitKey, "certificatesPerMonth">,
  meteredKey: MeteredKey,
  amount = 1
): Promise<void> {
  const ent = await getEntitlements(ctx);
  const limit = getLimit(ent.plan, limitKey, ent.legacyFree);
  const period = currentPeriod();
  const existing = await getUsage(ctx, ent.userId, period);
  const used = existing?.[meteredKey] ?? 0;

  const overBudget = !isUnlimited(limit) && used + amount > limit;

  // Jatah paket habis? Paket acara yang masih berlaku menanggung sisanya.
  // Dijumlahkan di atas jatah bulanan, bukan menggantikannya, supaya panitia
  // yang membeli paket acara tidak justru kehilangan kuota bawaannya.
  if (overBudget && (await consumeEventPass(ctx, ent.userId, amount))) {
    return;
  }

  if (overBudget) {
    const upgrade = nextPlanWithHigherLimit(ent.plan, limitKey, ent.legacyFree);
    throw new ConvexError({
      code: "QUOTA_EXCEEDED",
      limitKey,
      limit,
      used,
      currentPlan: ent.plan,
      requiredPlan: upgrade,
      message: upgrade
        ? `Kuota ${LIMIT_LABELS[limitKey]} paket ${PLANS[ent.plan].name} (${limit}) sudah terpakai ${used}. Naik ke paket ${PLANS[upgrade].name} untuk menambah.`
        : `Kuota ${LIMIT_LABELS[limitKey]} sudah habis.`,
    });
  }

  if (existing) {
    await ctx.db.patch(existing._id, { [meteredKey]: used + amount });
  } else {
    await ctx.db.insert("usage_counters", {
      userId: ent.userId,
      period,
      certificatesSent: meteredKey === "certificatesSent" ? amount : 0,
      apiCalls: meteredKey === "apiCalls" ? amount : 0,
    });
  }
}


/**
 * Memakai kuota dari paket acara yang masih berlaku.
 *
 * Mengembalikan false bila tidak ada paket yang sanggup menanggung seluruh
 * permintaan. Sengaja tidak memecah permintaan ke beberapa paket: pengiriman
 * massal yang separuhnya berhasil jauh lebih merepotkan panitia daripada yang
 * ditolak seluruhnya dengan pesan yang jelas.
 */
async function consumeEventPass(
  ctx: MutationCtx,
  userId: string,
  amount: number
): Promise<boolean> {
  const now = Date.now();

  const passes = await ctx.db
    .query("event_passes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  // Yang paling cepat kedaluwarsa dipakai lebih dulu supaya kuota tidak hangus
  // percuma saat pengguna memegang lebih dari satu paket.
  const usable = passes
    .filter((p) => p.expiresAt > now && p.quota - p.used >= amount)
    .sort((a, b) => a.expiresAt - b.expiresAt);

  const pass = usable[0];
  if (!pass) return false;

  await ctx.db.patch(pass._id, { used: pass.used + amount });
  return true;
}

/** Sisa kuota paket acara yang masih berlaku, untuk ditampilkan di dasbor. */
export async function eventPassBalance(
  ctx: Ctx,
  userId: string
): Promise<{ remaining: number; expiresAt: number | null }> {
  const now = Date.now();
  const passes = await ctx.db
    .query("event_passes")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .collect();

  const active = passes.filter((p) => p.expiresAt > now);
  const remaining = active.reduce((acc, p) => acc + (p.quota - p.used), 0);
  const soonest = active
    .map((p) => p.expiresAt)
    .sort((a, b) => a - b)[0];

  return { remaining, expiresAt: soonest ?? null };
}

// ---------------------------------------------------------------------------
// ADMIN
// ---------------------------------------------------------------------------

export async function isAdmin(ctx: Ctx): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const user = await getUserByClerkId(ctx, identity.subject);
  return user?.role === "admin";
}

/**
 * Menahan siapa pun yang bukan admin, lalu mengembalikan clerkId si admin.
 *
 * Nilai kembaliannya dipakai halaman keamanan untuk mencegah admin memblokir
 * dirinya sendiri. Penolakan ikut dicatat: memanggil fungsi admin tanpa hak
 * bukan kekeliruan yang wajar terjadi — pemanggilnya harus tahu lebih dulu
 * nama fungsinya.
 */
export async function assertAdmin(ctx: Ctx): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  const user = identity ? await getUserByClerkId(ctx, identity.subject) : null;

  if (user?.role !== "admin") {
    // Sama seperti assertNotBlocked: melempar membatalkan transaksi, jadi
    // mencatat di sini sia-sia. Yang menangkap orang yang mencari-cari fungsi
    // admin adalah umpan di convex/security.ts — fungsi bernama menggoda yang
    // sengaja BERAKHIR NORMAL supaya catatannya tersimpan.
    throw new Error("Unauthorized: Admin only");
  }

  return user.clerkId;
}
