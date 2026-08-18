/**
 * Aturan penulisan slug halaman bio.
 *
 * File terpisah dan bebas dari import Convex, mengikuti pola convex/qrDefaults.ts,
 * supaya aturan yang sama bisa dibaca dua sisi: pratinjau di formulir dan
 * validasi di mutation. Kalau keduanya menghitung sendiri-sendiri, yang dilihat
 * pengguna saat mengetik cepat atau lambat akan berbeda dari yang tersimpan.
 */

export const MICROSITE_SLUG_MIN = 3;
export const MICROSITE_SLUG_MAX = 40;

/** Nama yang bentrok dengan route aplikasi atau menyesatkan bila diambil orang. */
const RESERVED = new Set([
  "admin", "api", "app", "dashboard", "bio", "blog", "pricing", "harga",
  "login", "logout", "signin", "signup", "register", "settings", "billing",
  "support", "help", "about", "contact", "terms", "privacy", "new", "edit",
]);

/**
 * Membersihkan masukan menjadi slug yang sah.
 *
 * Karakter yang tidak diizinkan DIBUANG, bukan ditolak — mengetik "Toko Saya"
 * lalu ditolak mentah-mentah memaksa orang menebak formatnya sendiri, sedangkan
 * melihatnya berubah menjadi "tokosaya" langsung mengajarkan aturannya.
 */
export function sanitizeMicrositeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MICROSITE_SLUG_MAX);
}

export type SlugVerdict = { ok: true } | { ok: false; reason: string };

export function inspectMicrositeSlug(slug: string): SlugVerdict {
  if (slug.length < MICROSITE_SLUG_MIN) {
    return { ok: false, reason: `Minimal ${MICROSITE_SLUG_MIN} karakter.` };
  }
  if (RESERVED.has(slug)) {
    return { ok: false, reason: "Nama ini dicadangkan sistem." };
  }
  return { ok: true };
}
