"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Link as LinkIcon, Check } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string; // Prop Opsiional
}

// Update komponen
export default function CreateLinkModal({ isOpen, onClose, initialCategoryId }: CreateLinkModalProps) {
  const createLink = useMutation(api.links.createLink);
  
  // Ambil data kategori untuk ditampilkan
  const categories = useQuery(api.categories.getMyCategories);
  
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  
  // State baru untuk menyimpan BANYAK kategori
  const [selectedCats, setSelectedCats] = useState<Id<"categories">[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // Gunakan useEffect untuk set kategori awal saat modal dibuka
  useEffect(() => {
    if (isOpen && initialCategoryId) {
      // @ts-expect-error - Memaksa string ke Id convex (aman di sisi client asal valid)
      setSelectedCats([initialCategoryId]); 
    } else if (isOpen && !initialCategoryId) {
      setSelectedCats([]); // Reset jika tidak ada initial
    }
  }, [isOpen, initialCategoryId]);

  if (!isOpen) return null;

  // Fungsi Toggle Kategori (Pilih/Hapus Pilihan)
  const toggleCategory = (catId: Id<"categories">) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(id => id !== catId)); // Hapus jika sudah ada
    } else {
      setSelectedCats([...selectedCats, catId]); // Tambah jika belum ada
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createLink({ 
        originalUrl: url, 
        title: title || "Untitled Link", 
        customSlug: slug,
        categoryIds: selectedCats // Kirim array kategori
      });
      
      // Reset form
      setUrl(""); setTitle(""); setSlug(""); setSelectedCats([]);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message.includes("already taken") 
        ? "Link custom ini sudah dipakai orang lain." 
        : "Terjadi kesalahan sistem.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-[#f8faff] flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-full text-[#0193ff]">
                <LinkIcon size={20} />
             </div>
             <h3 className="font-bold text-lg text-[#2d3748]">Buat Link Baru</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition">
            <X size={20}/>
          </button>
        </div>

        {/* Form Body - Scrollable jika konten panjang */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          {/* Destination URL */}
          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2 tracking-wide">Destination URL <span className="text-red-500">*</span></label>
            <input required type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} 
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0193ff] focus:ring-4 focus:ring-blue-500/10 transition text-sm text-[#2d3748]"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2 tracking-wide">Judul (Opsional)</label>
            <input type="text" placeholder="Misal: Promo Januari" value={title} onChange={e => setTitle(e.target.value)} 
              className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0193ff] focus:ring-4 focus:ring-blue-500/10 transition text-sm text-[#2d3748]"
            />
          </div>

          {/* KATEGORI MULTI SELECT */}
          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2 tracking-wide">Kategori (Bisa pilih &gt; 1)</label>
            
            {(!categories || categories.length === 0) ? (
                <p className="text-sm text-gray-400 italic">Belum ada kategori. Buat di menu Kategori.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCats.includes(cat._id);
                        return (
                            <button
                                key={cat._id}
                                type="button"
                                onClick={() => toggleCategory(cat._id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
                                    isSelected 
                                    ? "bg-[#0193ff] text-white border-[#0193ff] shadow-md shadow-blue-200" 
                                    : "bg-white text-[#718096] border-gray-200 hover:border-[#0193ff] hover:text-[#0193ff]"
                                }`}
                            >
                                {isSelected && <Check size={14} strokeWidth={3} />}
                                {cat.name}
                            </button>
                        )
                    })}
                </div>
            )}
          </div>

          {/* Custom Slug */}
          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2 tracking-wide">Custom Link (Opsional)</label>
            <div className="flex items-center border border-gray-200 rounded-xl bg-[#f8faff] focus-within:border-[#0193ff] focus-within:ring-4 focus-within:ring-blue-500/10 transition overflow-hidden">
              <span className="px-4 text-[#718096] text-sm border-r border-gray-200 h-full py-4 font-medium">
                {typeof window !== 'undefined' ? window.location.host : '...'}/
              </span>
              <input type="text" placeholder="nama-unik" value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-'))} 
                className="w-full p-4 bg-transparent focus:outline-none text-sm font-bold text-[#0193ff]"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">⚠️ {error}</div>}

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-50 mt-2">
            <button type="button" onClick={onClose} className="px-6 py-3 text-[#718096] font-bold text-sm hover:bg-gray-100 rounded-full transition">Batal</button>
            <button disabled={loading} type="submit" className="bg-[#0193ff] hover:bg-[#007acc] text-white font-bold py-3 px-8 rounded-full shadow-[0_4px_14px_0_rgba(1,147,255,0.39)] hover:shadow-[0_6px_20px_rgba(1,147,255,0.23)] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? "Memproses..." : "Buat Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}