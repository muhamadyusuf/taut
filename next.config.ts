import type { NextConfig } from "next";

/**
 * Header keamanan untuk seluruh respons.
 *
 * Tanpa ini, halaman aplikasi bisa dibingkai situs lain (clickjacking pada
 * dasbor dan halaman antara), dan alamat tujuan lengkap ikut terkirim sebagai
 * Referer ke setiap situs yang dituju tautan pendek — bocornya justru data
 * yang paling privat di produk ini.
 */
const securityHeaders = [
  // Halaman ini tidak pernah perlu dibingkai siapa pun.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },

  // Menahan penebakan tipe konten pada berkas yang diunggah/di-proxy.
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Situs tujuan cukup tahu asal permintaan, bukan seluruh URL-nya.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Fitur perangkat yang tidak dipakai aplikasi ini sama sekali.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // HSTS: sekali pengunjung datang lewat https, jangan pernah turun ke http.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
