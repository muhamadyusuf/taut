"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Image from "next/image";

// 1. IMPORT FILE DESAIN 404 KITA
// Pastikan path-nya benar. Jika file ada di app/not-found.tsx, import seperti ini:
import NotFoundPage from "@/app/not-found"; 

export default function RedirectPage() {
  const params = useParams();
  
  // Sesuaikan nama parameter dengan nama folder file Anda [slug] atau [shortCode]
  // Jika nama foldernya [slug], ganti jadi params.slug
  const shortCode = (params.slug || params.shortCode) as string;
  
  const getLink = useMutation(api.links.getLinkAndIncrement);
  
  // 2. GUNAKAN STATE UNTUK STATUS
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const performRedirect = async () => {
      // Jika shortCode belum ready, jangan jalan dulu
      if (!shortCode) return;

      try {
        const originalUrl = await getLink({ shortCode });
        
        if (originalUrl) {
          // Redirect Sukses
          window.location.replace(originalUrl);
        } else {
          // 3. JIKA LINK KOSONG -> UBAH STATE
          setIsNotFound(true);
        }
      } catch (error) {
        console.error("Redirect error:", error);
        // Jika error sistem (misal internet mati), bisa dianggap not found juga atau error page lain
        setIsNotFound(true); 
      }
    };

    performRedirect();
  }, [shortCode, getLink]);

  // 4. RENDER HALAMAN 404 JIKA STATE TRUE
  if (isNotFound) {
    return <NotFoundPage />;
  }

  // Tampilan Loading
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans relative">
      
      <div className="flex flex-col items-center">
        {/* --- ANIMASI UTAMA: LOGO BERDENYUT --- */}
        <div className="relative">
           {/* Lingkaran Denyut di Belakang */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-100 rounded-full animate-ping opacity-75" style={{ animationDuration: '2s' }}></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-50 rounded-full animate-ping opacity-50 animation-delay-500" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>

           {/* Logo Utama di Tengah (Diam/Stabil) */}
           <div className="relative z-10 bg-[#FFFFFF] p-4 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center">
            <Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} />
          </div>
        </div>

        {/* Teks */}
        <h1 className="mt-10 text-2xl font-extrabold text-[#2d3748] tracking-tight">
          singkat<span className="text-[#0193ff]">.in</span>
        </h1>
        <div className="mt-3 flex items-center gap-1 text-gray-500 font-medium bg-gray-50 px-4 py-1.5 rounded-full">
            <span>Mengalihkan tautan</span>
            {/* Animasi titik tiga (...) manual */}
            <span className="flex space-x-1 ml-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </span>
        </div>
      </div>
    </div>
  );
}