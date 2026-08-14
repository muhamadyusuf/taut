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
        className="bg-card border border-border w-full max-w-lg rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-border flex justify-between items-center bg-muted">
          <div className="flex items-center gap-3">
            <div className="bg-brand-soft p-2 rounded-full text-brand">
              <Pencil size={20} />
            </div>
            <h3 className="font-bold text-lg text-foreground">Edit Link</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-border p-2 rounded-full transition"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
          <div>
            <label className="form-label">Destination URL</label>
            <input
              required
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Judul</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="form-label">Update Kategori</label>
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => toggleCategory(cat._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1 ${
                    selectedCats.includes(cat._id)
                      ? "bg-brand text-brand-contrast border-brand"
                      : "bg-card text-muted-foreground border-border hover:border-brand hover:text-brand"
                  }`}
                >
                  {selectedCats.includes(cat._id) && <Check size={12} />} {cat.name}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-subtle mt-2">*Pilih ulang kategori untuk link ini.</p>
          </div>

          <div>
            <label className="form-label">Custom Link</label>
            <div className="flex items-center border border-border rounded-xl bg-input focus-within:border-brand focus-within:ring-4 focus-within:ring-ring transition overflow-hidden">
              <span className="px-4 text-muted-foreground text-sm border-r border-border py-4 font-medium whitespace-nowrap">
                {process.env.NEXT_PUBLIC_APP_URL}/
              </span>
              <input
                type="text"
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

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-muted-foreground font-bold text-sm hover:bg-muted hover:text-foreground rounded-full transition"
            >
              Batal
            </button>
            <button disabled={loading} type="submit" className="btn-saweria py-3 px-8 font-bold">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
