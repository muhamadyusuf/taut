"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { 
  LayoutDashboard, Link as LinkIcon, BarChart3, Settings, 
  Menu, X, QrCode, Plus, Link2 // Import Link2 untuk logo
} from "lucide-react";
import CreateLinkModal from "./_components/CreateLinkModal"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) return <div className="h-screen flex items-center justify-center text-[#0193ff] font-medium">Memuat...</div>;

  if (!isSignedIn) {
      return (
        <div className="h-screen flex items-center justify-center flex-col gap-4 bg-[#f8faff]">
            <h2 className="text-xl font-bold text-[#2d3748]">Akses Ditolak</h2>
            <SignInButton mode="modal">
                <button className="btn-saweria">Masuk ke Taut</button>
            </SignInButton>
        </div>
      );
  }

  const menuItems = [
    { name: "Tautan Saya", href: "/dashboard/links", icon: LinkIcon },
    { name: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
    { name: "Statistik", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8faff] flex">
      <CreateLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* SIDEBAR TAUT STYLE */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col shadow-[2px_0_20px_rgba(0,0,0,0.03)] border-r border-gray-50/50 rounded-r-[30px] md:rounded-r-none`}>
        <div className="h-24 flex items-center px-8">
          {/* Logo Taut */}
          <div className="flex items-center gap-2.5 text-[#0193ff]">
            <div className="bg-[#0193ff] p-2 rounded-xl text-white transform -rotate-6 shadow-md shadow-blue-200">
                <Link2 strokeWidth={3} size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#2d3748]">Taut<span className="text-[#0193ff]">-nine</span></span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto text-gray-400"><X size={24}/></button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 font-medium">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 w-full px-6 py-3.5 rounded-full transition-all duration-200 group ${isActive ? 'bg-[#0193ff] text-white shadow-lg shadow-blue-200/50' : 'text-[#718096] hover:bg-blue-50 hover:text-[#0193ff]'}`}
              >
                <item.icon size={20} className={isActive ? "text-white" : "text-[#718096] group-hover:text-[#0193ff]"} /> 
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-6">
            <div className="bg-[#fffcf0] border border-yellow-100 p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-yellow-400 p-2 rounded-full text-white">⚡</div>
                <div>
                    <p className="text-sm font-bold text-yellow-800">Taut Pro</p>
                    <p className="text-xs text-yellow-600">Fitur lebih lengkap.</p>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen">
        <header className="h-24 bg-transparent flex items-center justify-between px-6 md:px-10 sticky top-0 z-30 backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden text-[#718096] bg-white p-2 rounded-xl shadow-sm"><Menu/></button>
                <div>
                    <h1 className="font-bold text-2xl text-[#2d3748] capitalize">
                        {pathname.split("/").pop()?.replace("-", " ")}
                    </h1>
                </div>
            </div>
            
            <div className="flex items-center gap-6">
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="btn-saweria flex items-center gap-2 pl-4 pr-6 py-3"
                >
                    <div className="bg-white/20 p-1 rounded-full"><Plus size={18} strokeWidth={3} /></div>
                    <span>Tautkan Link</span>
                </button>
                 <div className="bg-white p-1 rounded-full shadow-sm border border-gray-100">
                   <UserButton afterSignOutUrl="/"/>
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