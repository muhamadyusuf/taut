"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Pencil, Check } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Data link yang sedang diedit dilempar ke sini
  linkData: {
    _id: Id<"links">;
    originalUrl: string;
    title?: string;
    shortCode: string;
    // Kita butuh tahu kategori apa saja yang sudah dipilih sebelumnya
    // (Akan kita fetch di parent atau logic terpisah, 
    // tapi untuk simpel, kita biarkan user pilih ulang atau load default kosong dulu)
  } | null;
}

export default function EditLinkModal({ isOpen, onClose, linkData }: EditLinkModalProps) {
  const updateLink = useMutation(api.links.updateLink);
  const categories = useQuery(api.categories.getMyCategories);
  
  // State Form
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedCats, setSelectedCats] = useState<Id<"categories">[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // SAAT MODAL DIBUKA: Isi form dengan data lama
  useEffect(() => {
    if (isOpen && linkData) {
      setUrl(linkData.originalUrl);
      setTitle(linkData.title || "");
      setSlug(linkData.shortCode);
      // Catatan: Idealnya kita fetch kategori yang sudah nempel di link ini.
      // Untuk versi cepat, kita reset kategori (atau Anda perlu query tambahan getCategoriesByLinkId)
      setSelectedCats([]); 
    }
  }, [isOpen, linkData]);

  if (!isOpen || !linkData) return null;

  const toggleCategory = (catId: Id<"categories">) => {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter(id => id !== catId));
    } else {
      setSelectedCats([...selectedCats, catId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateLink({ 
        id: linkData._id, // ID KUNCI UTAMA
        originalUrl: url, 
        title: title || "Untitled Link", 
        customSlug: slug,
        categoryIds: selectedCats
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message.includes("already taken") 
        ? "Link custom ini sudah dipakai orang lain." 
        : "Terjadi kesalahan sistem.";
      setError("Link custom ini sudah dipakai orang lain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-[#f8faff]">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-full text-[#0193ff]">
                <Pencil size={20} />
             </div>
             <h3 className="font-bold text-lg text-[#2d3748]">Edit Link</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full"><X size={20}/></button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2">Destination URL</label>
            <input required type="url" value={url} onChange={e => setUrl(e.target.value)} 
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-[#0193ff] focus:ring-4 focus:ring-blue-500/10 transition text-sm text-[#2d3748]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2">Judul</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} 
              className="w-full p-4 border border-gray-200 rounded-xl focus:border-[#0193ff] focus:ring-4 focus:ring-blue-500/10 transition text-sm text-[#2d3748]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2">Update Kategori</label>
            <div className="flex flex-wrap gap-2">
                {categories?.map((cat) => (
                    <button key={cat._id} type="button" onClick={() => toggleCategory(cat._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1 ${selectedCats.includes(cat._id) ? "bg-[#0193ff] text-white border-[#0193ff]" : "bg-white text-gray-500 border-gray-200"}`}>
                        {selectedCats.includes(cat._id) && <Check size={12}/>} {cat.name}
                    </button>
                ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-2">*Pilih ulang kategori untuk link ini.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2">Custom Link</label>
            <div className="flex items-center border border-gray-200 rounded-xl bg-[#f8faff] focus-within:border-[#0193ff] focus-within:ring-4 focus-within:ring-blue-500/10">
              <span className="px-4 text-[#718096] text-sm font-medium">{typeof window !== 'undefined' ? window.location.host : '...'}/</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value.replace(/\s+/g, '-'))} 
                className="w-full p-4 bg-transparent focus:outline-none text-sm font-bold text-[#0193ff]"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm bg-red-50 p-4 rounded-xl">⚠️ {error}</div>}

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-50">
            <button type="button" onClick={onClose} className="px-6 py-3 text-[#718096] font-bold text-sm hover:bg-gray-100 rounded-full">Batal</button>
            <button disabled={loading} type="submit" className="bg-[#0193ff] hover:bg-[#007acc] text-white font-bold py-3 px-8 rounded-full shadow-lg transition active:scale-95 disabled:opacity-70">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}