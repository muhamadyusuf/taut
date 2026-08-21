"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Link as LinkIcon,
  Users,
  BarChart3,
  ShieldCheck,
  Megaphone,
  Newspaper,
  ShieldAlert,
  Radar,
} from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Statistik Link", href: "/admin/analytics", icon: BarChart3 },
  { name: "Rekap Link", href: "/admin/links", icon: LinkIcon },
  { name: "Pengguna", href: "/admin/users", icon: Users },
  { name: "Artikel", href: "/admin/articles", icon: Newspaper },
  { name: "Iklan", href: "/admin/ads", icon: Megaphone },
  { name: "Penyalahgunaan", href: "/admin/abuse", icon: ShieldAlert },
  { name: "Jebakan", href: "/admin/security", icon: Radar },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#0b1736] dark:bg-card dark:border-r dark:border-border text-white dark:text-foreground flex flex-col shadow-xl hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10 dark:border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-brand" />
            <span className="text-lg font-bold tracking-tight">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-brand text-brand-contrast shadow-md"
                    : "text-white/60 dark:text-muted-foreground hover:bg-white/10 dark:hover:bg-muted hover:text-white dark:hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 dark:border-border flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="text-xs text-white/50 dark:text-muted-foreground">
            <p className="font-medium text-white/80 dark:text-foreground">Administrator</p>
            <p>singkat.in</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-14 bg-[#0b1736] dark:bg-card dark:border-b dark:border-border text-white dark:text-foreground flex items-center justify-between px-4 md:hidden shadow">
        <div className="flex min-w-0 items-center gap-2">
          <ShieldCheck className="h-5 w-5 shrink-0 text-brand" />
          <span className="truncate text-sm font-bold">Admin</span>
        </div>
        {/* Jarak & padding dirapatkan: 5 ikon + avatar + label harus muat di 360px */}
        <div className="flex shrink-0 items-center gap-1">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.name}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-lg p-1.5 transition-colors ${
                  isActive
                    ? "bg-brand text-brand-contrast"
                    : "text-white/60 dark:text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            );
          })}
          <span className="ml-1">
            <UserButton afterSignOutUrl="/" />
          </span>
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
