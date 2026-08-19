/**
 * KATALOG PAKET LANGGANAN
 *
 * File ini sengaja bebas dari import Convex maupun React. Isinya data murni +
 * fungsi murni, supaya satu sumber kebenaran yang sama dipakai dua sisi:
 *   - backend  : validasi kuota & fitur di dalam mutation (convex/entitlements.ts)
 *   - frontend : halaman harga, badge paket, dan pesan ajakan upgrade
 *
 * Aturan main: JANGAN menaruh logika izin di komponen React saja. UI hanya
 * menyembunyikan tombol; yang benar-benar menahan adalah entitlements.ts.
 */

// ---------------------------------------------------------------------------
// TIPE DASAR
// ---------------------------------------------------------------------------

export const PLAN_IDS = ["free", "pro", "business"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/**
 * Penanda "tanpa batas".
 *
 * Sengaja memakai -1, bukan Infinity: nilai ini ikut terkirim lewat query ke
 * browser dan tersimpan di log, dan -1 aman di semua jalur serialisasi.
 * Selalu baca lewat helper isUnlimited() / isWithinLimit(), jangan dibandingkan
 * langsung dengan `<` karena -1 akan selalu terlihat "lebih kecil".
 */
export const UNLIMITED = -1;

export type LimitKey =
  | "links"
  | "microsites"
  | "forms"
  | "formResponsesPerForm"
  | "products"
  | "certificatesPerMonth"
  | "subdomains"
  | "customDomains"
  | "analyticsRetentionDays"
  | "teamSeats";

export type Limits = Record<LimitKey, number>;

export type FeatureKey =
  // Tautan
  | "link_expiry"
  | "link_password"
  | "bulk_import"
  | "geo_targeting"
  | "ab_rotator"
  | "retargeting_pixel"
  // Halaman antara (interstitial)
  | "skip_interstitial"
  | "whitelabel_interstitial"
  // QR
  | "branded_qr"
  | "vector_qr"
  | "bulk_qr"
  // Analitik
  | "detailed_analytics"
  | "export_report"
  | "scheduled_report"
  | "public_dashboard"
  // Identitas
  | "subdomain"
  | "custom_domain"
  | "remove_branding"
  // Formulir & sertifikat
  | "certificate_generator"
  | "certificate_verification"
  | "form_file_upload"
  | "form_logic"
  // Platform
  | "api_access"
  | "webhooks"
  | "team";

export type PlanDefinition = {
  id: PlanId;
  name: string;
  tagline: string;
  /** Harga dalam Rupiah. 0 = gratis. */
  priceMonthly: number;
  priceYearly: number;
  limits: Limits;
  features: FeatureKey[];
};

// ---------------------------------------------------------------------------
// DEFINISI PAKET
// ---------------------------------------------------------------------------

/**
 * Catatan strategi: jumlah tautan pendek sengaja UNLIMITED di semua paket.
 * Landing page menjanjikan "gratis selamanya, tanpa batas jumlah tautan" dan
 * janji itu kita pegang. Yang dijual adalah kontrol, identitas merek, kedalaman
 * data, dan otomatisasi — bukan hak untuk memendekkan tautan.
 */
/**
 * Fitur yang SUDAH direncanakan tapi BELUM ada implementasinya sengaja tidak
 * dicantumkan di sini: impor massal, targeting lokasi, rotator A/B, pixel
 * retargeting, QR massal, ekspor & laporan terjadwal, dasbor publik, unggah
 * berkas & logika percabangan formulir, serta anggota tim.
 *
 * Alasannya sederhana: planHasFeature() adalah satu-satunya sumber yang dibaca
 * halaman harga maupun penjaga di backend. Mencantumkan fitur yang belum ada di
 * sini sama dengan menagih pelanggan untuk sesuatu yang tidak bisa mereka pakai.
 * Tambahkan kembali pada baris paket yang bersangkutan begitu fiturnya jadi.
 */
export const PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Gratis",
    tagline: "Semua yang dibutuhkan untuk mulai memendekkan tautan.",
    priceMonthly: 0,
    priceYearly: 0,
    limits: {
      links: UNLIMITED,
      microsites: 1,
      forms: 3,
      formResponsesPerForm: 100,
      products: 3,
      certificatesPerMonth: 25,
      subdomains: 0,
      customDomains: 0,
      analyticsRetentionDays: 7,
      teamSeats: 1,
    },
    features: [
      // Generator sertifikat tetap bisa dicoba, tapi dibatasi kuota bulanan.
      "certificate_generator",
    ],
  },

  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Untuk kreator dan pemilik usaha yang serius menggarap tautannya.",
    priceMonthly: 29_000,
    priceYearly: 249_000,
    limits: {
      links: UNLIMITED,
      microsites: 5,
      forms: 20,
      formResponsesPerForm: 2_000,
      products: 50,
      certificatesPerMonth: 500,
      subdomains: 1,
      customDomains: 0,
      analyticsRetentionDays: 365,
      teamSeats: 1,
    },
    features: [
      "link_expiry",
      "link_password",
      "skip_interstitial",
      "branded_qr",
      "vector_qr",
      "detailed_analytics",
      "subdomain",
      "remove_branding",
      "certificate_generator",
      "certificate_verification",
    ],
  },

  business: {
    id: "business",
    name: "Bisnis",
    tagline: "Untuk tim, agensi, dan institusi yang butuh domain & API sendiri.",
    priceMonthly: 99_000,
    priceYearly: 990_000,
    limits: {
      links: UNLIMITED,
      microsites: UNLIMITED,
      forms: UNLIMITED,
      formResponsesPerForm: UNLIMITED,
      products: UNLIMITED,
      certificatesPerMonth: UNLIMITED,
      subdomains: 3,
      customDomains: 3,
      analyticsRetentionDays: UNLIMITED,
      // Tetap 1 sampai workspace tim benar-benar ada; kartu harga membaca
      // angka ini, jadi menaikkannya lebih dulu berarti menjanjikan yang belum ada.
      teamSeats: 1,
    },
    features: [
      "link_expiry",
      "link_password",
      "skip_interstitial",
      // Bisnis tidak sekadar bebas iklan: halaman antara dipakai jadi kanal
      // branding sendiri (logo, warna, pesan). Lihat docs/premium-strategy.md §8.
      "whitelabel_interstitial",
      "branded_qr",
      "vector_qr",
      "detailed_analytics",
      "subdomain",
      "custom_domain",
      "remove_branding",
      "certificate_generator",
      "certificate_verification",
      "api_access",
      "webhooks",
    ],
  },
};

