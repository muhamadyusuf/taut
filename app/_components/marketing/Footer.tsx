import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
                <Link href="/" className="flex items-center gap-2.5">
                  {/* Logo */}
                  <Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} />
                  {/* Nama Brand */}
                  <span className="text-2xl font-bold tracking-tight text-[#2d3748]">singkat<span className="text-[#0193ff]">.in</span></span>
              </Link>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Platform manajemen tautan.<br/>Aman, Cepat, dan Terpercaya.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-[#2d3748] mb-4">Menu</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/" className="hover:text-[#0193ff]">Beranda</Link></li>
              <li><Link href="/about" className="hover:text-[#0193ff]">Tentang Kami</Link></li>
              <li><Link href="/contact" className="hover:text-[#0193ff]">Kontak & Lokasi</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#2d3748] mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/privacy" className="hover:text-[#0193ff]">Kebijakan Privasi</Link></li>
              <li><Link href="/terms" className="hover:text-[#0193ff]">Syarat Penggunaan</Link></li>
              <li><a href="mailto:info@singkat.in" className="hover:text-[#0193ff]">Bantuan IT</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ITTS Dev Team. All rights reserved.
        </div>
      </div>
    </footer>
  );
}