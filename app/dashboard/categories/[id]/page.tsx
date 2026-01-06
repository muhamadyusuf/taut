"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Link as LinkIcon, ArrowLeft, Copy, BarChart2, Plus, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import CreateLinkModal from "../../_components/CreateLinkModal";
import { Id } from "@/convex/_generated/dataModel";

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.id as Id<"categories">;

  // Ambil semua kategori untuk mencari nama kategori saat ini (sebagai header)
  const categories = useQuery(api.categories.getMyCategories);
  const currentCategory = categories?.find(c => c._id === categoryId);

  // Ambil link di kategori ini
  const links = useQuery(api.links.getLinksByCategory, { categoryId });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Disalin!");
  };

  if (!categories) return <div className="p-8 text-center text-gray-500">Memuat Kategori...</div>;
  if (!currentCategory) return <div className="p-8 text-center text-red-500">Kategori tidak ditemukan.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <CreateLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialCategoryId={categoryId} // <-- FITUR UTAMA: Kirim ID kategori ke modal
      />

      {/* Header Halaman Detail */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <Link href="/dashboard/categories" className="text-sm text-gray-400 hover:text-[#0193ff] flex items-center gap-1 mb-2">
                <ArrowLeft size={16}/> Kembali ke Kategori
            </Link>
            <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                    <Tag size={24} />
                </div>
                <h1 className="text-2xl font-bold text-[#2d3748]">{currentCategory.name}</h1>
                <span className="bg-blue-50 text-[#0193ff] text-xs px-2 py-1 rounded-full font-bold">
                    {links?.length || 0} Link
                </span>
            </div>
        </div>

        {/* Tombol Buat Link KHUSUS di Kategori Ini */}
        <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-saweria flex items-center gap-2 pl-4 pr-6 py-3"
        >
            <div className="bg-white/20 p-1 rounded-full"><Plus size={18} strokeWidth={3} /></div>
            <span>Tambah Link di Sini</span>
        </button>
      </div>

      {/* List Link (Copy paste style dari halaman Links, disederhanakan) */}
      {!links || links.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-[30px] bg-white/50">
            <p className="text-gray-500 font-medium">Belum ada link di kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
            {links.map((link) => (
                <div key={link._id} className="card-saweria p-5 flex flex-col md:flex-row gap-4 items-center">
                    <div className="bg-blue-50 p-3 rounded-full text-[#0193ff]">
                        <LinkIcon size={20}/>
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                        <h3 className="font-bold text-[#2d3748] truncate">{link.title || "Untitled"}</h3>
                        <div className="flex items-center gap-2 text-sm">
                            <a href={`${window.location.origin}/${link.shortCode}`} target="_blank" className="text-[#0193ff] font-bold hover:underline truncate">
                                /{link.shortCode}
                            </a>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-400 truncate max-w-[150px]">{link.originalUrl}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 w-full md:w-auto justify-between md:justify-end">
                         <span className="flex items-center gap-1"><BarChart2 size={14}/> {link.clicks}</span>
                         <span className="flex items-center gap-1"><Calendar size={14}/> {format(link.createdAt, 'd MMM', { locale: localeId })}</span>
                         <button onClick={() => copyToClipboard(`${window.location.origin}/${link.shortCode}`)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition">
                            <Copy size={14}/>
                         </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}