// ---------------------------------------------------------------------------
// GRANDFATHERING (USER LAMA)
// ---------------------------------------------------------------------------

/**
 * Batas waktu peluncuran paket berbayar.
 *
 * Semua akun yang tercatat sebelum tanggal ini ditandai `legacyFree` dan tetap
 * mendapat kuota tanpa batas untuk fitur inti — sesuai janji "gratis selamanya"
 * di landing page. Mereka tetap tidak mendapat fitur premium baru.
 *
 * Ubah tanggal ini saat halaman harga benar-benar dirilis.
 */
export const PAID_LAUNCH_AT = Date.parse("2026-10-01T00:00:00+07:00");

/** Kuota yang tetap tanpa batas untuk akun lama. */
const LEGACY_FREE_LIMITS: Partial<Limits> = {
  microsites: UNLIMITED,
  forms: UNLIMITED,
  formResponsesPerForm: UNLIMITED,
  products: UNLIMITED,
};

// ---------------------------------------------------------------------------
// HELPER MURNI
// ---------------------------------------------------------------------------

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

export function isUnlimited(limit: number): boolean {
  return limit === UNLIMITED;
}

/**
 * Paket yang benar-benar berlaku saat ini.
 *
 * Langganan yang lewat tanggal otomatis turun ke "free" tanpa perlu cron —
 * cron pengingat tetap ada nanti, tapi kebenaran tetap dihitung di sini supaya
 * tidak ada celah kalau cron-nya telat jalan.
 */
export function resolvePlan(
  user: { plan?: string; planExpiresAt?: number } | null | undefined,
  now: number = Date.now()
): PlanId {
  if (!user?.plan || !isPlanId(user.plan)) return "free";
  if (user.plan === "free") return "free";
  if (user.planExpiresAt !== undefined && user.planExpiresAt < now) return "free";
  return user.plan;
}

export function getLimits(planId: PlanId, legacyFree = false): Limits {
  const base = PLANS[planId].limits;
  if (planId === "free" && legacyFree) {
    return { ...base, ...LEGACY_FREE_LIMITS };
  }
  return base;
}

