/**
 * WEBHOOK KELUAR
 *
 * Setiap kiriman ditandatangani HMAC-SHA256 dengan rahasia milik endpoint
 * tersebut. Tanpa tanda tangan, penerima tidak punya cara membedakan kiriman
 * kami dari siapa pun yang menebak alamat endpoint-nya.
 */

import { v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import {
  assertFeature,
  getEntitlements,
  getEntitlementsForUser,
  requireIdentity,
} from "./entitlements";
import { planHasFeature } from "./plans";

export const SUPPORTED_EVENTS = ["link.created", "link.clicked"] as const;

function generateSecret(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return (
    "whsec_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export const listMine = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const ent = await getEntitlements(ctx);
    const hooks = await ctx.db
      .query("webhooks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const deliveries = await ctx.db
      .query("webhook_deliveries")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(20);

    return {
      webhooks: hooks,
      deliveries,
      canUse: planHasFeature(ent.plan, "webhooks"),
      plan: ent.plan,
    };
  },
});

export const create = mutation({
  args: { url: v.string(), events: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertFeature(ctx, "webhooks");

    let parsed: URL;
    try {
      parsed = new URL(args.url);
    } catch {
      throw new Error("URL webhook tidak valid.");
    }
    // https saja: isi kiriman memuat data tautan pelanggan, dan http polos
    // membuatnya terbaca siapa pun di jalur jaringan.
    if (parsed.protocol !== "https:") {
      throw new Error("URL webhook harus memakai https.");
    }

    const events = args.events.filter((e) =>
      (SUPPORTED_EVENTS as readonly string[]).includes(e)
    );
    if (events.length === 0) {
      throw new Error("Pilih minimal satu jenis kejadian.");
    }

    const existing = await ctx.db
      .query("webhooks")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    if (existing.length >= 5) {
      throw new Error("Maksimal 5 webhook per akun.");
    }

    return await ctx.db.insert("webhooks", {
      userId: identity.subject,
      url: parsed.toString(),
      events,
      secret: generateSecret(),
      active: true,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("webhooks") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== identity.subject) {
      throw new Error("Webhook tidak ditemukan atau bukan milik Anda.");
    }
    await ctx.db.delete(args.id);
  },
});

// ---------------------------------------------------------------------------
// PENGIRIMAN
// ---------------------------------------------------------------------------

export const getTargets = internalQuery({
  args: { userId: v.string(), event: v.string() },
  handler: async (ctx, args) => {
    // Paket pemilik diperiksa pada setiap pengiriman, bukan hanya saat webhook
    // didaftarkan. Tanpa ini, endpoint yang terlanjur terdaftar akan terus
    // menerima kiriman selamanya walau langganannya sudah lama berakhir.
    const owner = await getEntitlementsForUser(ctx, args.userId);
    if (!planHasFeature(owner.plan, "webhooks")) return [];

    const hooks = await ctx.db
      .query("webhooks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    return hooks
      .filter((h) => h.active && h.events.includes(args.event))
      .map((h) => ({ id: h._id, url: h.url, secret: h.secret }));
  },
});

export const recordDelivery = internalMutation({
  args: {
    webhookId: v.id("webhooks"),
    userId: v.string(),
    event: v.string(),
    status: v.string(),
    statusCode: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("webhook_deliveries", {
      webhookId: args.webhookId,
      userId: args.userId,
      event: args.event,
      status: args.status,
      statusCode: args.statusCode,
      error: args.error,
      createdAt: Date.now(),
    });

    // Riwayat dipangkas agar tidak tumbuh tanpa batas; yang berguna bagi
    // pengguna hanya kiriman terakhir saat mereka sedang men-debug.
    const all = await ctx.db
      .query("webhook_deliveries")
      .withIndex("by_webhookId", (q) => q.eq("webhookId", args.webhookId))
      .order("desc")
      .collect();

    for (const old of all.slice(50)) {
      await ctx.db.delete(old._id);
    }
  },
});
