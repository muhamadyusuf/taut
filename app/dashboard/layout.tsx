"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import {
  Link as LinkIcon, BarChart3, Settings,
  Menu, X, QrCode, Plus, Layers, Smartphone,
  ShoppingBag, ShieldCheck, ClipboardList, Sparkles, Palette, Globe, Link2, Code2,
  Crown, ChevronDown
} from "lucide-react";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CreateLinkModal from "./_components/CreateLinkModal";
import ThemeToggle from "../_components/ThemeToggle";
import LanguageToggle from "../_components/LanguageToggle";
import { useEnsureUser } from "../_components/useEnsureUser";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import PlanBadge from "../_components/billing/PlanBadge";
import type { PlanId } from "@/convex/plans";

export function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();
  const locale = useLocale();
  const t = getDictionary(locale).dashboard;

  const premiumMenuItems = [
    { name: t.sidebar.subdomain, href: "/dashboard/subdomains", icon: Globe },
    { name: t.sidebar.ownDomain, href: "/dashboard/domains", icon: Link2 },
    { name: t.sidebar.landingPage, href: "/dashboard/branding", icon: Palette },
    { name: t.sidebar.developer, href: "/dashboard/developer", icon: Code2 },
  ];
  const isPremiumRouteActive = premiumMenuItems.some((item) => pathname.startsWith(item.href));
  const [premiumMenuOpen, setPremiumMenuOpen] = useState(isPremiumRouteActive);

  useEnsureUser();
  const me = useQuery(api.users.getMe);
  const isAdmin = me?.isAdmin ?? false;

  // `me.plan` adalah paket EFEKTIF: backend sudah menurunkannya ke gratis
  // begitu masa aktif lewat, jadi tampilan tidak menghitung tanggal sendiri.
  const currentPlan: PlanId = (me?.plan as PlanId) ?? "free";
  const planExpiresAt = me?.planExpiresAt ?? null;

  // Kolom mentah masih menyimpan paket yang dibeli. Bedanya dengan paket
  // efektif inilah yang memberi tahu bahwa langganannya baru saja habis —
  // tanpa itu, akun yang kedaluwarsa tidak bisa dibedakan dari akun yang
  // memang belum pernah berlangganan.
  const justExpired = me ? me.storedPlan !== "free" && me.plan === "free" : false;

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-brand font-medium">
        {t.loading}
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <h2 className="text-xl font-bold text-foreground">{t.accessDenied.title}</h2>
        <SignInButton mode="modal">
          <button className="btn-saweria">{t.accessDenied.loginButton}</button>
        </SignInButton>
      </div>
    );
  }

  const menuItems = [
    { name: t.sidebar.links, href: "/dashboard/links", icon: LinkIcon },
    { name: t.sidebar.categories, href: "/dashboard/categories", icon: Layers },
    { name: t.sidebar.qrCodes, href: "/dashboard/qr-codes", icon: QrCode },
    { name: t.sidebar.forms, icon: ClipboardList, href: "/dashboard/forms", isNew: true },
    { name: t.sidebar.microsite, icon: Smartphone, href: "/dashboard/microsite", isNew: false },
    { name: t.sidebar.shop, icon: ShoppingBag, href: "/dashboard/shop", isNew: false },
    { name: t.sidebar.analytics, href: "/dashboard/analytics", icon: BarChart3 },
    { name: t.sidebar.billing, href: "/dashboard/billing", icon: Sparkles },
    { name: t.sidebar.settings, href: "/dashboard/settings", icon: Settings },
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
            aria-label={t.sidebar.closeMenu}
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
                    {t.sidebar.newBadge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Grup "Akses Premium" — menu fitur premium dilipat agar sidebar tidak penuh */}
          <div>
            <button
              type="button"
              onClick={() => setPremiumMenuOpen((prev) => !prev)}
              aria-expanded={premiumMenuOpen}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isPremiumRouteActive
                  ? "bg-brand-soft text-brand-soft-fg font-bold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              }`}
            >
              <Crown
                size={20}
                className={isPremiumRouteActive ? "text-brand" : "text-subtle group-hover:text-foreground"}
              />
              <span>{t.sidebar.premiumAccess}</span>
              <ChevronDown
                size={18}
                className={`ml-auto transition-transform duration-200 ${premiumMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {premiumMenuOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-border space-y-1">
                {premiumMenuItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-brand-soft text-brand-soft-fg font-bold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={isActive ? "text-brand" : "text-subtle group-hover:text-foreground"}
                      />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

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
                <span>{t.sidebar.admin}</span>
                <span className="absolute right-3 bg-brand-soft text-brand-soft-fg text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {t.sidebar.adminBadge}
                </span>
              </Link>
            </>
          )}
        </nav>

        {/* Status paket yang sebenarnya. Kotak promo sebelumnya selalu menulis
            "singkat.in Pro" untuk semua orang — termasuk yang memang sudah Pro,
            sehingga tidak pernah memberi tahu apa pun. */}
        <div className="p-6">
          <Link href="/dashboard/billing" onClick={() => setSidebarOpen(false)}>
            <div className="rounded-2xl border border-border bg-muted/50 p-4 transition hover:border-brand">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  {t.sidebar.planCardTitle}
                </span>
                <PlanBadge plan={currentPlan} size="sm" />
              </div>

              {planExpiresAt ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.sidebar.planActiveUntil}{" "}
                  {new Date(planExpiresAt).toLocaleDateString(
                    locale === "en" ? "en-US" : "id-ID",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </p>
              ) : justExpired ? (
                <p className="mt-2 text-xs text-danger">{t.sidebar.planExpiredHint}</p>
              ) : currentPlan === "free" ? (
                <p className="mt-2 text-xs text-brand">{t.sidebar.planSeePaid} &rarr;</p>
              ) : null}
            </div>
          </Link>
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
              aria-label={t.sidebar.openMenu}
            >
              <Menu />
            </button>
            <h1 className="truncate font-bold text-lg sm:text-xl md:text-2xl text-foreground capitalize">
              {pathname.split("/").pop()?.replace("-", " ")}
            </h1>
            {/* Paket gratis tidak diberi lencana di header: menandai setiap
                orang justru menghilangkan artinya sebagai pembeda. */}
            {currentPlan !== "free" && (
              <span className="hidden shrink-0 sm:inline">
                <PlanBadge plan={currentPlan} size="sm" />
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
            <LanguageToggle locale={locale} />
            <ThemeToggle />
            <button
              onClick={() => setIsModalOpen(true)}
              aria-label={t.topbar.createLinkAria}
              className="btn-saweria flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 md:pr-6"
            >
              <div className="bg-white/20 p-1 rounded-full"><Plus size={18} strokeWidth={3} /></div>
              <span className="hidden sm:inline">{t.topbar.createLink}</span>
            </button>
            <div className="bg-card p-1 rounded-full border border-border">
              <UserButton afterSignOutUrl="/">
                <UserButton.MenuItems>
                  <UserButton.Link
                    label={t.topbar.myForms}
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
