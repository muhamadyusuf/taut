import { headers } from "next/headers";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { parseReferrer, parseUserAgent } from "@/lib/userAgent";
import RedirectClient, { type Visitor } from "@/app/[shortCode]/RedirectClient";
import NotFoundPage from "@/app/not-found";

/**
 * Halaman antara untuk tautan di domain milik pengguna sendiri.
 *
 * Di sinilah pencarian pemilik host dilakukan — bukan di middleware, yang
 * harus tetap bebas dari panggilan jaringan. Host yang tidak dikenal atau
 * belum aktif menghasilkan halaman tidak ditemukan, bukan kebocoran ke
 * domain utama.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ host: string; shortCode: string }>;
}) {
  const { host } = await params;

  const owner = await fetchQuery(api.domains.getActiveByHost, { host }).catch(
    () => null
  );

  if (!owner) return <NotFoundPage />;

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

  // Ruang nama tautan untuk domain sendiri adalah nama host lengkapnya.
  return <RedirectClient visitor={visitor} subdomain={owner.domain} />;
}
