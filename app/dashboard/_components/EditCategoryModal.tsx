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
    } catch {
      alert("Gagal mengupdate kategori");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay)] backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-card border border-border w-full max-w-md rounded-[24px] shadow-2xl p-6 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Pencil size={18} className="text-brand" /> Edit Kategori
          </h3>
          <button onClick={onClose} aria-label="Tutup">
            <X className="text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Nama Kategori</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground font-bold text-sm hover:bg-muted hover:text-foreground rounded-lg transition"
            >
              Batal
            </button>
            <button disabled={loading} type="submit" className="btn-saweria rounded-lg py-2 px-6">
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
