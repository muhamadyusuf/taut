"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Pencil } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: { _id: Id<"categories">; name: string } | null;
}

export default function EditCategoryModal({ isOpen, onClose, category }: EditCategoryModalProps) {
  const updateCategory = useMutation(api.categories.updateCategory);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Isi form saat modal dibuka
  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    
    setLoading(true);
    try {
      await updateCategory({ id: category._id, name: name });
      onClose();
    } catch (err) {
      alert("Gagal mengupdate kategori");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl p-6 animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-[#2d3748] flex items-center gap-2">
            <Pencil size={18} className="text-[#0193ff]"/> Edit Kategori
          </h3>
          <button onClick={onClose}><X className="text-gray-400 hover:text-gray-600"/></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#718096] uppercase mb-2">Nama Kategori</label>
            <input 
              autoFocus
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:border-[#0193ff] focus:ring-4 focus:ring-blue-500/10 transition"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-lg">Batal</button>
             <button disabled={loading} type="submit" className="bg-[#0193ff] hover:bg-[#007acc] text-white font-bold py-2 px-6 rounded-lg shadow-md disabled:opacity-70">
                {loading ? "Menyimpan..." : "Simpan"}
             </button>
          </div>
        </form>

      </div>
    </div>
  );
}