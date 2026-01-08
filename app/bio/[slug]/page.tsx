import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";

// 1. Update Type Definition (params adalah Promise)
interface Props {
  params: Promise<{ slug: string }>;
}

// 2. Fix generateMetadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; // WAJIB DI-AWAIT
  
  const data = await fetchQuery(api.microsites.getPublicMicrosite, { slug });
  if (!data) return { title: "Halaman Tidak Ditemukan" };
  
  return {
    title: `${data.title} | Bio Link`,
    description: data.bio || `Cek tautan lengkap dari ${data.title}`,
    openGraph: {
        images: data.imageUrl ? [data.imageUrl] : [],
    }
  };
}

// 3. Fix Page Component
export default async function PublicBioPage({ params }: Props) {
  const { slug } = await params; // WAJIB DI-AWAIT DI SINI JUGA
  
  const data = await fetchQuery(api.microsites.getPublicMicrosite, { slug });
  
  if (!data) return notFound();

  // Helper Style
  const getThemeClass = (t: string) => {
    switch(t) {
        case "dark": return "bg-gray-900 text-white";
        case "gradient": return "bg-gradient-to-br from-purple-500 to-pink-500 text-white";
        default: return "bg-[#f8faff] text-[#2d3748]";
    }
  };

  const getButtonClass = (t: string) => {
      switch(t) {
          case "dark": return "bg-gray-800 border border-gray-700 hover:bg-gray-700 text-white";
          case "gradient": return "bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white";
          default: return "bg-white border border-gray-200 shadow-sm hover:border-[#0193ff] hover:text-[#0193ff] text-[#2d3748]";
      }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center py-16 px-6 ${getThemeClass(data.theme)}`}>
      
      {/* Profile */}
      <div className="w-full max-w-md flex flex-col items-center text-center">
         <div className="w-28 h-28 rounded-full bg-gray-200 mb-6 overflow-hidden border-4 border-white/20 shadow-xl">
            {data.imageUrl && <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover"/>}
         </div>
         
         <h1 className="text-2xl md:text-3xl font-bold mb-2">{data.title}</h1>
         {data.bio && <p className="text-sm md:text-base opacity-80 mb-8 max-w-xs leading-relaxed">{data.bio}</p>}
      </div>

      {/* Links List */}
      <div className="w-full max-w-md space-y-4 mb-12">
        {data.links.map((link) => (
            <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`block w-full p-4 rounded-xl font-bold text-center transition transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 ${getButtonClass(data.theme)}`}
            >
                {link.label} <ExternalLink size={16} className="opacity-60"/>
            </a>
        ))}
      </div>

      <Link href="/" className="mt-auto opacity-60 hover:opacity-100 transition flex items-center gap-1.5 text-xs font-bold tracking-widest">
        <Image src="/logo.svg" alt="singkat.in logo" width={20} height={20} />
        <span className="text-sm font-bold tracking-tight text-[#2d3748]">singkat<span className="text-[#0193ff]">.in</span></span>
      </Link>

    </div>
  );
}