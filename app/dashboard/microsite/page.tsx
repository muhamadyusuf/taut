"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Smartphone, ExternalLink, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function MicrositeListPage() {
  const microsites = useQuery(api.microsites.getMyMicrosites);
  const createMicrosite = useMutation(api.microsites.createMicrosite);
  const deleteMicrosite = useMutation(api.microsites.deleteMicrosite);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const slug = prompt("Masukkan URL Bio yang diinginkan (contoh: andri-bisnis):");
    if (!slug) return;
    setIsCreating(true);
    try {
        const id = await createMicrosite({ slug, title: "Halaman Baru" });
        router.push(`/dashboard/microsite/${id}`); // Redirect ke Editor
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan";
        alert("Gagal: " + errorMessage);
    } finally {
        setIsCreating(false);
    }
  };

  const handleDelete = async (id: Id<"microsites">, title: string) => {
    if (confirm(`Yakin ingin menghapus halaman "${title}" selamanya?`)) {
      try {
        await deleteMicrosite({ id });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Terjadi kesalahan";
        alert("Gagal menghapus: " + errorMessage);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#2d3748]">Bio Link Saya</h1>
        <button onClick={handleCreate} disabled={isCreating} className="bg-[#0193ff] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#007acc]">
            <Plus size={18}/> {isCreating ? "Membuat..." : "Buat Baru"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {microsites?.map((site) => (
            <div key={site._id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition group relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-full text-[#0193ff]">
                            <Smartphone size={24}/>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg truncate max-w-[120px]">{site.title}</h3>
                            <p className="text-xs text-gray-500 truncate max-w-[120px]">/{site.slug}</p>
                        </div>
                    </div>
                    
                    {/* TOMBOL HAPUS POJOK KANAN ATAS */}
                    <button 
                        onClick={() => handleDelete(site._id, site.title)}
                        className="text-gray-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition"
                        title="Hapus Halaman"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
                
                <div className="flex gap-2 mt-4">
                    <Link href={`/dashboard/microsite/${site._id}`} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                        <Edit size={14}/> Edit
                    </Link>
                    <a href={`/bio/${site.slug}`} target="_blank" className="flex-1 border border-gray-200 hover:border-[#0193ff] hover:text-[#0193ff] py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                         Lihat <ExternalLink size={14}/>
                    </a>
                </div>
            </div>
        ))}
        
        {/* Empty State */}
        {microsites?.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
                <p className="text-gray-400 mb-4">Belum ada Bio Link</p>
                <button onClick={handleCreate} className="text-[#0193ff] font-bold hover:underline">Buat yang pertama</button>
            </div>
        )}
      </div>
    </div>
  );
}