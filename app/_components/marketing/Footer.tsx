import Link from "next/link";
import Image from "next/image";

const MENU_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/blog", label: "Artikel" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/contact", label: "Kontak & Lokasi" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/terms", label: "Syarat Penggunaan" },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="flex items-center gap-2.5">
                <Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} />
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  singkat<span className="text-brand">.in</span>
                </span>
              </Link>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Platform manajemen tautan.<br />Aman, Cepat, dan Terpercaya.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Menu</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {MENU_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-brand transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-4">Legal &amp; Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LEGAL_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-brand transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:info@singkat.in" className="hover:text-brand transition-colors">
                  Bantuan IT
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-subtle">
          &copy; {new Date().getFullYear()} ITTS Dev Team. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
