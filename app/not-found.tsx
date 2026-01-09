import Link from "next/link";
import { ArrowLeft, FileQuestion, SearchX } from "lucide-react";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col font-sans text-[#2d3748]">
      
      {/* Header Minimalis */}
      <header className="p-6 flex justify-center md:justify-start">
        <Link href={process.env.NEXT_PUBLIC_APP_URL || "/"} className="flex items-center gap-2.5">
            {/* Logo */}
            <Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} />
            {/* Nama Brand */}
            <span className="text-2xl font-bold tracking-tight text-[#2d3748]">singkat<span className="text-[#0193ff]">.in</span></span>
        </Link>
      </header>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center -mt-20">
        
        {/* Ilustrasi Icon */}
        <div className="relative mb-8">
            {/* Lingkaran Background */}
            <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                <SearchX size={64} className="text-[#0193ff] opacity-50" />
            </div>
            
            {/* Icon Depan */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 transform -rotate-6 hover:rotate-0 transition duration-300">
                <FileQuestion size={48} className="text-[#0193ff]" />
            </div>
        </div>

        {/* Teks Pesan */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2d3748] mb-4">
          Waduh, Tautan Nyasar!
        </h1>
        
        <p className="text-lg text-gray-500 max-w-md mb-10 leading-relaxed">
          Halaman atau tautan pendek yang Anda cari tidak ditemukan. Mungkin sudah dihapus pemiliknya atau ada salah ketik di URL-nya.
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row gap-4">
            <Link href={process.env.NEXT_PUBLIC_APP_URL || "/"}>
                <button className="px-8 py-3.5 bg-[#0193ff] hover:bg-[#007acc] text-white rounded-full font-bold shadow-lg shadow-blue-500/30 transition hover:-translate-y-1 flex items-center gap-2">
                    <ArrowLeft size={20} />
                    Kembali ke Beranda
                </button>
            </Link>
            
            {/* Opsi Tambahan (Opsional) */}
            <Link href={process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/contact` : "/contact"}>
                <button className="px-8 py-3.5 bg-white border border-gray-200 hover:border-[#0193ff] text-gray-600 hover:text-[#0193ff] rounded-full font-bold transition">
                    Lapor Masalah
                </button>
            </Link>
        </div>

      </main>

      {/* Footer Minimalis */}
      <footer className="p-6 text-center text-sm text-gray-400">
        &copy; {new Date().getFullYear()} Singkat.in &bull; URL Shortener
      </footer>
    </div>
  );
}