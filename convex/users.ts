import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  currentPeriod,
  getEntitlements,
  getUsage,
  getUserByClerkId,
} from "./entitlements";
import {
  PAID_LAUNCH_AT,
  PLANS,
  getLimits,
  isPlanId,
  resolvePlan,
} from "./plans";

/**
 * Email yang otomatis mendapat peran admin saat barisnya pertama kali dibuat.
 *
 * Ini hanya jalur bootstrap supaya admin pertama tidak perlu diedit manual di
 * dashboard Convex. Sesudah baris ada, yang menentukan adalah kolom `role` —
 * bukan email — sehingga admin bisa ditambah/dicabut tanpa deploy ulang.
 */
const BOOTSTRAP_ADMIN_EMAILS = ["muhamadyusuf0012@gmail.com"];

/**
 * Membuat atau menyegarkan baris user untuk akun yang sedang login.
 *
 * Sengaja lazy (dipanggil dari klien saat dasbor dibuka), bukan lewat webhook
 * Clerk: tidak ada dependensi baru, tidak ada endpoint yang harus dikonfigurasi,
 * dan user lama ikut terdaftar begitu mereka membuka dasbor. Webhook Clerk
 * menyusul nanti untuk menangani perubahan email dan penghapusan akun.
 */
export const ensureCurrent = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const email = identity.email ?? undefined;
    const name = identity.name ?? undefined;
    const imageUrl = identity.pictureUrl ?? undefined;
    const now = Date.now();

    const existing = await getUserByClerkId(ctx, identity.subject);

    if (existing) {
      // Hanya tulis kalau memang ada yang berubah — mutation ini dipanggil di
      // setiap kunjungan dasbor, jadi jangan bikin tulisan sia-sia.
      const changed =
        existing.email !== email ||
        existing.name !== name ||
        existing.imageUrl !== imageUrl;

      const staleSeen = (existing.lastSeenAt ?? 0) < now - 60 * 60 * 1000;

      if (changed || staleSeen) {
        await ctx.db.patch(existing._id, {
          ...(changed ? { email, name, imageUrl } : {}),
          lastSeenAt: now,
        });
      }
      return existing._id;
    }

    const isBootstrapAdmin = !!email && BOOTSTRAP_ADMIN_EMAILS.includes(email);

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      email,
      name,
      imageUrl,
      role: isBootstrapAdmin ? "admin" : "user",
      plan: "free",
      // Akun yang tercatat sebelum paket berbayar dirilis tetap mendapat kuota
      // inti tanpa batas — janji "gratis selamanya" di landing page.
      legacyFree: now < PAID_LAUNCH_AT,
      createdAt: now,
      lastSeenAt: now,
    });
  },
});

/**
 * Ringkasan paket + sisa kuota untuk kebutuhan tampilan.
 *
 * Jangan pernah menjadikan hasil query ini satu-satunya penjaga fitur premium:
 * ini untuk menampilkan badge, progress kuota, dan tombol upgrade. Penjagaan
 * yang sebenarnya ada di convex/entitlements.ts, di dalam mutation.
 */
export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getUserByClerkId(ctx, identity.subject);
    const plan = resolvePlan(user);
    const legacyFree = user?.legacyFree ?? false;
    const usage = user ? await getUsage(ctx, identity.subject) : null;

    const [links, microsites, forms, products] = await Promise.all([
      ctx.db
        .query("links")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect(),
      ctx.db
        .query("microsites")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect(),
      ctx.db
        .query("forms")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect(),
      ctx.db
        .query("products")
        .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
        .collect(),
    ]);

    return {
      clerkId: identity.subject,
      email: user?.email ?? identity.email ?? null,
      name: user?.name ?? identity.name ?? null,
      role: user?.role ?? "user",
      isAdmin: user?.role === "admin",

      plan,
      planName: PLANS[plan].name,
      // Kolom mentah ikut dikirim supaya UI bisa membedakan "belum pernah
      // berlangganan" dari "langganan sudah lewat tanggal".
      storedPlan: user?.plan ?? "free",
      planExpiresAt: user?.planExpiresAt ?? null,
      legacyFree,

      limits: getLimits(plan, legacyFree),
      features: PLANS[plan].features,

      usage: {
        period: currentPeriod(),
        certificatesSent: usage?.certificatesSent ?? 0,
        links: links.length,
        microsites: microsites.length,
        forms: forms.length,
        products: products.length,
      },
    };
  },
});

/** Dipakai halaman admin untuk melihat daftar akun beserta paketnya. */
export const listAll = query({
  handler: async (ctx) => {
    const { isAdmin } = await getEntitlements(ctx);
    if (!isAdmin) throw new Error("Unauthorized: Admin only");

    const users = await ctx.db.query("users").order("desc").collect();
    return users.map((u) => ({
      ...u,
      effectivePlan: resolvePlan(u),
    }));
  },
});

/**
 * Admin mengubah paket sebuah akun secara manual.
 *
 * Dibutuhkan di luar alur pembayaran: kompensasi gangguan, akun uji coba,
 * kontrak institusi yang dibayar lewat transfer/PO, dan pemberian akses ke tim
 * sendiri. Alur Midtrans nanti memakai jalur terpisah (internal mutation), bukan
 * fungsi ini, supaya webhook tidak pernah butuh hak admin.
 */
export const setPlan = mutation({
  args: {
    clerkId: v.string(),
    plan: v.string(),
    /** Lama berlaku dalam hari. Kosongkan untuk paket tanpa tanggal akhir. */
    durationDays: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await getEntitlements(ctx);
    if (!actor.isAdmin) throw new Error("Unauthorized: Admin only");

    if (!isPlanId(args.plan)) {
      throw new Error(`Paket tidak dikenal: ${args.plan}`);
    }

    const target = await getUserByClerkId(ctx, args.clerkId);
    if (!target) throw new Error("Akun tidak ditemukan.");

    const now = Date.now();
    const expiresAt =
      args.plan === "free" || args.durationDays === undefined
        ? undefined
        : now + args.durationDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(target._id, {
      plan: args.plan,
      planExpiresAt: expiresAt,
    });

    // Dicatat sebagai langganan juga, supaya riwayat paket sebuah akun tetap
    // utuh di satu tabel — termasuk yang tidak lewat pembayaran.
    await ctx.db.insert("subscriptions", {
      userId: args.clerkId,
      plan: args.plan,
      billingCycle: args.durationDays === 365 ? "yearly" : "monthly",
      status: args.plan === "free" ? "expired" : "active",
      amount: 0,
      provider: "manual",
      providerOrderId: `MANUAL-${now}-${args.clerkId.slice(-6)}`,
      startedAt: now,
      expiresAt,
      createdAt: now,
    });

    return { plan: args.plan, expiresAt: expiresAt ?? null };
  },
});
