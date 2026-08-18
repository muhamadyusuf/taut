/**
 * Pengenalan perangkat dari header User-Agent.
 *
 * Sengaja sederhana: hanya memisahkan yang benar-benar dipakai di laporan —
 * jenis perangkat, sistem operasi, dan peramban. Ini bukan basis data UA
 * lengkap, dan memang tidak perlu; UA modern semakin dikaburkan oleh peramban
 * sendiri, jadi ketelitian berlebihan di sini akan usang lebih cepat daripada
 * bermanfaat. Apa pun yang tidak dikenali dilaporkan apa adanya sebagai
 * "Lainnya", bukan ditebak.
 */

export type ClientHints = {
  device: string; // "Ponsel" | "Tablet" | "Desktop"
  os: string;
  browser: string;
};

export function parseUserAgent(ua: string | null | undefined): ClientHints {
  const s = (ua ?? "").toLowerCase();

  if (!s) {
    return { device: "Lainnya", os: "Lainnya", browser: "Lainnya" };
  }

  // Tablet harus diperiksa sebelum ponsel: UA iPad dan sebagian Android tablet
  // sama-sama memuat penanda seluler, jadi urutan terbalik akan salah label.
  const isTablet = /ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(s);
  const isMobile = /iphone|ipod|android|blackberry|windows phone|opera mini/.test(s);
  const device = isTablet ? "Tablet" : isMobile ? "Ponsel" : "Desktop";

  let os = "Lainnya";
  if (/windows nt/.test(s)) os = "Windows";
  else if (/android/.test(s)) os = "Android";
  else if (/iphone|ipad|ipod|ios/.test(s)) os = "iOS";
  else if (/mac os x|macintosh/.test(s)) os = "macOS";
  else if (/linux/.test(s)) os = "Linux";

  // Urutan penting: hampir semua peramban menyamar sebagai Chrome dan Safari
  // di dalam UA-nya, jadi yang lebih spesifik harus diuji lebih dulu.
  let browser = "Lainnya";
  if (/edg\//.test(s)) browser = "Edge";
  else if (/opr\/|opera/.test(s)) browser = "Opera";
  else if (/samsungbrowser/.test(s)) browser = "Samsung Internet";
  else if (/firefox|fxios/.test(s)) browser = "Firefox";
  else if (/chrome|crios/.test(s)) browser = "Chrome";
  else if (/safari/.test(s)) browser = "Safari";

  return { device, os, browser };
}

/**
 * Nama domain perujuk, atau "Langsung" kalau tidak ada.
 * Hanya hostname yang disimpan — path perujuk kerap memuat parameter pribadi.
 */
export function parseReferrer(referer: string | null | undefined): string {
  if (!referer) return "Langsung";
  try {
    return new URL(referer).hostname.replace(/^www\./, "") || "Langsung";
  } catch {
    return "Langsung";
  }
}
