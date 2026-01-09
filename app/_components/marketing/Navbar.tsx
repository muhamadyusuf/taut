"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="top-0 z-50 bg-[#f8faff]/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8"> {/* Tambah gap biar ada jarak ke menu */}
            <Link href="/" className="flex items-center gap-2.5">
                {/* Logo */}
                <Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} />
                {/* Nama Brand */}
                <span className="text-2xl font-bold tracking-tight text-[#2d3748]">singkat<span className="text-[#0193ff]">.in</span></span>
            </Link>
        </div>
        <div className="flex items-center gap-8"> {/* Tambah gap biar ada jarak ke menu */}

            {/* --- MENU NAVIGASI BARU (Desktop Only) --- */}
            <div className="hidden md:flex items-center gap-6 text-base font-medium text-gray-500">
                <Link href="/" className="hover:text-[#0193ff] transition">Home</Link>
                <Link href="/about" className="hover:text-[#0193ff] transition">Tentang</Link>
                <Link href="/contact" className="hover:text-[#0193ff] transition">Kontak</Link>
            </div>
        </div>
        <div className="flex items-center gap-4">
            {/* 1. KONDISI BELUM LOGIN */}
            <SignedOut>
                <SignInButton mode="modal">
                <button className="text-[#718096] font-medium hover:text-[#0193ff] transition px-4 py-2 hidden sm:block">
                    Masuk
                </button>
                </SignInButton>
                <SignInButton mode="modal">
                <button className="bg-[#0193ff] hover:bg-[#007acc] text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-blue-500/30 transition hover:scale-105 active:scale-95">
                    Daftar Gratis
                </button>
                </SignInButton>
            </SignedOut>

            {/* 2. KONDISI SUDAH LOGIN */}
            <SignedIn>
                <div className="flex items-center gap-4">
                <Link href="/dashboard/links">
                    <button className="bg-white border-2 border-[#0193ff] text-[#0193ff] hover:bg-[#0193ff] hover:text-white px-5 py-2 rounded-full font-bold transition flex items-center gap-2">
                    <LayoutDashboard size={18}/>
                    Dashboard
                    </button>
                </Link>
                {/* Tampilkan Foto Profil User */}
                <UserButton afterSignOutUrl={process.env.NEXT_PUBLIC_APP_URL || "/"} />
                </div>
            </SignedIn>
        </div>
      </div>
    </nav>
  );
}