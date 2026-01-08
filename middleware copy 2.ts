import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

// DEFINISI RUTE RAHASIA (PROTECTED)
// Kita hanya perlu memblokir akses ke Dashboard.
// Semua rute lain (termasuk link pendek seperti /abc-123) otomatis jadi publik.
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // Semua yang diawali /dashboard wajib login
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. Cek apakah user sedang membuka halaman rahasia (bukan public)
  if (isProtectedRoute(req)) {
    
    // AMBIL DATA AUTH MANUAL
    // Kita tidak pakai .protect(), tapi kita cek sendiri userId-nya
    const { userId, redirectToSignIn } = await auth();

    // 3. JIKA BELUM LOGIN (userId kosong), LEMPAR KE HALAMAN LOGIN
    if (!userId) {
      return redirectToSignIn();
    }
  }
});

export const config = {
  matcher: [
    // Regex standar Next.js untuk skip file statis (gambar, css, font, dll)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan middleware untuk API routes
    '/(api|trpc)(.*)',
  ],
};

function isPublicRoute(req: NextRequest): boolean {
  return !isProtectedRoute(req);
}