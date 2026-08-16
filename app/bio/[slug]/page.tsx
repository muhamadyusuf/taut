import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import { THEMES } from "@/lib/themeConfig";
import { clerkClient } from "@clerk/nextjs/server";
import Image from "next/image";
import { getIcon } from "@/lib/iconMap";

// --- TYPE DEFINITIONS ---
interface Props {
  params: Promise<{ slug: string }>;
}

interface LinkItem {
  id: string;
  type: 'header' | 'link';
  label: string;
  url?: string;
  icon?: string;
  active?: boolean;
}

// 1. GENERATE METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchQuery(api.microsites.getPublicMicrosite, { slug });
  
  if (!data) return { title: "Halaman Tidak Ditemukan" };

  // Logic Fallback Image untuk Metadata (Sama seperti render di bawah)
  let metaImage = data.imageUrl;
  if (!metaImage && data.userId) {
      try {
        const client = await clerkClient();
        const userOwner = await client.users.getUser(data.userId);
        metaImage = userOwner.imageUrl;
      } catch (e) { /* Ignore error for metadata */ }
  }
  
  return {
    title: `${data.title} | Singkat.in`,
    description: data.bio || `Kunjungi profil ${data.title} untuk melihat tautan lengkap.`,
    openGraph: {
        title: data.title,
        description: data.bio || "Lihat tautan lengkap saya di sini.",
        images: metaImage ? [metaImage] : [], 
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.bio || "",
        images: metaImage ? [metaImage] : [], 
    }
  };
}

// 2. KOMPONEN HALAMAN UTAMA
export default async function PublicBioPage({ params }: Props) {
  const { slug } = await params;
  
  const data = await fetchQuery(api.microsites.getPublicMicrosite, { slug });
  
  if (!data) return notFound();

  // --- 3. LOGIC PENENTUAN GAMBAR PROFIL ---
  let finalImageUrl = data.imageUrl;

  // Jika user TIDAK upload custom image, tapi kita punya User ID pembuatnya
  // Kita ambil foto profil asli dari Clerk
  if (!finalImageUrl && data.userId) {
      try {
          const client = await clerkClient();
          const userOwner = await client.users.getUser(data.userId);
          finalImageUrl = userOwner.imageUrl;
      } catch (error) {
          console.error("Gagal mengambil foto profil user:", error);
          // Jika gagal, tetap null (nanti tampil inisial huruf)
      }
  }

  const theme = THEMES[data.theme] || THEMES["simple-blue"];

  return (
    <div className={`min-h-screen flex flex-col items-center py-16 px-6 relative overflow-x-hidden transition-colors duration-500 ${theme.bg}`}>
      
      {/* BACKGROUND IMAGE */}
      {data.backgroundUrl && (
          <div className="absolute inset-0 z-0 select-none">
             <img 
                src={data.backgroundUrl} 
                alt="Background" 
                className="w-full h-full object-cover opacity-100"
                referrerPolicy="no-referrer" 
             />
             <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
          </div>
      )}

      {/* KONTEN UTAMA */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
         
         {/* FOTO PROFIL (Sekarang menggunakan finalImageUrl) */}
         <div className="w-28 h-28 rounded-full border-[3px] border-white/80 shadow-2xl overflow-hidden mb-6 bg-gray-200 shrink-0 relative group">
            {finalImageUrl ? (
                <img 
                    src={finalImageUrl} 
                    alt={data.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
            ) : (
                // Fallback Inisial jika fetch Clerk juga gagal
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 text-4xl font-bold select-none">
                    {data.title.charAt(0).toUpperCase()}
                </div>
            )}
         </div>
         
         {/* NAMA & BIO */}
         <h1 className={`text-2xl md:text-3xl font-bold mb-3 text-center drop-shadow-sm tracking-tight ${theme.text}`}>
            {data.title}
         </h1>
         
         {data.bio && (
             <p className={`text-sm md:text-base opacity-95 mb-10 max-w-xs leading-relaxed text-center whitespace-pre-wrap drop-shadow-sm font-medium ${theme.text}`}>
                {data.bio}
             </p>
         )}

         {/* LIST LINK */}
         <div className="w-full space-y-4 mb-16 px-2">
            {(data.links as LinkItem[]).map((item: LinkItem) => {
                if (item.type === 'header') {
                    return (
                        <h3 
                            key={item.id} 
                            className={`text-center text-[10px] font-bold uppercase tracking-[0.2em] mt-8 mb-2 opacity-80 ${theme.header || theme.text}`}
                        >
                            {item.label}
                        </h3>
                    );
                }

                return (
                    <a 
                        key={item.id} 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`
                            block w-full p-4 rounded-xl relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg active:scale-95
                            flex items-center justify-center gap-3 font-bold text-sm
                            ${theme.button}
                        `}
                    >
                        {/* RENDER ICON DISINI */}
                        {item.icon && (
                            <span className="absolute left-4 opacity-80 group-hover:opacity-100 transition-opacity">
                                {getIcon(item.icon)}
                            </span>
                        )}

                        {/* Label (Teks) */}
                        <span className="z-10 relative">{item.label}</span>
                        
                        {/* Icon External Link (Opsional, di kanan) */}
                        {!item.icon && (
                          <ExternalLink size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 absolute right-4"/>
                        )}
                    </a>
                );
            })}
         </div>

         {/* FOOTER — disembunyikan untuk pemilik berpaket berbayar */}
         {data.showBranding && (
           <Link
              href="/"
              className={`mt-auto opacity-60 hover:opacity-100 transition-opacity duration-300 items-center gap-2 text-[10px] font-bold tracking-widest py-4 ${theme.text}`}
           >
              <center className="py-2"><Image src="/logo.svg" alt="singkat.in logo" width={40} height={40} /></center>
              <center>Powered by singkat.in</center>
           </Link>
         )}

      </div>
    </div>
  );
}