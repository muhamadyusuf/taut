"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { Link as LinkIcon, ArrowLeft, Copy, BarChart2, Plus, Calendar, Tag, Trash2 } from "lucide-react";
import Link from "next/link";
import CreateLinkModal from "../../_components/CreateLinkModal";
import { Id } from "@/convex/_generated/dataModel";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocale } from "@/lib/i18n/dateLocale";

export default function CategoryDetailPage() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.categoryDetail;
  const params = useParams();
  const categoryId = params.id as Id<"categories">;

  const deleteLink = useMutation(api.links.deleteLink);

  // Ambil semua kategori untuk mencari nama kategori saat ini (sebagai header)
  const categories = useQuery(api.categories.getMyCategories);
  const currentCategory = categories?.find(c => c._id === categoryId);

  // Ambil link di kategori ini
  const links = useQuery(api.links.getLinksByCategory, { categoryId });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(t.copied);
  };

  const handleDeleteLink = async (id: Id<"links">) => {
    if (confirm(t.deleteConfirm)) {
      await deleteLink({ id });
    }
  };

  if (!categories) return <div className="p-8 text-center text-muted-foreground">{t.loading}</div>;
  if (!currentCategory) return <div className="p-8 text-center text-danger">{t.notFound}</div>;

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
          <Link
            href="/dashboard/categories"
            className="text-sm text-muted-foreground hover:text-brand flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft size={16} /> {t.back}
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-warning-soft p-2 rounded-lg text-warning">
              <Tag size={24} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{currentCategory.name}</h1>
            <span className="bg-brand-soft text-brand-soft-fg text-xs px-2 py-1 rounded-full font-bold">
              {links?.length || 0} {t.linkCountSuffix}
            </span>
          </div>
        </div>

        {/* Tombol Buat Link KHUSUS di Kategori Ini */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-saweria flex items-center gap-2 pl-4 pr-6 py-3"
        >
          <div className="bg-white/20 p-1 rounded-full"><Plus size={18} strokeWidth={3} /></div>
          <span>{t.addLink}</span>
        </button>
      </div>

      {/* List Link */}
      {!links || links.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-[30px] bg-card/50">
          <p className="text-muted-foreground font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {links.map((link) => (
            <div key={link._id} className="card-saweria p-5 flex flex-col md:flex-row gap-4 items-center">
              <div className="bg-brand-soft p-3 rounded-full text-brand">
                <LinkIcon size={20} />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <h3 className="font-bold text-foreground truncate">{link.title || t.untitled}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/${link.shortCode}`}
                    target="_blank"
                    className="text-brand font-bold hover:underline truncate"
                  >
                    /{link.shortCode}
                  </a>
                  <span className="text-subtle">|</span>
                  <span className="text-muted-foreground truncate max-w-[150px]">{link.originalUrl}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground w-full md:w-auto justify-between md:justify-end">
                <span className="flex items-center gap-1"><BarChart2 size={14} /> {link.clicks}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {format(link.createdAt, "d MMM", { locale: dateLocale(locale) })}</span>
                <button
                  onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/${link.shortCode}`)}
                  className="bg-muted hover:bg-brand-soft p-2 rounded-full text-muted-foreground hover:text-brand transition"
                  title={t.copyTitle}
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleDeleteLink(link._id)}
                  className="text-subtle hover:text-danger hover:bg-danger-soft p-2 rounded-full transition"
                  title={t.deleteTitle}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
