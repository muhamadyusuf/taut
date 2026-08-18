import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { getEntitlements, getEntitlementsForUser } from "./entitlements";
import { assertRateLimit, inspectUrl, linkStatusOf } from "./abuse";
import { internal } from "./_generated/api";
import { planHasFeature } from "./plans";

/**
 * Slug yang tidak boleh dipakai sebagai tautan pendek.
 *
 * Bukan sekadar soal rapi: shortcode hidup di route paling atas (/[shortCode]),
 * jadi slug yang bertabrakan dengan route statis Next.js akan kalah dan tautan
 * itu tersimpan di database tapi tidak pernah bisa dibuka. Sebelum daftar ini
 * dirapikan, "bio", "s", "f", dan "blog" masih bisa didaftarkan orang.
 *
 * Hanya berisi segmen pertama URL — pengecekannya memang membandingkan satu
 * segmen, sehingga entri seperti "dashboard/links" dulu tidak pernah cocok
 * dengan apa pun.
 */
const RESERVED_SLUGS = new Set([
  // Route aplikasi
  "dashboard",
  "admin",
  "app",
  "api",
  "bio",
  "s",
  "f",
  "blog",
  "pricing",
  "harga",

  // Autentikasi
  "sign-in",
  "sign-up",
  "signin",
  "signup",
  "login",
  "logout",
  "register",

  // Halaman statis
  "about",
  "contact",
  "terms",
  "privacy",
  "kebijakan",
  "syarat",
  "legal",
  "help",
  "support",
  "status",
  "docs",

  // Berkas & konvensi yang dilayani di akar domain
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "apple-touch-icon.jpg",
  "static",
  "public",
  "_next",
  "404",
  "500",

  // Cadangan untuk fitur yang sudah direncanakan
  "billing",
  "settings",
  "go",
  "qr",
  "v", // verifikasi sertifikat publik
]);

function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}

export const createLink = mutation({
  args: { 
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    title: v.optional(v.string()),
    // ARGS BARU: Menerima array ID kategori
    categoryIds: v.optional(v.array(v.id("categories"))) 
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Tautan ke skema berbahaya, jaringan lokal, atau kembali ke singkat.in
    // ditolak sebelum apa pun ditulis.
    const verdict = inspectUrl(args.originalUrl);
    if (!verdict.ok) throw new Error(verdict.reason);

    const ent = await getEntitlements(ctx);
    await assertRateLimit(ctx, "create_link", identity.subject, ent.plan);

    let shortCode: string;

    // 2. CEK APAKAH SLUG MASUK DAFTAR TERLARANG
    if (args.customSlug && isReservedSlug(args.customSlug)) {
        throw new Error("Nama link ini tidak boleh digunakan (Reserved Word).");
    }

    // ... (Logic generate shortCode sama seperti sebelumnya) ...
    if (args.customSlug && args.customSlug.trim() !== "") {
      shortCode = args.customSlug.trim();
      const existing = await ctx.db.query("links").withIndex("by_shortCode", (q) => q.eq("shortCode", shortCode)).first();
      if (existing) throw new Error("Link custom ini sudah dipakai orang lain.");
    } else {
      shortCode = Math.random().toString(36).substring(2, 7);
    }

    // 1. Simpan Link Utama
    const linkId = await ctx.db.insert("links", {
      originalUrl: verdict.normalized,
      shortCode: shortCode,
      userId: identity.subject,
      clicks: 0,
      title: args.title || "Untitled Link",
      createdAt: Date.now(),
      status: "active",
    });

    // Pemeriksaan Safe Browsing dijadwalkan, tidak ditunggu: panggilan jaringan
    // tidak boleh menahan pembuatan tautan, dan Google yang sedang mati tidak
    // boleh membuat pengguna gagal memendekkan tautannya.
    await ctx.scheduler.runAfter(0, internal.abuseActions.checkLinkSafety, {
      linkId,
      url: verdict.normalized,
    });

    // 2. Simpan Relasi Kategori (Looping)
    if (args.categoryIds && args.categoryIds.length > 0) {
      for (const catId of args.categoryIds) {
        await ctx.db.insert("link_categories", {
          linkId: linkId,
          categoryId: catId,
        });
      }
    }

    return shortCode;
  },
});

