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
} from "lucide-react";

const menuItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Statistik Link", href: "/admin/analytics", icon: BarChart3 },
  { name: "Rekap Link", href: "/admin/links", icon: LinkIcon },
  { name: "Pengguna", href: "/admin/users", icon: Users },
  { name: "Iklan", href: "/admin/ads", icon: Megaphone },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#0b1736] text-white flex flex-col shadow-xl hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#0193ff]" />
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
                    ? "bg-[#0193ff] text-white shadow-md"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="text-xs text-white/50">
            <p className="font-medium text-white/80">Administrator</p>
            <p>singkat.in</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 h-14 bg-[#0b1736] text-white flex items-center justify-between px-4 md:hidden shadow">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#0193ff]" />
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          {menuItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg ${isActive ? "bg-[#0193ff]" : "text-white/60"}`}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            );
          })}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  );
}
