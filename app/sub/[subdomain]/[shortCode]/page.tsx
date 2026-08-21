import { headers } from "next/headers";
import { parseReferrer, parseUserAgent } from "@/lib/userAgent";
import RedirectClient, { type Visitor } from "@/app/[shortCode]/RedirectClient";

/**
 * Halaman antara untuk tautan yang hidup di subdomain penyewa.
 *
 * Route ini tidak pernah dibuka langsung; middleware menulis ulang
 * "nama.singkat.in/kode" menjadi "/_sub/nama/kode". Komponen kliennya dipakai
 * bersama dengan halaman domain utama supaya perilaku dan tampilannya tidak
 * pernah menyimpang di antara keduanya.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ subdomain: string; shortCode: string }>;
}) {
  const { subdomain } = await params;
  const h = await headers();

  const ua = parseUserAgent(h.get("user-agent"));

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

  return <RedirectClient visitor={visitor} subdomain={subdomain} />;
}