export function getLimit(planId: PlanId, key: LimitKey, legacyFree = false): number {
  return getLimits(planId, legacyFree)[key];
}

export function planHasFeature(planId: PlanId, feature: FeatureKey): boolean {
  return PLANS[planId].features.includes(feature);
}

/**
 * True kalau menambah satu entitas lagi masih muat dalam kuota.
 * `currentCount` adalah jumlah yang SUDAH ada sebelum penambahan.
 */
export function isWithinLimit(
  planId: PlanId,
  key: LimitKey,
  currentCount: number,
  legacyFree = false
): boolean {
  const limit = getLimit(planId, key, legacyFree);
  if (isUnlimited(limit)) return true;
  return currentCount < limit;
}

// ---------------------------------------------------------------------------
// LABEL DUA BAHASA (untuk pesan error & UI)
// ---------------------------------------------------------------------------

/**
 * Bahasa yang dikenal katalog paket.
 *
 * Sengaja tidak mengimpor tipe Locale dari lib/i18n: file ini juga dibaca
 * runtime Convex, dan menariknya ke sini berarti menyeret modul sisi klien ke
 * dalam bundel backend. Dua-duanya tetap "id" | "en", dan tsc akan mengeluh
 * kalau salah satunya berubah tanpa yang lain.
 */
export type PlanLocale = "id" | "en";

/** Nama & tagline paket per bahasa. Backend selalu memakai "id" (default). */
export const PLAN_COPY: Record<PlanLocale, Record<PlanId, { name: string; tagline: string }>> = {
  id: {
    free: {
      name: "Gratis",
      tagline: "Semua yang dibutuhkan untuk mulai memendekkan tautan.",
    },
    pro: {
      name: "Pro",
      tagline: "Untuk kreator dan pemilik usaha yang serius menggarap tautannya.",
    },
    business: {
      name: "Bisnis",
      tagline: "Untuk tim, agensi, dan institusi yang butuh domain & API sendiri.",
    },
  },
  en: {
    free: {
      name: "Free",
      tagline: "Everything you need to start shortening links.",
    },
    pro: {
      name: "Pro",
      tagline: "For creators and business owners who take their links seriously.",
    },
    business: {
      name: "Business",
      tagline: "For teams, agencies, and institutions that need their own domain & API.",
    },
  },
};

/** Nama paket sesuai bahasa tampilan. Pakai ini di UI, bukan PLANS[id].name. */
export function planName(planId: PlanId, locale: PlanLocale = "id"): string {
  return PLAN_COPY[locale][planId].name;
}

/** Tagline paket sesuai bahasa tampilan. */
export function planTagline(planId: PlanId, locale: PlanLocale = "id"): string {
  return PLAN_COPY[locale][planId].tagline;
}

const FEATURE_LABELS_BY_LOCALE: Record<PlanLocale, Record<FeatureKey, string>> = {
  id: {
    link_expiry: "Kedaluwarsa tautan",
    link_password: "Tautan berkata sandi",
    bulk_import: "Impor massal",
    geo_targeting: "Targeting lokasi & perangkat",
    ab_rotator: "Rotator A/B",
    retargeting_pixel: "Pixel retargeting",
    skip_interstitial: "Tanpa halaman iklan",
    whitelabel_interstitial: "Halaman antara bermerek sendiri",
    branded_qr: "QR berlogo & berwarna",
    vector_qr: "Unduh QR vektor (SVG/PDF)",
    bulk_qr: "QR massal",
    detailed_analytics: "Analitik lengkap",
    export_report: "Ekspor laporan",
    scheduled_report: "Laporan terjadwal",
    public_dashboard: "Dasbor publik",
    subdomain: "Subdomain sendiri",
    custom_domain: "Domain sendiri",
    remove_branding: "Hapus branding singkat.in",
    certificate_generator: "Generator sertifikat",
    certificate_verification: "Verifikasi sertifikat publik",
    form_file_upload: "Unggah berkas di formulir",
    form_logic: "Logika percabangan formulir",
    api_access: "Akses API",
    webhooks: "Webhook",
    team: "Anggota tim",
  },
  en: {
    link_expiry: "Link expiry",
    link_password: "Password-protected links",
    bulk_import: "Bulk import",
    geo_targeting: "Location & device targeting",
    ab_rotator: "A/B rotator",
    retargeting_pixel: "Retargeting pixel",
    skip_interstitial: "No interstitial ads",
    whitelabel_interstitial: "White-label interstitial page",
    branded_qr: "Branded & colored QR",
    vector_qr: "Vector QR download (SVG/PDF)",
    bulk_qr: "Bulk QR",
    detailed_analytics: "Full analytics",
    export_report: "Report export",
    scheduled_report: "Scheduled reports",
    public_dashboard: "Public dashboard",
    subdomain: "Your own subdomain",
    custom_domain: "Your own domain",
    remove_branding: "Remove singkat.in branding",
    certificate_generator: "Certificate generator",
    certificate_verification: "Public certificate verification",
    form_file_upload: "File upload in forms",
    form_logic: "Form branching logic",
    api_access: "API access",
    webhooks: "Webhooks",
    team: "Team members",
  },
};

