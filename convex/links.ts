import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import {
  assertFeature,
  getEntitlements,
  getEntitlementsForUser,
  requireIdentity,
} from "./entitlements";
import {
  assertAttemptQuota,
  assertRateLimit,
  inspectUrl,
  linkStatusOf,
  recordFailedAttempt,
} from "./abuse";
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

/**
 * Bentuk kode pendek yang sah.
 *
 * Kode pendek menjadi satu segmen URL di akar domain, jadi karakter di luar
 * daftar ini bukan sekadar tidak rapi: spasi dan garis miring membuat tautan
 * yang tersimpan tidak pernah bisa dibuka, dan aksara non-latin yang mirip
 * huruf biasa adalah bahan penyamaran alamat.
 */
const SLUG_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

/**
 * Memeriksa kode pendek pilihan pengguna dan mengembalikan bentuk bakunya.
 * Melempar, bukan mengembalikan null, supaya pemanggil tidak bisa lupa memeriksa.
 */
export function normalizeSlug(raw: string): string {
  const slug = raw.trim();

  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      "Kode pendek hanya boleh berisi huruf, angka, titik, garis bawah, dan tanda hubung (maksimal 64 karakter)."
    );
  }
  if (isReservedSlug(slug)) {
    throw new Error("Nama link ini tidak boleh digunakan (Reserved Word).");
  }

  return slug;
}


/**
 * Memastikan subdomain yang diminta benar-benar milik pemanggil.
 *
 * Tanpa ini, siapa pun bisa menitipkan tautan ke subdomain orang lain hanya
 * dengan mengirim namanya lewat argumen — dan tautan itu akan tampil seolah
 * berasal dari merek pemilik subdomain tersebut.
 */
async function resolveOwnedSubdomain(
  ctx: MutationCtx,
  userId: string,
  requested: string | undefined
): Promise<string | undefined> {
  if (!requested || requested.trim() === "") return undefined;

  const value = requested.trim().toLowerCase();
  const owned = await ctx.db
    .query("subdomains")
    .withIndex("by_subdomain", (q) => q.eq("subdomain", value))
    .first();

  if (!owned || owned.userId !== userId) {
    throw new Error("Subdomain itu bukan milik Anda.");
  }

  return value;
}

/** Cek tabrakan kode pendek di dalam satu ruang nama (subdomain atau domain utama). */
async function shortCodeTaken(
  ctx: MutationCtx,
  subdomain: string | undefined,
  shortCode: string
) {
  return await ctx.db
    .query("links")
    .withIndex("by_subdomain_shortCode", (q) =>
      q.eq("subdomain", subdomain).eq("shortCode", shortCode)
    )
    .first();
}

