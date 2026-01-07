"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { GenericId } from "convex/values";
import { Id } from "@/convex/_generated/dataModel";
import { FolderPlus, Trash2, Tag, Layers, ArrowRight, Pencil } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

import EditCategoryModal from "../_components/EditCategoryModal"; 

export default function CategoriesPage() {
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
    if (confirm("Yakin ingin menghapus kategori ini?")) {
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
                <div className="bg-blue-50 p-3 rounded-2xl text-[#0193ff]">
                    <Layers size={28} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#2d3748]">Kelola Kategori</h2>
                    <p className="text-[#718096] text-sm">Organisir tautanmu agar lebih rapi.</p>
                </div>
            </div>

            <form onSubmit={handleCreate} className="flex w-full md:w-auto gap-3">
                <input 
                    type="text" 
                    placeholder="Nama Kategori Baru..." 
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 md:w-64 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0193ff] focus:ring-4 focus:ring-blue-500/10 transition"
                    required
                />
                <button 
                    disabled={loading}
                    type="submit"
                    className="bg-[#0193ff] hover:bg-[#007acc] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-95 disabled:opacity-70"
                >
                    {loading ? "..." : <FolderPlus size={20} />}
                </button>
            </form>
        </div>

        {/* --- LIST KATEGORI --- */}
        {!categories || categories.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-[30px] bg-white/50">
                <Tag size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">Belum ada kategori.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {categories?.map((cat) => (
                    // Bungkus dengan Link
                    <Link key={cat._id} href={`/dashboard/categories/${cat._id}`} className="block">
                        <div className="card-saweria p-6 group hover:border-[#0193ff] transition-all cursor-pointer h-full relative">
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-yellow-50 text-yellow-600 p-2 rounded-lg group-hover:bg-[#0193ff] group-hover:text-white transition-colors">
                                    <Tag size={20} />
                                </div>
                                {/* Wrapper Tombol Aksi */}
                            <div className="flex gap-1 z-10">
                                
                                {/* --- TOMBOL EDIT --- */}
                                <button 
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation();
                                        setEditingCategory(cat); 
                                    }}
                                    className="text-gray-300 hover:text-yellow-600 p-2 rounded-full hover:bg-yellow-50 transition"
                                    title="Edit Nama"
                                >
                                    <Pencil size={18} />
                                </button>

                                {/* Tombol Hapus (Yang sudah ada) */}
                                <button 
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation();
                                        handleDelete(cat._id); 
                                    }}
                                    className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
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
        )}
    </div>
  );
}