const LIMIT_LABELS_BY_LOCALE: Record<PlanLocale, Record<LimitKey, string>> = {
  id: {
    links: "tautan",
    microsites: "halaman bio",
    forms: "formulir",
    formResponsesPerForm: "respons per formulir",
    products: "produk",
    certificatesPerMonth: "sertifikat bulan ini",
    subdomains: "subdomain",
    customDomains: "domain sendiri",
    analyticsRetentionDays: "hari retensi analitik",
    teamSeats: "anggota tim",
  },
  en: {
    links: "links",
    microsites: "bio pages",
    forms: "forms",
    formResponsesPerForm: "responses per form",
    products: "products",
    certificatesPerMonth: "certificates this month",
    subdomains: "subdomains",
    customDomains: "custom domains",
    analyticsRetentionDays: "days of analytics retention",
    teamSeats: "team members",
  },
};

/** Label fitur Bahasa Indonesia — dipakai pesan error backend. */
export const FEATURE_LABELS: Record<FeatureKey, string> = FEATURE_LABELS_BY_LOCALE.id;

/** Label kuota Bahasa Indonesia — dipakai pesan error backend. */
export const LIMIT_LABELS: Record<LimitKey, string> = LIMIT_LABELS_BY_LOCALE.id;

export function featureLabel(feature: FeatureKey, locale: PlanLocale = "id"): string {
  return FEATURE_LABELS_BY_LOCALE[locale][feature];
}

export function limitLabel(key: LimitKey, locale: PlanLocale = "id"): string {
  return LIMIT_LABELS_BY_LOCALE[locale][key];
}

/** Paket termurah yang punya fitur tertentu — dipakai untuk ajakan upgrade. */
export function cheapestPlanWith(feature: FeatureKey): PlanId | null {
  for (const id of PLAN_IDS) {
    if (planHasFeature(id, feature)) return id;
  }
  return null;
}

/**
 * Poin-poin yang ditampilkan di kartu harga.
 *
 * Diturunkan dari limits + features supaya kartu harga tidak pernah berbeda
 * dari yang benar-benar ditegakkan backend. Menambah fitur ke sebuah paket
 * cukup dilakukan di satu tempat, dan halaman harga ikut berubah sendiri.
 */
export function planHighlights(planId: PlanId, locale: PlanLocale = "id"): string[] {
  const limits = PLANS[planId].limits;
  const t = HIGHLIGHT_COPY[locale];
  const num = (value: number) => value.toLocaleString(locale === "en" ? "en-US" : "id-ID");
  const out: string[] = [t.unlimitedLinks];

  out.push(t.count(limits.microsites, t.units.microsites));
  out.push(t.count(limits.forms, t.units.forms));
  out.push(
    isUnlimited(limits.formResponsesPerForm)
      ? t.unlimitedResponses
      : t.responses(num(limits.formResponsesPerForm))
  );
  out.push(
    isUnlimited(limits.certificatesPerMonth)
      ? t.unlimitedCertificates
      : t.certificates(num(limits.certificatesPerMonth))
  );
  out.push(
    isUnlimited(limits.analyticsRetentionDays)
      ? t.unlimitedRetention
      : t.retention(limits.analyticsRetentionDays)
  );

  if (limits.subdomains > 0) {
    out.push(t.subdomains(limits.subdomains));
  }
  if (limits.customDomains > 0) {
    out.push(t.customDomains(limits.customDomains));
  }
  if (limits.teamSeats > 1) {
    out.push(t.teamSeats(limits.teamSeats));
  }

  // Fitur yang paling menentukan keputusan beli, diurutkan sengaja.
  const HIGHLIGHTED: FeatureKey[] = [
    "skip_interstitial",
    "whitelabel_interstitial",
    "detailed_analytics",
    "branded_qr",
    "link_password",
    "link_expiry",
    "remove_branding",
    "certificate_verification",
    "api_access",
  ];

  for (const feature of HIGHLIGHTED) {
    if (planHasFeature(planId, feature)) out.push(featureLabel(feature, locale));
  }

  return out;
}

