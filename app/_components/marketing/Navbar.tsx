"use client";

import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import Image from "next/image";
import ThemeToggle, { ThemeSwitcher } from "../ThemeToggle";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Harga" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        {/* Merek — dikecilkan di layar sempit agar tidak mendesak tombol kanan */}
        <Link href="/" className="group flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Image
            src="/logo.svg"
            alt="singkat.in logo"
            width={40}
            height={40}
            className="h-8 w-8 transition-transform group-hover:scale-105 sm:h-10 sm:w-10"
          />
          <span className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            singkat<span className="text-brand">.in</span>
          </span>
        </Link>

        {/* --- MENU NAVIGASI (desktop) --- */}
        <div className="hidden items-center gap-6 text-base font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={`transition-colors hover:text-brand ${
                pathname === item.href ? "text-brand" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/*
            Di mobile baris ini sudah padat (tombol auth + avatar + hamburger),
            jadi toggle tema dipindah ke dalam panel menu. Dibungkus span agar
            `hidden` tidak beradu dengan `grid` milik komponennya sendiri.
          */}
          <span className="hidden md:block">
            <ThemeToggle />
          </span>

          {/* 1. KONDISI BELUM LOGIN */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="hidden px-4 py-2 font-medium text-muted-foreground transition hover:text-brand sm:block">
                Masuk
              </button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="btn-saweria px-4 py-2 text-sm font-bold sm:px-5 sm:py-2.5 sm:text-base">
                {/* Label dipendekkan di mobile supaya baris navbar tetap muat */}
                <span className="sm:hidden">Daftar</span>
                <span className="hidden sm:inline">Daftar Gratis</span>
              </button>
            </SignInButton>
          </SignedOut>

          {/* 2. KONDISI SUDAH LOGIN */}
          <SignedIn>
            <Link href="/dashboard/links">
              <button
                aria-label="Buka dashboard"
                className="flex items-center gap-2 rounded-full border-2 border-brand bg-card px-3 py-2 font-bold text-brand transition-colors hover:bg-brand hover:text-brand-contrast sm:px-5"
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </Link>
            <UserButton />
          </SignedIn>

          {/* Tombol menu mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-brand hover:text-brand active:scale-95 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* --- PANEL MENU MOBILE --- */}
      {open && (
        <div
          id="menu-mobile"
          className="animate-in fade-in slide-in-from-top-2 border-t border-border bg-card md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col px-4 py-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`rounded-xl px-3 py-3 font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-brand-soft text-brand-soft-fg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* "Masuk" disembunyikan di baris atas pada mobile, jadi ditaruh di sini */}
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-xl px-3 py-3 text-left font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Masuk
                </button>
              </SignInButton>
            </SignedOut>

            {/* Pengatur tema, dipindah ke sini dari baris navbar */}
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-border px-3 pt-4 pb-2">
              <span className="text-sm font-medium text-muted-foreground">Tema</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
