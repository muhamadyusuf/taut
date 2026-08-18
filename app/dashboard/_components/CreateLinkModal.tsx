"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Link as LinkIcon, Check } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { errorMessage } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string; // Prop Opsional
}

export default function CreateLinkModal({ isOpen, onClose, initialCategoryId }: CreateLinkModalProps) {
  const createLink = useMutation(api.links.createLink);
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.createLinkModal;

  // Ambil data kategori untuk ditampilkan
  const categories = useQuery(api.categories.getMyCategories);

  // Subdomain yang dimiliki pengguna; kosong berarti hanya domain utama.
  const subdomainData = useQuery(api.subdomains.getMine);
  const domainData = useQuery(api.domains.getMine);

  // Subdomain dan domain sendiri sama-sama berperan sebagai ruang nama, jadi
  // keduanya muncul dalam satu daftar pilihan alamat.
  const addressOptions = [
    ...(subdomainData?.subdomains ?? []).map((row) => ({
      value: row.subdomain,
      label: `${row.subdomain}.singkat.in`,
    })),
    ...(domainData?.domains ?? [])
      .filter((row) => row.status === "active")
      .map((row) => ({ value: row.domain, label: row.domain })),
  ];

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subdomain, setSubdomain] = useState("");

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
        categoryIds: selectedCats, // Kirim array kategori
        subdomain: subdomain || undefined,
      });

      // Reset form
      setUrl(""); setTitle(""); setSlug(""); setSelectedCats([]); setSubdomain("");
      onClose();
    } catch (err: unknown) {
      // Pesan aslinya ditampilkan apa adanya. Sebelumnya semua kegagalan
      // diringkas jadi "Terjadi kesalahan sistem", sehingga penolakan yang
      // sebenarnya bisa ditindaklanjuti — URL tidak sah, slug terpakai, batas
      // laju terlampaui — sama-sama terlihat seperti aplikasi yang rusak.
      setError(errorMessage(err, t.genericError));
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
            <h3 className="font-bold text-lg text-foreground">{t.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-border p-2 rounded-full transition"
            aria-label={t.close}
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
            <label className="form-label">{t.titleLabel}</label>
            <input
              type="text"
              placeholder={t.titlePlaceholder}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          {/* KATEGORI MULTI SELECT */}
          <div>
            <label className="form-label">{t.categoryLabel}</label>

            {(!categories || categories.length === 0) ? (
              <p className="text-sm text-subtle italic">{t.noCategory}</p>
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

          {/* Pemilih alamat — hanya tampil kalau pengguna punya subdomain */}
          {addressOptions.length > 0 && (
            <div>
              <label className="form-label">{t.addressLabel}</label>
              <select
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                className="input-field w-full"
              >
                <option value="">{t.mainDomainOption}</option>
                {addressOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Slug */}
          <div>
            <label className="form-label">{t.customLinkLabel}</label>
            <div className="flex items-center border border-border rounded-xl bg-input focus-within:border-brand focus-within:ring-4 focus-within:ring-ring transition overflow-hidden">
              <span className="px-4 text-muted-foreground text-sm border-r border-border py-4 font-medium whitespace-nowrap">
                {subdomain ? `${addressOptions.find((o) => o.value === subdomain)?.label ?? subdomain}/` : `${process.env.NEXT_PUBLIC_APP_URL}/`}
              </span>
              <input
                type="text"
                placeholder={t.customLinkPlaceholder}
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
              {t.cancel}
            </button>
            <button disabled={loading} type="submit" className="btn-saweria py-3 px-8 font-bold">
              {loading ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
