import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Daftar halaman yang BOLEH diakses tanpa login
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/', // Landing page
  '/[\\w-]+', // Halaman redirect link pendek
]);

// Allow the catch-all route for UserProfile component
const isSettingsRoute = createRouteMatcher(['/dashboard/settings(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // 2. Cek apakah user sedang membuka halaman rahasia (bukan public)
  if (!isPublicRoute(req)) {
    
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
    // Regex standar Next.js agar middleware tidak memblokir file statis (gambar, css, dll)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Selalu jalankan untuk API routes
    '/(api|trpc)(.*)',
  ],
};