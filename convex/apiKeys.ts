/**
 * KUNCI API
 *
 * Kunci lengkap hanya pernah ada satu kali: pada respons pembuatan. Setelahnya
 * yang tersimpan hanya sidik jarinya. Ini keputusan yang disengaja dan berarti
 * kunci yang hilang harus dicabut lalu dibuat ulang — konsekuensi yang jauh
 * lebih ringan daripada basis data bocor yang langsung berisi akses penuh ke
 * akun setiap pelanggan.
 */

import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import { assertFeature, getEntitlements, requireIdentity } from "./entitlements";
import { planHasFeature } from "./plans";

const KEY_PREFIX = "sk_live_";

/**
 * SHA-256 lewat Web Crypto, tersedia di runtime Convex tanpa dependensi.
 *
 * Kunci API punya entropi tinggi dan acak seragam, jadi hash cepat sudah cukup
 * — berbeda dari kata sandi manusia yang butuh fungsi lambat karena bisa
 * ditebak dari kamus.
 */
export async function hashKey(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const body = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${KEY_PREFIX}${body}`;
}

export const listMine = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const ent = await getEntitlements(ctx);
    const keys = await ctx.db
      .query("api_keys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return {
      // Kolom hash tidak pernah ikut keluar, bahkan ke pemiliknya sendiri.
      keys: keys
        .filter((k) => !k.revokedAt)
        .map((k) => ({
          _id: k._id,
          name: k.name,
          prefix: k.prefix,
          createdAt: k.createdAt,
          lastUsedAt: k.lastUsedAt ?? null,
        })),
      plan: ent.plan,
      canUse: planHasFeature(ent.plan, "api_access"),
    };
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertFeature(ctx, "api_access");

    const name = args.name.trim() || "Kunci tanpa nama";

    const existing = await ctx.db
      .query("api_keys")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    if (existing.filter((k) => !k.revokedAt).length >= 10) {
      throw new Error("Maksimal 10 kunci aktif. Cabut yang tidak dipakai lebih dulu.");
    }

    const raw = generateKey();
    const hash = await hashKey(raw);

    await ctx.db.insert("api_keys", {
      userId: identity.subject,
      name,
      prefix: raw.slice(0, KEY_PREFIX.length + 8),
      hash,
      createdAt: Date.now(),
    });

    // Satu-satunya saat kunci lengkap terlihat.
    return { key: raw };
  },
});

export const revoke = mutation({
  args: { id: v.id("api_keys") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== identity.subject) {
      throw new Error("Kunci tidak ditemukan atau bukan milik Anda.");
    }
    await ctx.db.patch(args.id, { revokedAt: Date.now() });
  },
});

/**
 * Menukar kunci mentah dengan identitas pemiliknya.
 *
 * Dipakai endpoint HTTP, yang tidak punya sesi login. Mengembalikan null untuk
 * kunci tak dikenal, dicabut, atau milik akun yang paketnya tidak lagi
 * mencakup akses API — status berlangganan diperiksa di sini, bukan hanya saat
 * kuncinya dibuat.
 */
export const resolveKey = internalMutation({
  args: { hash: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("api_keys")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .first();

    if (!row || row.revokedAt) return null;

    await ctx.db.patch(row._id, { lastUsedAt: Date.now() });
    return { userId: row.userId };
  },
});

/** Membaca sidik jari kunci tanpa menulis apa pun. Untuk query-only endpoint. */
export async function findKeyOwner(
  ctx: QueryCtx | MutationCtx,
  hash: string
): Promise<string | null> {
  const row = await ctx.db
    .query("api_keys")
    .withIndex("by_hash", (q) => q.eq("hash", hash))
    .first();

  if (!row || row.revokedAt) return null;
  return row.userId;
}
