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
      "bulk_import",
      "skip_interstitial",
      "branded_qr",
      "vector_qr",
      "detailed_analytics",
      "export_report",
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
      teamSeats: 5,
    },
    features: [
      "link_expiry",
      "link_password",
      "bulk_import",
      "geo_targeting",
      "ab_rotator",
      "retargeting_pixel",
      "skip_interstitial",
      // Bisnis tidak sekadar bebas iklan: halaman antara dipakai jadi kanal
      // branding sendiri (logo, warna, pesan). Lihat docs/premium-strategy.md §8.
      "whitelabel_interstitial",
      "branded_qr",
      "vector_qr",
      "bulk_qr",
      "detailed_analytics",
      "export_report",
      "scheduled_report",
      "public_dashboard",
      "subdomain",
      "custom_domain",
      "remove_branding",
      "certificate_generator",
      "certificate_verification",
      "form_file_upload",
      "form_logic",
      "api_access",
      "webhooks",
      "team",
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
// LABEL BAHASA INDONESIA (untuk pesan error & UI)
// ---------------------------------------------------------------------------

export const FEATURE_LABELS: Record<FeatureKey, string> = {
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
};

export const LIMIT_LABELS: Record<LimitKey, string> = {
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
};

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
export function planHighlights(planId: PlanId): string[] {
  const limits = PLANS[planId].limits;
  const out: string[] = ["Tautan pendek tanpa batas"];

  const countLine = (limit: number, satuan: string) =>
    isUnlimited(limit) ? `${satuan} tanpa batas` : `${limit} ${satuan}`;

  out.push(countLine(limits.microsites, "halaman bio"));
  out.push(countLine(limits.forms, "formulir"));
  out.push(
    isUnlimited(limits.formResponsesPerForm)
      ? "Respons formulir tanpa batas"
      : `${limits.formResponsesPerForm.toLocaleString("id-ID")} respons per formulir`
  );
  out.push(
    isUnlimited(limits.certificatesPerMonth)
      ? "Sertifikat tanpa batas"
      : `${limits.certificatesPerMonth} sertifikat per bulan`
  );
  out.push(
    isUnlimited(limits.analyticsRetentionDays)
      ? "Riwayat statistik tanpa batas"
      : `Riwayat statistik ${limits.analyticsRetentionDays} hari`
  );

  if (limits.subdomains > 0) {
    out.push(`${limits.subdomains} subdomain nama.singkat.in`);
  }
  if (limits.customDomains > 0) {
    out.push(`${limits.customDomains} domain sendiri`);
  }
  if (limits.teamSeats > 1) {
    out.push(`${limits.teamSeats} anggota tim`);
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
    "geo_targeting",
    "ab_rotator",
    "api_access",
  ];

  for (const feature of HIGHLIGHTED) {
    if (planHasFeature(planId, feature)) out.push(FEATURE_LABELS[feature]);
  }

  return out;
}


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

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
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
