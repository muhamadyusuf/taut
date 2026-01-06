"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GenericId } from "convex/values";
import { FolderPlus, Trash2, Tag, Layers, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.getMyCategories);
  const createCategory = useMutation(api.categories.createCategory);
  const deleteCategory = useMutation(api.categories.deleteCategory);

  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (confirm("Yakin ingin menghapus kategori ini?")) {
        await deleteCategory({ id: categoryId });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories?.map((cat) => (
            // Bungkus dengan Link
            <Link key={cat._id} href={`/dashboard/categories/${cat._id}`} className="block">
                <div className="card-saweria p-6 group hover:border-[#0193ff] transition-all cursor-pointer h-full relative">
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-yellow-50 text-yellow-600 p-2 rounded-lg group-hover:bg-[#0193ff] group-hover:text-white transition-colors">
                            <Tag size={20} />
                        </div>
                        <button 
                            // stopPropagation agar saat hapus tidak masuk ke halaman detail
                            onClick={(e) => { e.preventDefault(); handleDelete(cat._id); }}
                            className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition z-10"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-bold text-[#2d3748] mb-1 truncate group-hover:text-[#0193ff] transition-colors">{cat.name}</h3>
                    <p className="text-xs text-[#718096]">
                        Dibuat: {format(cat.createdAt, 'd MMM yyyy', { locale: id })}
                    </p>

                    {/* Indikator "Buka Folder" */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#0193ff] text-xs font-bold flex items-center gap-1">
                        Buka <ArrowRight size={12}/>
                    </div>
                </div>
            </Link>
        ))}
    </div>
  );
}