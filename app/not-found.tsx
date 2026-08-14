import Link from "next/link";
import { ArrowLeft, FileQuestion, SearchX } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  const homeUrl = process.env.NEXT_PUBLIC_APP_URL || "/";
  const contactUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/contact`
    : "/contact";

  return (
    <div className="bg-aurora min-h-screen bg-background flex flex-col text-foreground">
      {/* Header Minimalis */}
      <header className="p-6 flex justify-center md:justify-start relative z-10">
        <Link href={homeUrl} className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} />
          <span className="text-2xl font-bold tracking-tight text-foreground">
            singkat<span className="text-brand">.in</span>
          </span>
        </Link>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center -mt-20 relative z-10">
        {/* Ilustrasi Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-brand-soft rounded-full flex items-center justify-center animate-pulse">
            <SearchX size={64} className="text-brand opacity-50" />
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-4 rounded-2xl shadow-xl border border-border transform -rotate-6 hover:rotate-0 transition duration-300">
            <FileQuestion size={48} className="text-brand" />
          </div>
        </div>

        {/* Teks Pesan */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Waduh, Tautan Nyasar!
        </h1>

        <p className="text-lg text-muted-foreground max-w-md mb-10 leading-relaxed">
          Halaman atau tautan pendek yang Anda cari tidak ditemukan. Mungkin sudah
          dihapus pemiliknya atau ada salah ketik di URL-nya.
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={homeUrl}>
            <button className="btn-saweria px-8 py-3.5 flex items-center gap-2 hover:-translate-y-0.5">
              <ArrowLeft size={20} />
              Kembali ke Beranda
            </button>
          </Link>

          <Link href={contactUrl}>
            <button className="btn-ghost px-8 py-3.5">Lapor Masalah</button>
          </Link>
        </div>
      </main>

      {/* Footer Minimalis */}
      <footer className="p-6 text-center text-sm text-subtle relative z-10">
        &copy; {new Date().getFullYear()} Singkat.in &bull; URL Shortener
      </footer>
    </div>
  );
}
