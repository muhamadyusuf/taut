"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { id } from "date-fns/locale"; // Import locale Indonesia
import { Link as LinkIcon, Copy, ExternalLink, Calendar, BarChart2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import EditLinkModal from "../_components/EditLinkModal";
import { useState } from "react";

export default function LinksPage() {
  const links = useQuery(api.links.getMyLinks);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingLink, setEditingLink] = useState<any>(null);
  const deleteLink = useMutation(api.links.deleteLink)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Di sini sebaiknya pakai Toast/Snackbar notification agar lebih elegan dari alert()
    alert("Link berhasil disalin! 🎉");
  };

  // Fungsi konfirmasi hapus
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDelete = async (id: any) => {
    if (confirm("Apakah Anda yakin ingin menghapus link ini? Tindakan ini tidak bisa dibatalkan.")) {
      try {
        await deleteLink({ id });
        // Toast sukses bisa ditambahkan di sini
      } catch (error) {
        alert("Gagal menghapus link.");
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto">

      <EditLinkModal 
        isOpen={!!editingLink} // Modal buka jika ada link di state
        onClose={() => setEditingLink(null)} // Tutup modal = kosongkan state
        linkData={editingLink}
      />
      
      {!links || links.length === 0 ? (
        <div className="text-center py-24 card-saweria flex flex-col items-center">
            <div className="bg-blue-50 p-6 rounded-full mb-6">
                <LinkIcon size={48} className="text-[#0193ff] opacity-50"/>
            </div>
            <h3 className="text-xl font-bold text-[#2d3748] mb-2">Belum ada link</h3>
            <p className="text-[#718096] mb-6">Yuk, buat link pendek pertamamu sekarang!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
        {links.slice().reverse().map((link) => (
            // CARD SAWERIA STYLE
            <div key={link._id} className="card-saweria p-6 sm:p-8 flex flex-col sm:flex-row gap-6 group relative overflow-hidden">
                
                {/* Dekorasi Latar Belakang Halus */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-blue-50 w-24 h-24 rounded-full opacity-50 transition-transform group-hover:scale-150 duration-500"></div>

                {/* Ikon Kiri */}
                <div className="hidden sm:flex flex-col items-center justify-center">
                    <div className="p-4 rounded-[18px] bg-blue-50 text-[#0193ff] shadow-sm group-hover:shadow-md transition-all group-hover:bg-[#0193ff] group-hover:text-white">
                        <LinkIcon size={28}/>
                    </div>
                </div>

                {/* Konten Tengah */}
                <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex flex-col gap-1 mb-3">
                        <h3 className="font-bold text-xl text-[#2d3748] truncate">{link.title || "Link Tanpa Judul"}</h3>
                    </div>
                    
                    {/* Link Pendek (Hero) */}
                    <div className="mb-4">
                         <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`} target="_blank" className="text-[#0193ff] font-bold text-2xl hover:underline flex items-center gap-2 truncate tracking-tight">
                            <span className="text-[#718096] font-normal text-base opacity-60">{process.env.NEXT_PUBLIC_BASE_URL}/</span>
                            {link.shortCode}
                        </a>
                    </div>

                    {/* Link Asli */}
                    <div className="flex items-center gap-2 bg-[#f8faff] p-3 rounded-xl border border-gray-100/50 max-w-md">
                        <ExternalLink size={14} className="text-[#718096] flex-shrink-0"/>
                        <a href={link.originalUrl} target="_blank" className="text-[#718096] text-sm hover:text-[#0193ff] truncate transition-colors font-medium">
                            {link.originalUrl}
                        </a>
                    </div>
                </div>

                {/* Bagian Kanan: Statistik & Aksi */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 relative z-10 border-t sm:border-t-0 border-gray-100 pt-4 sm:pt-0">
                    {/* Statistik Klik */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 bg-blue-50 px-4 py-2 rounded-full text-[#0193ff] font-bold mb-1">
                             <BarChart2 size={18}/>
                             <span className="text-lg">{link.clicks}</span> Klik
                        </div>
                        <span className="flex items-center gap-1 text-xs text-[#718096] font-medium bg-gray-100 px-2 py-1 rounded-md">
                            <Calendar size={12}/> {format(link.createdAt || new Date(), 'd MMM yyyy', { locale: id })}
                        </span>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* TOMBOL EDIT BARU */}
                        <button 
                            onClick={() => setEditingLink(link)} // Set link ini ke state
                            className="p-2.5 bg-gray-100 hover:bg-yellow-50 text-gray-500 hover:text-yellow-600 rounded-full transition-colors"
                            title="Edit Link"
                        >
                            <Pencil size={18} />
                        </button>

                        <button 
                            onClick={() => handleDelete(link._id)}
                            className="p-2.5 bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-full transition-colors"
                            title="Hapus Link"
                        >
                            <Trash2 size={18} />
                        </button>
                        
                        {/* Tombol Copy */}
                        <button 
                            onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_BASE_URL}/${link.shortCode}`)} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-[#0193ff] text-[#0193ff] rounded-full text-sm font-bold hover:bg-[#0193ff] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                        >
                            <Copy size={16}/> Salin Link
                        </button>
                    </div>
                </div>
            </div>
        ))}
        </div>
      )}
    </div>
  );
}