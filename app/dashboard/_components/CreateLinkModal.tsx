"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Link as LinkIcon, Check } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string; // Prop Opsional
}

export default function CreateLinkModal({ isOpen, onClose, initialCategoryId }: CreateLinkModalProps) {
  const createLink = useMutation(api.links.createLink);

  // Ambil data kategori untuk ditampilkan
  const categories = useQuery(api.categories.getMyCategories);

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  // State untuk menyimpan BANYAK kategori
  const [selectedCats, setSelectedCats] = useState<Id<"categories">[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Set kategori awal saat modal dibuka
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
      console.log(err);
      setError(
        err instanceof Error && err.message.includes("already taken")
          ? "Link custom ini sudah dipakai orang lain."
          : "Terjadi kesalahan sistem."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay)] backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-card border border-border w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-muted flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-brand-soft p-2 rounded-full text-brand">
              <LinkIcon size={20} />
            </div>
            <h3 className="font-bold text-lg text-foreground">Buat Link Baru</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-border p-2 rounded-full transition"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable jika konten panjang */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          {/* Destination URL */}
          <div>
            <label className="form-label">
              Destination URL <span className="text-danger">*</span>
            </label>
            <input
              required
              type="url"
              placeholder="https://..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Title */}
          <div>
            <label className="form-label">Judul (Opsional)</label>
            <input
              type="text"
              placeholder="Misal: Promo Januari"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          {/* KATEGORI MULTI SELECT */}
          <div>
            <label className="form-label">Kategori (Bisa pilih &gt; 1)</label>

            {(!categories || categories.length === 0) ? (
              <p className="text-sm text-subtle italic">Belum ada kategori. Buat di menu Kategori.</p>
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
                          ? "bg-brand text-brand-contrast border-brand shadow-[var(--shadow-brand)]"
                          : "bg-card text-muted-foreground border-border hover:border-brand hover:text-brand"
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Custom Slug */}
          <div>
            <label className="form-label">Custom Link (Opsional)</label>
            <div className="flex items-center border border-border rounded-xl bg-input focus-within:border-brand focus-within:ring-4 focus-within:ring-ring transition overflow-hidden">
              <span className="px-4 text-muted-foreground text-sm border-r border-border py-4 font-medium whitespace-nowrap">
                {process.env.NEXT_PUBLIC_APP_URL}/
              </span>
              <input
                type="text"
                placeholder="nama-unik"
                value={slug}
                onChange={e => setSlug(e.target.value.replace(/\s+/g, '-'))}
                className="w-full p-4 bg-transparent focus:outline-none text-sm font-bold text-brand"
              />
            </div>
          </div>

          {error && (
            <div className="text-danger text-sm bg-danger-soft p-4 rounded-xl border border-danger/25">
              ⚠️ {error}
            </div>
          )}

          <div className="pt-4 flex gap-3 justify-end border-t border-border mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-muted-foreground font-bold text-sm hover:bg-muted hover:text-foreground rounded-full transition"
            >
              Batal
            </button>
            <button disabled={loading} type="submit" className="btn-saweria py-3 px-8 font-bold">
              {loading ? "Memproses..." : "Buat Link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