export const updateLink = mutation({
  args: {
    id: v.id("links"), // ID Link yang mau diedit
    originalUrl: v.string(),
    title: v.string(),
    customSlug: v.string(),
    categoryIds: v.array(v.id("categories")), // List kategori baru
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    if (args.customSlug && isReservedSlug(args.customSlug)) {
      throw new Error("Nama link ini tidak boleh digunakan (Reserved Word).");
    }
    
    // 1. Ambil data link lama
    const existingLink = await ctx.db.get(args.id);
    if (!existingLink || existingLink.userId !== identity.subject) {
      throw new Error("Link tidak ditemukan atau bukan milik Anda.");
    }

    // 2. Validasi Slug (Hanya jika slug berubah)
    const newSlug = args.customSlug.trim();
    
    // Jika user mengosongkan slug, atau slug-nya sama dengan yang lama, aman.
    // TAPI jika slug BEDA dari yang lama, kita harus cek ketersediaan.
    if (newSlug !== existingLink.shortCode) {
       const isTaken = await ctx.db
          .query("links")
          .withIndex("by_shortCode", (q) => q.eq("shortCode", newSlug))
          .first();
       
       if (isTaken) {
          throw new Error("Link custom ini sudah dipakai orang lain.");
       }
    }

    // 3. Update Data Link Utama
    const verdict = inspectUrl(args.originalUrl);
    if (!verdict.ok) throw new Error(verdict.reason);

    const destinationChanged = verdict.normalized !== existingLink.originalUrl;

    await ctx.db.patch(args.id, {
      originalUrl: verdict.normalized,
      title: args.title,
      shortCode: newSlug,
      // Mengganti tujuan ke alamat berbahaya setelah tautan tersebar adalah
      // pola penyalahgunaan yang paling sering dipakai, jadi status keamanan
      // disetel ulang dan tautannya diperiksa lagi.
      ...(destinationChanged ? { status: "active", flagReason: undefined } : {}),
    });

    if (destinationChanged) {
      await ctx.scheduler.runAfter(0, internal.abuseActions.checkLinkSafety, {
        linkId: args.id,
        url: verdict.normalized,
      });
    }

    // 4. Update Kategori (Reset & Re-insert)
    // Hapus semua kategori lama untuk link ini
    const oldRelations = await ctx.db
      .query("link_categories")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.id))
      .collect();
    
    for (const rel of oldRelations) {
      await ctx.db.delete(rel._id);
    }

    // Masukkan kategori baru
    for (const catId of args.categoryIds) {
      await ctx.db.insert("link_categories", {
        linkId: args.id,
        categoryId: catId,
      });
    }
  },
});

export const getMyLinks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    return await ctx.db.query("links").withIndex("by_userId", (q) => q.eq("userId", identity.subject)).order("desc").collect();
  },
});

/**
 * Data yang dibutuhkan halaman antara, lengkap dengan cara ia harus berperilaku.
 *
 * Perilaku ditentukan oleh paket PEMILIK tautan, bukan pengunjung — pengunjung
 * bahkan tidak login. Paket dibaca lewat satu pembacaan ber-index tambahan,
 * bukan disalin ke tabel links: menyalinnya berarti setiap upgrade harus
 * menulis ulang seluruh tautan milik user, dan satu tulisan yang meleset
 * membuat pelanggan yang sudah membayar tetap melihat iklan.
 */
export const getUrlByCode = query({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("links")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .first();

    if (!link) return null;

    const owner = await getEntitlementsForUser(ctx, link.userId);

    let mode: "skip" | "ads" | "branded" = "ads";
    let brand: {
      displayName: string;
      logoUrl?: string;
      primaryColor?: string;
      tagline?: string;
      ctaLabel?: string;
      ctaUrl?: string;
    } | null = null;

    if (planHasFeature(owner.plan, "whitelabel_interstitial")) {
      const settings = await ctx.db
        .query("brand_settings")
        .withIndex("by_userId", (q) => q.eq("userId", link.userId))
        .first();

      if (settings?.enabled) {
        mode = "branded";
        brand = {
          displayName: settings.displayName,
          logoUrl: settings.logoUrl,
          primaryColor: settings.primaryColor,
          tagline: settings.tagline,
          ctaLabel: settings.ctaLabel,
          ctaUrl: settings.ctaUrl,
        };
      }
    }

    // Belum memasang branding sendiri? Paket berbayar tetap melompat langsung.
    if (mode !== "branded" && planHasFeature(owner.plan, "skip_interstitial")) {
      mode = "skip";
    }

    return {
      originalUrl: link.originalUrl,
      shortCode: link.shortCode,
      title: link.title,
      mode,
      brand,
      safety: linkStatusOf(link),
      flagReason: link.flagReason ?? null,
    };
  },
});