export const createLink = mutation({
  args: { 
    originalUrl: v.string(),
    customSlug: v.optional(v.string()),
    title: v.optional(v.string()),
    // ARGS BARU: Menerima array ID kategori
    categoryIds: v.optional(v.array(v.id("categories"))),
    subdomain: v.optional(v.string()),

    // Proteksi ikut di panggilan yang sama, bukan mutation kedua: tautan yang
    // sempat hidup tanpa sandi walau sedetik tetap tautan yang bocor.
    expiresAt: v.optional(v.union(v.number(), v.null())),
    maxClicks: v.optional(v.union(v.number(), v.null())),
    password: v.optional(v.string()),
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

    const subdomain = await resolveOwnedSubdomain(
      ctx,
      identity.subject,
      args.subdomain
    );

    let shortCode: string;

    // 2. VALIDASI BENTUK + DAFTAR TERLARANG
    if (args.customSlug && args.customSlug.trim() !== "") {
      shortCode = normalizeSlug(args.customSlug);
      if (await shortCodeTaken(ctx, subdomain, shortCode)) {
        throw new Error("Link custom ini sudah dipakai di alamat tersebut.");
      }
    } else {
      // Kode acak pun bisa bertabrakan; ulangi sampai benar-benar bebas.
      let attempt = 0;
      do {
        shortCode = Math.random().toString(36).substring(2, 7);
        attempt += 1;
        if (attempt > 20) throw new Error("Gagal membuat kode unik. Coba lagi.");
      } while (await shortCodeTaken(ctx, subdomain, shortCode));
    }

    // Proteksi divalidasi SEBELUM tautan ditulis. Kalau paketnya tidak
    // mencakup, tidak ada baris setengah jadi yang tertinggal di basis data.
    let expiresAt: number | undefined;
    let maxClicks: number | undefined;
    let passwordHash: string | undefined;

    const memintaProteksi =
      (args.expiresAt !== undefined && args.expiresAt !== null) ||
      (args.maxClicks !== undefined && args.maxClicks !== null);

    if (memintaProteksi) {
      await assertFeature(ctx, "link_expiry");

      if (args.expiresAt !== undefined && args.expiresAt !== null) {
        if (args.expiresAt <= Date.now()) {
          throw new Error("Tanggal kedaluwarsa harus di masa depan.");
        }
        expiresAt = args.expiresAt;
      }
      if (args.maxClicks !== undefined && args.maxClicks !== null) {
        if (args.maxClicks < 1) throw new Error("Batas klik minimal 1.");
        maxClicks = args.maxClicks;
      }
    }

    if (args.password) {
      await assertFeature(ctx, "link_password");
      if (args.password.length < 4) {
        throw new Error("Sandi minimal 4 karakter.");
      }
      passwordHash = await hashPassword(args.password, shortCode);
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
      subdomain,
      expiresAt,
      maxClicks,
      passwordHash,
    });

    // Pemeriksaan Safe Browsing dijadwalkan, tidak ditunggu: panggilan jaringan
    // tidak boleh menahan pembuatan tautan, dan Google yang sedang mati tidak
    // boleh membuat pengguna gagal memendekkan tautannya.
    await ctx.scheduler.runAfter(0, internal.abuseActions.checkLinkSafety, {
      linkId,
      url: verdict.normalized,
    });

    // Sama alasannya untuk webhook: endpoint pelanggan yang lambat tidak boleh
    // memperlambat pembuatan tautan yang memicunya.
    await ctx.scheduler.runAfter(0, internal.webhookActions.dispatch, {
      userId: identity.subject,
      event: "link.created",
      payload: {
        id: linkId,
        short_code: shortCode,
        namespace: subdomain ?? null,
        original_url: verdict.normalized,
        title: args.title || "Untitled Link",
      },
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
    subdomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Kode pendek kosong akan membuat tautannya tidak pernah bisa dibuka lagi,
    // jadi diperlakukan sama dengan kode yang bentuknya salah.
    const newSlug = normalizeSlug(args.customSlug);

    // 1. Ambil data link lama
    const existingLink = await ctx.db.get(args.id);
    if (!existingLink || existingLink.userId !== identity.subject) {
      throw new Error("Link tidak ditemukan atau bukan milik Anda.");
    }

    // 2. Validasi Slug (Hanya jika slug berubah)
    // Jika slug-nya sama dengan yang lama, aman.
    // TAPI jika slug BEDA dari yang lama, kita harus cek ketersediaan.
    const newSubdomain = await resolveOwnedSubdomain(
      ctx,
      identity.subject,
      args.subdomain
    );

    // Pindah subdomain juga berarti pindah ruang nama, jadi tabrakan harus
    // diperiksa ulang walau kode pendeknya sendiri tidak berubah.
    if (newSlug !== existingLink.shortCode || newSubdomain !== existingLink.subdomain) {
      const clash = await shortCodeTaken(ctx, newSubdomain, newSlug);
      if (clash && clash._id !== existingLink._id) {
        throw new Error("Link custom ini sudah dipakai di alamat tersebut.");
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
      subdomain: newSubdomain,
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


/**
 * Menukar sandi yang benar dengan URL tujuan.
 *
 * Dibuat mutation, bukan query, karena sekaligus mencatat klik: memisahkannya
 * berarti tujuan bisa diambil tanpa pernah tercatat sebagai kunjungan.
 */
export const unlockAndIncrement = mutation({
  args: {
    shortCode: v.string(),
    subdomain: v.optional(v.string()),
    password: v.string(),
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
      .withIndex("by_subdomain_shortCode", (q) =>
        q
          .eq("subdomain", args.subdomain?.toLowerCase() || undefined)
          .eq("shortCode", args.shortCode)
      )
      .first();

    if (!link || !link.passwordHash) return { ok: false as const };

    // Sandi tautan pendek hampir selalu pendek dan dibagikan lewat pesan
    // singkat. Tanpa pembatas, seluruh ruang tebakannya bisa disapu dalam
    // hitungan menit dari satu skrip. Yang dihitung hanya tebakan yang salah,
    // jadi tautan yang dibuka banyak orang dengan sandi benar tidak ikut kena.
    const attemptKey = `unlock:${link._id}`;
    await assertAttemptQuota(ctx, attemptKey, 20);

    if (linkStatusOf(link) === "blocked") return { ok: false as const };

    const gate = accessGateOf(link);
    if (gate !== "open") return { ok: false as const };

    const attempt = await hashPassword(args.password, link.shortCode);
    if (attempt !== link.passwordHash) {
      await recordFailedAttempt(ctx, attemptKey);
      return { ok: false as const };
    }

    const now = Date.now();
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

    return { ok: true as const, originalUrl: link.originalUrl };
  },
});

/**
 * Apakah sebuah tautan masih boleh diteruskan.
 *
 * Dipakai jalur baca (getUrlByCode) maupun jalur tulis (getLinkAndIncrement)
 * supaya keduanya menjawab hal yang sama. Sebelum ini hanya query yang
 * memeriksanya, sementara mutation-nya mengembalikan URL tujuan apa adanya —
 * dan mutation itu bisa dipanggil siapa pun langsung dari console browser,
 * jadi kedaluwarsa maupun sandi praktis tidak menahan apa-apa.
 */
function accessGateOf(link: Doc<"links">): "open" | "expired-date" | "expired-clicks" {
  if (link.expiresAt !== undefined && link.expiresAt <= Date.now()) {
    return "expired-date";
  }
  if (link.maxClicks !== undefined && link.clicks >= link.maxClicks) {
    return "expired-clicks";
  }
  return "open";
}

/**
 * Sidik jari sandi tautan.
 *
 * Kode pendek dipakai sebagai garam supaya dua tautan bersandi sama tidak
 * menghasilkan sidik jari yang sama — tanpa itu, siapa pun yang melihat isi
 * basis data bisa tahu tautan mana saja yang memakai sandi yang sama.
 */
export async function hashPassword(
  password: string,
  salt: string
): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}


/**
 * Mengatur kedaluwarsa dan sandi sebuah tautan.
 *
 * Keduanya fitur berbayar dan diperiksa terpisah: seseorang boleh saja punya
 * paket yang mencakup salah satunya saja di kemudian hari, dan menggabungkan
 * pemeriksaannya akan menutup pintu yang seharusnya terbuka.
 */
export const setLinkProtection = mutation({
  args: {
    id: v.id("links"),
    /** null = hapus kedaluwarsa tanggal */
    expiresAt: v.optional(v.union(v.number(), v.null())),
    /** null = hapus batas klik */
    maxClicks: v.optional(v.union(v.number(), v.null())),
    /** "" = hapus sandi, undefined = biarkan apa adanya */
    password: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);

    const link = await ctx.db.get(args.id);
    if (!link || link.userId !== identity.subject) {
      throw new Error("Tautan tidak ditemukan atau bukan milik Anda.");
    }

    const patch: Record<string, unknown> = {};

    if (args.expiresAt !== undefined || args.maxClicks !== undefined) {
      // Menghapus batasan tidak butuh paket berbayar. Kalau langganan berakhir,
      // pengguna harus tetap bisa membereskan tautannya sendiri.
      const menambahBatas =
        (args.expiresAt !== undefined && args.expiresAt !== null) ||
        (args.maxClicks !== undefined && args.maxClicks !== null);

      if (menambahBatas) await assertFeature(ctx, "link_expiry");

      if (args.expiresAt !== undefined) {
        if (args.expiresAt !== null && args.expiresAt <= Date.now()) {
          throw new Error("Tanggal kedaluwarsa harus di masa depan.");
        }
        patch.expiresAt = args.expiresAt ?? undefined;
      }
      if (args.maxClicks !== undefined) {
        if (args.maxClicks !== null && args.maxClicks < 1) {
          throw new Error("Batas klik minimal 1.");
        }
        patch.maxClicks = args.maxClicks ?? undefined;
      }
    }

    if (args.password !== undefined) {
      if (args.password === "") {
        patch.passwordHash = undefined;
      } else {
        await assertFeature(ctx, "link_password");
        if (args.password.length < 4) {
          throw new Error("Sandi minimal 4 karakter.");
        }
        patch.passwordHash = await hashPassword(args.password, link.shortCode);
      }
    }

    await ctx.db.patch(args.id, patch);
  },
});

export const getMyLinks = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const links = await ctx.db
      .query("links")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const now = Date.now();

    return links.map(({ passwordHash, ...link }) => ({
      ...link,
      // Sidik jari sandi tidak pernah keluar dari server; UI hanya perlu tahu
      // ada atau tidaknya.
      hasPassword: !!passwordHash,
      isExpired:
        (link.expiresAt !== undefined && link.expiresAt <= now) ||
        (link.maxClicks !== undefined && link.clicks >= link.maxClicks),
    }));
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
  args: {
    shortCode: v.string(),
    // Kosong berarti permintaan datang dari domain utama.
    subdomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const subdomain = args.subdomain?.toLowerCase() || undefined;

    const link = await ctx.db
      .query("links")
      .withIndex("by_subdomain_shortCode", (q) =>
        q.eq("subdomain", subdomain).eq("shortCode", args.shortCode)
      )
      .first();

    if (!link) return null;

    const owner = await getEntitlementsForUser(ctx, link.userId);

    // Tautan yang hidup di alamat khusus ikut berhenti saat paket pemiliknya
    // berakhir — alamat itu sendiri yang berbayar. Tautannya tidak dihapus dan
    // tetap bisa dibuka lewat domain utama, jadi datanya tidak hilang.
    if (subdomain) {
      const isCustomDomain = subdomain.includes(".");
      const feature = isCustomDomain ? "custom_domain" : "subdomain";
      if (!planHasFeature(owner.plan, feature)) return null;
    }

    // Kedaluwarsa diperiksa saat dibaca, bukan lewat pekerjaan terjadwal:
    // tautan yang lewat tanggalnya harus mati pada detik itu juga, bukan
    // menunggu cron berikutnya menyapu.
    const gate = accessGateOf(link);
    const expiredByDate = gate === "expired-date";

    if (gate !== "open") {
      return {
        originalUrl: "",
        shortCode: link.shortCode,
        title: link.title,
        mode: "expired" as const,
        brand: null,
        safety: linkStatusOf(link),
        flagReason: null,
        needsPassword: false,
        expiredReason: expiredByDate ? ("date" as const) : ("clicks" as const),
      };
    }

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

    const needsPassword = !!link.passwordHash;

    return {
      // URL tujuan sengaja TIDAK dikirim untuk tautan bersandi. Query ini
      // terbuka untuk publik, jadi mengirimkannya lalu menyembunyikannya di
      // React sama saja dengan tidak memasang sandi sama sekali.
      originalUrl: needsPassword ? "" : link.originalUrl,
      shortCode: link.shortCode,
      title: link.title,
      // Gerbang sandi mengalahkan mode lompat-langsung: pemilik berbayar pun
      // tetap harus melewati sandinya sendiri.
      mode: needsPassword ? ("password" as const) : mode,
      brand,
      safety: linkStatusOf(link),
      flagReason: link.flagReason ?? null,
      needsPassword,
      expiredReason: null,
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
    subdomain: v.optional(v.string()),
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
      .withIndex("by_subdomain_shortCode", (q) =>
        q.eq("subdomain", args.subdomain?.toLowerCase() || undefined).eq("shortCode", args.shortCode)
      )
      .first();

    if (!link) return null;

    // Penjagaan yang sama persis dengan getUrlByCode. Halaman antara memang
    // sudah menahan diri sendiri, tapi yang menahan penyerang adalah kode di
    // sisi server ini — bukan komponen React yang bisa dilewati.
    if (linkStatusOf(link) === "blocked") return null;
    if (accessGateOf(link) !== "open") return null;

    // Tautan bersandi hanya boleh dibuka lewat unlockAndIncrement, yang menukar
    // sandi yang benar dengan tujuannya.
    if (link.passwordHash) return null;

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

    await ctx.scheduler.runAfter(0, internal.webhookActions.dispatch, {
      userId: link.userId,
      event: "link.clicked",
      payload: {
        id: link._id,
        short_code: link.shortCode,
        country: args.country ?? null,
        device: args.device ?? null,
        referrer: args.referrerHost ?? null,
        clicked_at: new Date(now).toISOString(),
      },
    });

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