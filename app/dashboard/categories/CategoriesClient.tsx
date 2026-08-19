"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GenericId } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";
import { FolderPlus, Trash2, Tag, Layers, ArrowRight, Pencil } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import EditCategoryModal from "../_components/EditCategoryModal";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocale } from "@/lib/i18n/dateLocale";

export default function CategoriesPage() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.categories;
  const categories = useQuery(api.categories.getMyCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);

  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ _id: Id<"categories">; name: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      await createCategory({ name: newCatName });
      setNewCatName("");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId: GenericId<"categories">) => {
    if (confirm(t.deleteConfirm)) {
      await deleteCategory({ id: categoryId });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <EditCategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        category={editingCategory}
      />

      {/* --- FORM INPUT ATAS --- */}
      <div className="card-saweria p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-brand-soft p-3 rounded-2xl text-brand">
            <Layers size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex w-full md:w-auto gap-3">
          <input
            type="text"
            placeholder={t.newPlaceholder}
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="input-field flex-1 md:w-64"
            required
          />
          <button
            disabled={loading}
            type="submit"
            className="btn-saweria rounded-xl px-6 py-3 shrink-0"
            aria-label={t.addAria}
          >
            {loading ? "..." : <FolderPlus size={20} />}
          </button>
        </form>
      </div>

      {/* --- LIST KATEGORI --- */}
      {!categories || categories.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-[30px] bg-card/50">
          <Tag size={48} className="mx-auto text-subtle mb-4" />
          <p className="text-muted-foreground font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories?.map((cat) => (
            <Link key={cat._id} href={`/dashboard/categories/${cat._id}`} className="block">
              <div className="card-saweria p-6 group hover:border-brand transition-all cursor-pointer h-full relative">

                <div className="flex justify-between items-start mb-4">
                  <div className="bg-warning-soft text-warning p-2 rounded-lg group-hover:bg-brand group-hover:text-brand-contrast transition-colors">
                    <Tag size={20} />
                  </div>

                  {/* Wrapper Tombol Aksi */}
                  <div className="flex gap-1 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingCategory(cat);
                      }}
                      className="text-subtle hover:text-warning p-2 rounded-full hover:bg-warning-soft transition"
                      title={t.editTitle}
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(cat._id);
                      }}
                      className="text-subtle hover:text-danger p-2 rounded-full hover:bg-danger-soft transition"
                      title={t.deleteTitle}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-1 truncate group-hover:text-brand transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t.createdPrefix}: {format(cat.createdAt, "d MMM yyyy", { locale: dateLocale(locale) })}
                </p>

                {/* Indikator "Buka Folder" */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-brand text-xs font-bold flex items-center gap-1">
                  {t.open} <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
