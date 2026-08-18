import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

/** Domain utama tempat aplikasi ini dilayani. */
const ROOT_DOMAIN = "singkat.in";

/**
 * Nama host yang BUKAN subdomain penyewa walau bentuknya mirip.
 * Harus sinkron dengan RESERVED_SUBDOMAINS di convex/subdomains.ts.
 */
const SYSTEM_HOSTS = new Set(["app", "www", "api", "admin"]);

/**
 * Mengambil nama penyewa dari sebuah host.
 *
 * Mengembalikan null untuk domain utama, host sistem, dan localhost. Saat
 * pengembangan, subdomain tetap bisa diuji lewat bentuk "nama.localhost:3000"
 * yang dipetakan browser modern ke 127.0.0.1 tanpa perlu menyentuh /etc/hosts.
 */
function tenantFromHost(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();

  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null;

  let label: string | null = null;

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    label = host.slice(0, -(ROOT_DOMAIN.length + 1));
  } else if (host.endsWith(".localhost")) {
    label = host.slice(0, -".localhost".length);
  }

  if (!label) return null;
  // Hanya satu tingkat: "a.b.singkat.in" bukan penyewa yang sah.
  if (label.includes(".")) return null;
  if (SYSTEM_HOSTS.has(label)) return null;

  return label;
}

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  const tenant = tenantFromHost(hostname);

  const isAppDomain = hostname.split(":")[0] === `app.${ROOT_DOMAIN}`;
  const isMainDomain = hostname.split(":")[0] === ROOT_DOMAIN;

  // --- ATURAN 1: PROTEKSI ROUTE (Dashboard Wajib Login) ---
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // --- ATURAN 2: SUBDOMAIN PENYEWA ---
  // Ditempatkan sebelum aturan domain lain supaya tautan penyewa tidak pernah
  // tersedot ke logika domain utama.
  if (tenant) {
    // Dasbor tidak dilayani dari subdomain penyewa: sesi login hidup di
    // app.singkat.in, dan menyajikannya di sini hanya membuat dua tempat
    // masuk untuk hal yang sama.
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(
        new URL(url.pathname, `https://app.${ROOT_DOMAIN}`)
      );
    }

    const path = url.pathname === "/" ? "" : url.pathname;
    return NextResponse.rewrite(
      new URL(`/_sub/${tenant}${path}`, req.url)
    );
  }

  // --- ATURAN 3: app.singkat.in root -> dashboard ---
  if (isAppDomain && url.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/links", req.url));
  }

  // --- ATURAN 4: dashboard di domain utama -> pindahkan ke app ---
  if (isMainDomain && isProtectedRoute(req)) {
    const newUrl = new URL(url.pathname, `https://app.${ROOT_DOMAIN}`);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
