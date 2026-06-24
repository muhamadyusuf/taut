import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Definisikan Rute yang WAJIB Login
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // Definisikan Environment
  // Gunakan optional chaining untuk keamanan jika hostname null
  const isAppDomain = hostname === "app.singkat.in"; 
  const isMainDomain = hostname === "singkat.in";   
  
  // (Opsional) Deteksi Localhost untuk development
  // const isLocalhost = hostname.includes("localhost"); 

  // --- ATURAN 1: PROTEKSI ROUTE (Dashboard Wajib Login) ---
  if (isProtectedRoute(req)) {
    const { userId, redirectToSignIn } = await auth();

    if (!userId) {
      // Redirect ke halaman login Clerk, lalu balik ke URL semula setelah login
      return redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // --- ATURAN 2: LOGIKA REDIRECT SUBDOMAIN ---

  // A. Jika akses "app.singkat.in" (Root) -> Lempar ke Dashboard Links
  if (isAppDomain && url.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/links", req.url));
  }

  // B. Jika akses "singkat.in/dashboard..." (Main Domain) -> Lempar ke App Domain
  // Ini mencegah user login dashboard di domain utama
  if (isMainDomain && isProtectedRoute(req)) {
    // Pindahkan path yang diakses user ke domain app
    const newUrl = new URL(url.pathname, "https://app.singkat.in");
    return NextResponse.redirect(newUrl);
  }

  // Sisanya lolos (Landing Page, Public Profile, Shortlink Redirection)
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Regex standar Clerk terbaru untuk men-skip file statis
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan middleware untuk API routes
    '/(api|trpc)(.*)',
  ],
};