import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
]);

/**
 * CATATAN PENTING SOAL NAMA FOLDER TUJUAN REWRITE
 *
 * Sasaran rewrite di berkas ini — /sub, /domain, /trap — TIDAK BOLEH diberi
 * awalan garis bawah. Folder berawalan "_" adalah private folder di App Router
 * dan sengaja dikeluarkan dari tabel route, sehingga rewrite ke sana selalu
 * berakhir 404. Sebelumnya folder-folder ini bernama app/_sub dan app/_domain,
 * dan akibatnya seluruh subdomain penyewa maupun domain pelanggan — dua fitur
 * berbayar — menjawab 404 tanpa ada yang salah di kode halamannya sendiri.
 *
 * Karena kini menjadi route sungguhan, ketiga nama itu ikut didaftarkan sebagai
 * slug cadangan di convex/links.ts supaya tidak ada tautan pendek yang
 * bertabrakan dengannya.
 */

/** Domain utama tempat aplikasi ini dilayani. */
const ROOT_DOMAIN = "singkat.in";

/**
 * Nama host yang BUKAN subdomain penyewa walau bentuknya mirip.
 * Harus sinkron dengan RESERVED_SUBDOMAINS di convex/subdomains.ts.
 */
const SYSTEM_HOSTS = new Set(["app", "www", "api", "admin"]);

/**
 * ALAMAT UMPAN.
 *
 * Tidak satu pun dari ini pernah dilayani aplikasi. Yang mengetuknya bukan
 * pengunjung yang tersesat: ini daftar belanja pemindai otomatis dan orang yang
 * sedang mencari-cari celah — berkas rahasia, panel admin CMS lain, dan
 * endpoint "naikkan paket" yang sengaja disebut-sebut di bundel aplikasi.
 *
 * Awalan, bukan kecocokan persis: /.git/config dan /.git/HEAD sama-sama patut
 * dicatat, dan mengejar setiap variasinya satu per satu tidak ada habisnya.
 */
const TRAP_PREFIXES = [
  // Berkas rahasia yang bocor karena salah konfigurasi
  "/.env",
  "/.git",
  "/.aws",
  "/config.json",
  "/credentials",

  // Panel & jalur milik tumpukan teknologi lain — aplikasi ini bukan WordPress
  "/wp-admin",
  "/wp-login.php",
  "/wp-content",
  "/xmlrpc.php",
  "/phpmyadmin",
  "/administrator",
  "/admin.php",
  "/cgi-bin",

  // Endpoint diagnostik yang sering terbuka tanpa sengaja
  "/actuator",
  "/server-status",
  "/debug",

  // Umpan buatan sendiri: nama-nama ini ditanam di bundel aplikasi lewat
  // app/_components/security/HoneypotBait.tsx, jadi yang menemukannya memang
  // sedang membaca kode kami untuk mencari pintu belakang.
  "/api/admin/grant-plan",
  "/api/internal/users",
  "/api/v1/admin",
];

function trapPrefixFor(pathname: string): string | null {
  const path = pathname.toLowerCase();
  return TRAP_PREFIXES.find((prefix) => path.startsWith(prefix)) ?? null;
}

/**
 * Mengambil nama penyewa dari sebuah host.
 *
 * Mengembalikan null untuk domain utama, host sistem, dan localhost. Saat
 * pengembangan, subdomain tetap bisa diuji lewat bentuk "nama.localhost:3000"
 * yang dipetakan browser modern ke 127.0.0.1 tanpa perlu menyentuh /etc/hosts.
 */
function isLocalHost(hostname: string): boolean {
  const host = hostname.split(":")[0].toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost");
}

/**
 * Host yang merupakan milik platform, apa pun bentuknya.
 *
 * Dibutuhkan karena "bukan penyewa" tidak sama dengan "milik pelanggan":
 * www.singkat.in bukan penyewa, tapi juga jelas bukan domain pelanggan. Tanpa
 * pemeriksaan ini www sempat tersedot ke jalur domain pelanggan dan berakhir
 * sebagai halaman tidak ditemukan.
 */
function isPlatformHost(hostname: string): boolean {
  const host = hostname.split(":")[0].toLowerCase();
  if (isLocalHost(hostname)) return true;
  return host === ROOT_DOMAIN || host.endsWith(`.${ROOT_DOMAIN}`);
}

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

  // --- ATURAN 0: JEBAKAN ---
  // Paling depan, sebelum logika penyewa maupun domain pelanggan: alamat umpan
  // harus tetap tertangkap dari host mana pun, termasuk subdomain penyewa yang
  // ikut menyandang nama domain kita.
  const trap = trapPrefixFor(url.pathname);
  if (trap) {
    // Path asli dititipkan lewat header karena setelah rewrite yang terbaca
    // route hanyalah "/_trap/...".
    const rewritten = new URL(`/trap${url.pathname}`, req.url);
    return NextResponse.rewrite(rewritten, {
      request: {
        headers: new Headers({
          ...Object.fromEntries(req.headers),
          "x-trap-target": `${hostname}${url.pathname}`,
        }),
      },
    });
  }

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
      new URL(`/sub/${tenant}${path}`, req.url)
    );
  }

  // --- ATURAN 3: DOMAIN MILIK PENGGUNA SENDIRI ---
  // Host apa pun yang bukan milik platform diperlakukan sebagai kandidat domain
  // pengguna. Middleware sengaja TIDAK menanyakan pemiliknya ke basis data:
  // itu berarti panggilan jaringan di setiap permintaan, termasuk permintaan
  // untuk host yang ternyata tidak dikenal. Pencariannya diserahkan ke halaman,
  // yang memang sudah berbicara dengan Convex.
  if (!isPlatformHost(hostname)) {
    if (isProtectedRoute(req)) {
      return NextResponse.redirect(
        new URL(url.pathname, `https://app.${ROOT_DOMAIN}`)
      );
    }

    const host = hostname.split(":")[0].toLowerCase();
    const path = url.pathname === "/" ? "" : url.pathname;
    return NextResponse.rewrite(new URL(`/domain/${host}${path}`, req.url));
  }

  // --- ATURAN 4: app.singkat.in root -> dashboard ---
  if (isAppDomain && url.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard/links", req.url));
  }

  // --- ATURAN 5: dashboard di domain utama -> pindahkan ke app ---
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
    // Alamat umpan berekstensi (mis. /wp-login.php, /xmlrpc.php) sengaja
    // didaftarkan terpisah: pola pertama menyaring berkas statis berdasarkan
    // ekstensi, dan sebagian umpan justru berbentuk seperti itu.
    '/(.*).php',
  ],
};