/** Kalimat poin kartu harga per bahasa — dipisah supaya rumusnya tetap satu. */
const HIGHLIGHT_COPY: Record<
  PlanLocale,
  {
    unlimitedLinks: string;
    units: { microsites: string; forms: string };
    count: (limit: number, unit: string) => string;
    unlimitedResponses: string;
    responses: (n: string) => string;
    unlimitedCertificates: string;
    certificates: (n: string) => string;
    unlimitedRetention: string;
    retention: (days: number) => string;
    subdomains: (n: number) => string;
    customDomains: (n: number) => string;
    teamSeats: (n: number) => string;
  }
> = {
  id: {
    unlimitedLinks: "Tautan pendek tanpa batas",
    units: { microsites: "halaman bio", forms: "formulir" },
    count: (limit, unit) => (isUnlimited(limit) ? `${unit} tanpa batas` : `${limit} ${unit}`),
    unlimitedResponses: "Respons formulir tanpa batas",
    responses: (n) => `${n} respons per formulir`,
    unlimitedCertificates: "Sertifikat tanpa batas",
    certificates: (n) => `${n} sertifikat per bulan`,
    unlimitedRetention: "Riwayat statistik tanpa batas",
    retention: (days) => `Riwayat statistik ${days} hari`,
    subdomains: (n) => `${n} subdomain nama.singkat.in`,
    customDomains: (n) => `${n} domain sendiri`,
    teamSeats: (n) => `${n} anggota tim`,
  },
  en: {
    unlimitedLinks: "Unlimited short links",
    units: { microsites: "bio pages", forms: "forms" },
    count: (limit, unit) => (isUnlimited(limit) ? `Unlimited ${unit}` : `${limit} ${unit}`),
    unlimitedResponses: "Unlimited form responses",
    responses: (n) => `${n} responses per form`,
    unlimitedCertificates: "Unlimited certificates",
    certificates: (n) => `${n} certificates per month`,
    unlimitedRetention: "Unlimited analytics history",
    retention: (days) => `${days}-day analytics history`,
    subdomains: (n) => `${n} name.singkat.in subdomain`,
    customDomains: (n) => `${n} custom domain`,
    teamSeats: (n) => `${n} team members`,
  },
};


// ---------------------------------------------------------------------------
// PAKET ACARA (sekali bayar, di luar langganan)
// ---------------------------------------------------------------------------

/**
 * Kuota sertifikat sekali bayar.
 *
 * Ada karena segmen terbesar pengguna sertifikat di Indonesia — panitia acara
 * dan kepanitiaan kampus — bekerja per kegiatan, bukan per bulan. Mereka
 * menolak langganan tapi mudah menyetujui anggaran sekali jalan.
 *
 * Kuotanya ditambahkan DI ATAS jatah paket, dan tidak menaikkan paket apa pun.
 */
export const EVENT_PASS = {
  id: "event_1000",
  name: "Paket Acara",
  quota: 1000,
  validDays: 30,
  price: 149_000,
} as const;

/** Nama paket acara sesuai bahasa tampilan. */
export function eventPassName(locale: PlanLocale = "id"): string {
  return locale === "en" ? "Event Pass" : EVENT_PASS.name;
}

export function formatIDR(amount: number, locale: PlanLocale = "id"): string {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Persentase hemat kalau bayar tahunan, dibulatkan ke bawah. */
export function yearlySavingPercent(planId: PlanId): number {
  const { priceMonthly, priceYearly } = PLANS[planId];
  if (priceMonthly === 0) return 0;
  return Math.floor((1 - priceYearly / (priceMonthly * 12)) * 100);
}
