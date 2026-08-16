"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import {
  Link as LinkIcon, BarChart3, Settings,
  Menu, X, QrCode, Plus, Layers, Smartphone,
  ShoppingBag, ShieldCheck, ClipboardList, Sparkles, Palette
} from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CreateLinkModal from "./_components/CreateLinkModal";
import ThemeToggle from "../_components/ThemeToggle";
import { useEnsureUser } from "../_components/useEnsureUser";

export function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  useEnsureUser();
  const me = useQuery(api.users.getMe);
  const isAdmin = me?.isAdmin ?? false;

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-brand font-medium">
        Memuat...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <h2 className="text-xl font-bold text-foreground">Akses Ditolak</h2>
        <SignInButton mode="modal">
          <button className="btn-saweria">Masuk ke singkat.in</button>
        </SignInButton>
      </div>
    );
  }

  const menuItems = [
    { name: "Tautan Saya", href: "/dashboard/links", icon: LinkIcon },
    { name: "Kategori", href: "/dashboard/categories", icon: Layers },
    { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
    { name: "Formulir", icon: ClipboardList, href: "/dashboard/forms", isNew: true },
    { name: "Microsite", icon: Smartphone, href: "/dashboard/microsite", isNew: false },
    { name: "Shop", icon: ShoppingBag, href: "/dashboard/shop", isNew: false },
    { name: "Statistik", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Halaman Antara", href: "/dashboard/branding", icon: Palette },
    { name: "Paket & Tagihan", href: "/dashboard/billing", icon: Sparkles },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <CreateLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Backdrop sidebar mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[var(--overlay)] backdrop-blur-sm md:hidden"
          aria-hidden
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-[2px_0_24px_-12px_rgb(0_0_0_/_0.2)] rounded-r-[30px] md:rounded-r-none`}
      >
        <div className="h-24 flex items-center px-8">
          <Link href={process.env.NEXT_PUBLIC_APP_URL || "/"}>
            <div className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="singkat.in logo" width={44} height={44} />
              <span className="text-2xl font-bold tracking-tight text-foreground">
                singkat<span className="text-brand">.in</span>
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden ml-auto text-muted-foreground hover:text-foreground"
            aria-label="Tutup menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? "bg-brand-soft text-brand-soft-fg font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                }`}
              >
                <item.icon
                  size={20}
                  className={isActive ? "text-brand" : "text-subtle group-hover:text-foreground"}
                />

                <span>{item.name}</span>

                {/* Badge "NEW" untuk fitur baru */}
                {item.isNew && (
                  <span className="absolute right-3 bg-danger-soft text-danger text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}

          {/* Menu Administrator — hanya untuk admin */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-border" />
              <Link
                href="/admin"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  pathname.startsWith("/admin")
                    ? "bg-[#0b1736] text-white font-bold dark:bg-brand-soft dark:text-brand-soft-fg"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                }`}
              >
                <ShieldCheck
                  size={20}
                  className={pathname.startsWith("/admin") ? "text-brand" : "text-subtle group-hover:text-foreground"}
                />
                <span>Administrator</span>
                <span className="absolute right-3 bg-brand-soft text-brand-soft-fg text-[10px] font-bold px-2 py-0.5 rounded-full">
                  ADMIN
                </span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-6">
          <div className="bg-warning-soft border border-warning/25 p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-warning p-2 rounded-full text-brand-contrast leading-none">⚡</div>
            <div>
              <p className="text-sm font-bold text-warning">singkat.in Pro</p>
              <p className="text-xs text-muted-foreground">Fitur lebih lengkap.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="h-20 md:h-24 glass flex items-center justify-between gap-2 px-4 md:px-10 sticky top-0 z-30 border-b border-border">
          {/* min-w-0 wajib: tanpa itu judul panjang menolak menyusut dan mendorong tombol kanan keluar layar */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden shrink-0 text-muted-foreground bg-card border border-border p-2 rounded-xl"
              aria-label="Buka menu"
            >
              <Menu />
            </button>
            <h1 className="truncate font-bold text-lg sm:text-xl md:text-2xl text-foreground capitalize">
              {pathname.split("/").pop()?.replace("-", " ")}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsModalOpen(true)}
              aria-label="Tautkan link baru"
              className="btn-saweria flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 md:pr-6"
            >
              <div className="bg-white/20 p-1 rounded-full"><Plus size={18} strokeWidth={3} /></div>
              <span className="hidden sm:inline">Tautkan Link</span>
            </button>
            <div className="bg-card p-1 rounded-full border border-border">
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Formulir Saya"
                    labelIcon={<ClipboardList size={16} />}
                    href="/dashboard/forms"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </header>

        <main className="p-6 md:px-10 md:py-8 overflow-y-auto flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
