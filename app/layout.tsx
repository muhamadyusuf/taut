import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";
import { GoogleAnalytics } from '@next/third-parties/google';

// 1. Definisikan URL Production Anda (Sangat Penting untuk SEO)
const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
  ? process.env.NEXT_PUBLIC_APP_URL 
  : "https://singkat.in"; // Fallback jika env belum diset

export const metadata: Metadata = {
  // Base URL untuk menyelesaikan link gambar/og
  metadataBase: new URL(baseUrl),

  // KONFIGURASI JUDUL
  title: {
    default: "singkat.in - Perpendek Link Gratis & Analytics Lengkap",
    template: "%s | singkat.in", // %s diganti judul per halaman
  },

  // DESKRIPSI UTAMA (Muncul di hasil pencarian Google)
  // Tips: Gunakan kata kunci "Perpendek Link", "Shortlink", "QR Code", "Gratis"
  description: 
    "Platform shortlink terbaik untuk kebutuhan akademik dan bisnis. Perpendek link panjang, pantau statistik klik real-time, dan buat QR Code secara gratis. Aman dan terpercaya.",

  // KATA KUNCI (Meskipun Google jarang pakai ini, mesin pencari lain masih pakai)
  keywords: [
    "Shortlink Indonesia", 
    "Perpendek Link", 
    "Link Pendek Gratis", 
    "URL Shortener", 
    "ITTS", 
    "Buat QR Code", 
    "Analytics Link"
  ],

  // PENULIS / PEMBUAT
  authors: [{ name: "ITTS Team", url: "https://itts.ac.id" }],
  creator: "ITTS Dev Team",

  // PENGATURAN ROBOT (Agar di-index Google)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // TAMPILAN SHARE SOSMED (WhatsApp, Twitter, Facebook)
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: baseUrl,
    siteName: "singkat.in",
    title: "singkat.in - Satu Link untuk Semua Karyamu",
    description: "Kelola tautan akademik dan promosi dengan mudah. Gratis, cepat, dan dilengkapi fitur statistik lengkap.",
    // Siapkan gambar ukuran 1200x630 px, simpan di folder /public/og-image.png
    images: [
      {
        url: "/og-image.png", 
        width: 1200,
        height: 630,
        alt: "singkat.in Preview",
      },
    ],
  },

  // TAMPILAN TWITTER CARD
  twitter: {
    card: "summary_large_image",
    title: "singkat.in - Shortlink Kampus & Bisnis",
    description: "Platform manajemen tautan paling simpel dan powerful.",
    images: ["/og-image.png"], // Gunakan gambar yang sama
  },

  // ICON APLIKASI
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.jpg", // Simpan icon kotak di public folder
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}