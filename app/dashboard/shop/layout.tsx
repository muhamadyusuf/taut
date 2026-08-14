"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Settings, ListOrdered, PlusCircle } from "lucide-react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Produk", href: "/dashboard/shop", icon: ShoppingBag },
    { name: "Pesanan", href: "/dashboard/shop/orders", icon: ListOrdered },
    { name: "Pengaturan", href: "/dashboard/shop/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Toko Digital</h1>
            <p className="text-muted-foreground">Kelola produk dan pembayaran Midtrans Anda.</p>
        </div>
        <Link href="/dashboard/shop/new" className="bg-brand text-brand-contrast px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-hover transition">
            <PlusCircle size={16} /> Tambah Produk
        </Link>
      </div>

      {/* Tabs Navigasi */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors
                  ${isActive 
                    ? "border-brand text-brand" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}
                `}
              >
                <tab.icon size={18} />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
}