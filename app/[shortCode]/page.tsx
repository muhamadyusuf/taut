import { headers } from "next/headers";
import { parseReferrer, parseUserAgent } from "@/lib/userAgent";
import RedirectClient, { type Visitor } from "./RedirectClient";

/**
 * Pembungkus server tipis untuk halaman antara.
 *
 * Alasan halaman ini ada: mutation Convex dipanggil langsung dari browser lewat
 * websocket, sehingga tidak pernah melihat header permintaan maupun alamat IP.
 * Negara, kota, perangkat, dan perujuk hanya terbaca di sini, lalu diteruskan
 * sebagai properti ke komponen klien.
 *
 * Di luar Vercel (termasuk saat pengembangan lokal) header geo tidak ada, dan
 * itu tidak apa-apa — atributnya opsional, klik tetap tercatat tanpa geo.
 */
export default async function Page() {
  const h = await headers();

  const ua = parseUserAgent(h.get("user-agent"));

  // Vercel mengirim nama kota dalam bentuk terenkode-URL ("Jakarta%20Pusat").
  const rawCity = h.get("x-vercel-ip-city");
  let city: string | undefined;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  const visitor: Visitor = {
    country: h.get("x-vercel-ip-country") ?? undefined,
    city,
    device: ua.device,
    os: ua.os,
    browser: ua.browser,
    referrerHost: parseReferrer(h.get("referer")),
  };

  return <RedirectClient visitor={visitor} />;
}
