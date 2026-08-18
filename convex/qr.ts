/**
 * GAYA KODE QR
 *
 * Paket gratis memakai gaya bawaan singkat.in. Paket berbayar boleh mengganti
 * warna, logo, dan bentuk modul agar QR-nya senada dengan materi cetak mereka.
 *
 * Catatan penting soal keterbacaan: QR tetap harus bisa dipindai. Kontras
 * minimum dan ukuran logo maksimum divalidasi di sini, bukan diserahkan ke UI —
 * QR yang sudah dicetak di seribu brosur dan ternyata tidak terbaca adalah
 * kerugian yang tidak bisa dibatalkan.
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertFeature, getEntitlements, requireIdentity } from "./entitlements";
import { planHasFeature } from "./plans";
import { DEFAULT_QR_STYLE } from "./qrDefaults";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const DOT_STYLES = ["squares", "dots", "fluid"];

/** Luminansi relatif (WCAG) untuk mengukur kontras dua warna. */
function relativeLuminance(hex: string): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [light, dark] = la > lb ? [la, lb] : [lb, la];
  return (light + 0.05) / (dark + 0.05);
}

export const getMySettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const settings = await ctx.db
      .query("qr_settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    const ent = await getEntitlements(ctx);

    return {
      style: settings
        ? {
            fgColor: settings.fgColor,
            bgColor: settings.bgColor,
            logoUrl: settings.logoUrl,
            logoSizeRatio: settings.logoSizeRatio,
            dotStyle: settings.dotStyle,
            quietZone: settings.quietZone,
          }
        : DEFAULT_QR_STYLE,
      // Dibaca dari katalog, bukan dibandingkan dengan "free": kalau suatu saat
      // fitur ini digeser antar paket, tidak ada tempat kedua yang harus diubah.
      canCustomize: planHasFeature(ent.plan, "branded_qr"),
      canDownloadVector: planHasFeature(ent.plan, "vector_qr"),
      plan: ent.plan,
    };
  },
});

export const saveSettings = mutation({
  args: {
    fgColor: v.string(),
    bgColor: v.string(),
    logoUrl: v.optional(v.string()),
    logoSizeRatio: v.number(),
    dotStyle: v.string(),
    quietZone: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertFeature(ctx, "branded_qr");

    if (!HEX_COLOR.test(args.fgColor) || !HEX_COLOR.test(args.bgColor)) {
      throw new Error("Warna harus berupa kode heksadesimal, contoh #0193ff.");
    }

    // Pemindai butuh kontras. 3:1 adalah batas praktis di bawah mana pembacaan
    // mulai gagal pada kamera ponsel biasa dan pencahayaan seadanya.
    if (contrastRatio(args.fgColor, args.bgColor) < 3) {
      throw new Error(
        "Kontras warna terlalu rendah — QR berisiko tidak terbaca pemindai. Pilih warna depan yang jauh lebih gelap atau lebih terang dari latarnya."
      );
    }

    if (!DOT_STYLES.includes(args.dotStyle)) {
      throw new Error("Bentuk modul tidak dikenal.");
    }

    // Logo menutupi sebagian modul dan ditebus oleh koreksi galat level H, yang
    // sanggup memulihkan sekitar 30%. Di atas 0.3 pemulihan itu habis.
    if (args.logoSizeRatio < 0.1 || args.logoSizeRatio > 0.3) {
      throw new Error("Ukuran logo harus antara 10% dan 30% dari lebar QR.");
    }

    if (args.quietZone < 2 || args.quietZone > 20) {
      throw new Error("Margin QR harus antara 2 dan 20 piksel.");
    }

    if (args.logoUrl) {
      let parsed: URL;
      try {
        parsed = new URL(args.logoUrl);
      } catch {
        throw new Error("URL logo tidak valid.");
      }
      if (parsed.protocol !== "https:") {
        throw new Error("URL logo harus memakai https.");
      }
    }

    const payload = {
      userId: identity.subject,
      fgColor: args.fgColor,
      bgColor: args.bgColor,
      logoUrl: args.logoUrl || undefined,
      logoSizeRatio: args.logoSizeRatio,
      dotStyle: args.dotStyle,
      quietZone: args.quietZone,
      updatedAt: Date.now(),
    };

    const existing = await ctx.db
      .query("qr_settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("qr_settings", payload);
  },
});

/** Kembali ke gaya bawaan singkat.in. */
export const resetSettings = mutation({
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);

    const existing = await ctx.db
      .query("qr_settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();

    if (existing) await ctx.db.delete(existing._id);
  },
});
