"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
import ThemeToggle from "../ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.svg"
              alt="singkat.in logo"
              width={40}
              height={40}
              className="transition-transform group-hover:scale-105"
            />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              singkat<span className="text-brand">.in</span>
            </span>
          </Link>
        </div>

        {/* --- MENU NAVIGASI (Desktop Only) --- */}
        <div className="hidden md:flex items-center gap-6 text-base font-medium text-muted-foreground">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-brand transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* 1. KONDISI BELUM LOGIN */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-muted-foreground font-medium hover:text-brand transition px-4 py-2 hidden sm:block">
                Masuk
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn-saweria px-5 py-2.5 font-bold">
                Daftar Gratis
              </button>
            </SignInButton>
          </SignedOut>

          {/* 2. KONDISI SUDAH LOGIN */}
          <SignedIn>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/links">
                <button className="bg-card border-2 border-brand text-brand hover:bg-brand hover:text-brand-contrast px-5 py-2 rounded-full font-bold transition-colors flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </Link>
              {/* Tampilkan Foto Profil User */}
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
