import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Definisikan Rute yang WAJIB Login (Hanya Dashboard)
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Definisikan Environment
  const isAppDomain = hostname === "app.singkat.in"; // Subdomain Production
  const isMainDomain = hostname === "singkat.in";    // Domain Utama Production
  // Localhost kita perlakukan seperti Main Domain (agar bisa lihat Landing Page)
  const isLocalhost = hostname.includes("localhost"); 

  // --- ATURAN 1: PROTEKSI ROUTE ---
  // Jika user mengakses halaman /dashboard..., paksa Login dulu.
  if (isProtectedRoute(req)) {
    // AMBIL DATA AUTH MANUAL
    // Kita tidak pakai .protect(), tapi kita cek sendiri userId-nya
    const { userId, redirectToSignIn } = await auth();

    // 3. JIKA BELUM LOGIN (userId kosong), LEMPAR KE HALAMAN LOGIN
    if (!userId) {
      return redirectToSignIn();
    }
  }

  // --- ATURAN 2: LOGIKA REDIRECT SUBDOMAIN ---

  // A. Jika di "app.singkat.in" (Khusus Dashboard)
  if (isAppDomain) {
    // Jika buka root ("/") kosong, langsung masuk ke dashboard links
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard/links", req.url));
    }
  }

  // B. Jika di "singkat.in" (Marketing)
  // Kita cegah user buka dashboard lewat sini (hanya berlaku di Production)
  if (isMainDomain && isProtectedRoute(req)) {
    const newUrl = new URL(url.pathname, "https://app.singkat.in");
    return NextResponse.redirect(newUrl);
  }

  // Sisanya (Landing Page, Shortlink /promo, dll) lolos tanpa login
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};