/**
 * Mencatat satu klik lalu mengembalikan URL tujuan.
 *
 * Atribut pengunjung (negara, perangkat, perujuk) diturunkan dari header HTTP
 * di komponen server halaman redirect, bukan ditebak di sini: mutation Convex
 * dipanggil langsung dari browser lewat websocket dan tidak pernah melihat
 * header permintaan maupun alamat IP. Semuanya opsional — klik tetap tercatat
 * walau atributnya tidak diketahui.
 */
export const getLinkAndIncrement = mutation({
  args: {
    shortCode: v.string(),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    device: v.optional(v.string()),
    os: v.optional(v.string()),
    browser: v.optional(v.string()),
    referrerHost: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const link = await ctx.db
      .query("links")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .first();

    if (!link) return null;

    const now = Date.now();

    // Penghitung lama tetap dipelihara: seluruh dasbor dan halaman admin yang
    // sudah ada membacanya, dan angkanya tidak boleh mundur gara-gara fitur baru.
    await ctx.db.patch(link._id, { clicks: link.clicks + 1 });

    await ctx.db.insert("click_events", {
      linkId: link._id,
      userId: link.userId,
      ts: now,
      country: args.country,
      city: args.city,
      device: args.device,
      os: args.os,
      browser: args.browser,
      referrerHost: args.referrerHost,
    });

    await bumpDailyRollup(ctx, link, now, args);

    return link.originalUrl;
  },
});

/** Tanggal "YYYY-MM-DD" menurut WIB. */
function jakartaDate(ts: number): string {
  const d = new Date(ts + 7 * 60 * 60 * 1000);
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${d.getUTCFullYear()}-${month}-${day}`;
}

function increment(
  bucket: Record<string, number>,
  key: string | undefined
): Record<string, number> {
  const k = key && key.trim() !== "" ? key : "Tidak diketahui";
  return { ...bucket, [k]: (bucket[k] ?? 0) + 1 };
}

/**
 * Menambah ringkasan harian yang dibaca grafik.
 *
 * Ditulis bersamaan dengan peristiwanya, bukan lewat pekerjaan terjadwal:
 * ringkasan yang dihitung belakangan berarti dasbor selalu tertinggal, dan
 * pengguna yang baru menyebarkan tautannya justru menatap angka nol.
 */
async function bumpDailyRollup(
  ctx: MutationCtx,
  link: Doc<"links">,
  ts: number,
  args: {
    country?: string;
    device?: string;
    referrerHost?: string;
  }
) {
  const date = jakartaDate(ts);

  const existing = await ctx.db
    .query("click_daily")
    .withIndex("by_linkId_date", (q) => q.eq("linkId", link._id).eq("date", date))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      byCountry: increment(existing.byCountry, args.country),
      byDevice: increment(existing.byDevice, args.device),
      byReferrer: increment(existing.byReferrer, args.referrerHost),
    });
    return;
  }

  await ctx.db.insert("click_daily", {
    userId: link.userId,
    linkId: link._id,
    date,
    count: 1,
    byCountry: increment({}, args.country),
    byDevice: increment({}, args.device),
    byReferrer: increment({}, args.referrerHost),
  });
}

export const getLinksByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // 1. Ambil semua relasi di tabel pivot berdasarkan categoryId
    const relations = await ctx.db
      .query("link_categories")
      .withIndex("by_categoryId", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    // 2. Ambil detail Link aslinya
    const results = [];
    for (const rel of relations) {
      const link = await ctx.db.get(rel.linkId);
      // Pastikan link ada dan milik user yang sama
      if (link && link.userId === identity.subject) {
        results.push(link);
      }
    }

    // Urutkan dari yang terbaru
    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const deleteLink = mutation({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Tidak diizinkan");
    }

    // 1. Hapus dulu relasi kategorinya (Bersih-bersih)
    const relations = await ctx.db
      .query("link_categories")
      .withIndex("by_linkId", (q) => q.eq("linkId", args.id))
      .collect();
    
    for (const rel of relations) {
      await ctx.db.delete(rel._id);
    }

    // 2. Baru hapus Link utamanya
    await ctx.db.delete(args.id);
  },
});