"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Save } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ProductFormProps {
  initialData?: {
    _id: Id<"products">;
    title: string;
    description: string;
    price: number;
    stock: number;
    fileUrl?: string;
  };
  mode: "create" | "edit";
}

export default function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter();
  const createProduct = useMutation(api.shop.createProduct);
  const updateProduct = useMutation(api.shop.updateProduct);
  const deleteProduct = useMutation(api.shop.deleteProduct);

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const payload = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
        fileUrl: (formData.get("fileUrl") as string) || undefined,
    };

    try {
        if (mode === "create") {
            await createProduct(payload);
            alert("Produk berhasil dibuat!");
        } else if (mode === "edit" && initialData) {
            await updateProduct({
                id: initialData._id,
                ...payload
            });
            alert("Produk berhasil diperbarui!");
        }
        router.push("/dashboard/shop");
        router.refresh();
    } catch (err) {
        alert("Gagal menyimpan produk.");
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !confirm("Yakin ingin menghapus produk ini? Tindakan ini tidak bisa dibatalkan.")) return;
    
    setIsDeleting(true);
    try {
        await deleteProduct({ id: initialData._id });
        router.push("/dashboard/shop");
        router.refresh();
    } catch (err) {
        alert("Gagal menghapus produk");
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">
                {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
            </h2>
            {mode === "edit" && (
                <button 
                    type="button" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition"
                    title="Hapus Produk"
                >
                    {isDeleting ? <Loader2 className="animate-spin" size={20}/> : <Trash2 size={20}/>}
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAMA PRODUK */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
                <input 
                    name="title" 
                    defaultValue={initialData?.title}
                    required 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Contoh: Ebook Belajar Coding" 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {/* HARGA */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Harga (Rp)</label>
                    <input 
                        name="price" 
                        defaultValue={initialData?.price}
                        required 
                        type="number" 
                        min="1000" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="100000" 
                    />
                </div>
                {/* STOK / KUANTITI */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stok Barang</label>
                    <input 
                        name="stock" 
                        defaultValue={initialData?.stock ?? 1}
                        required 
                        type="number" 
                        min="0" 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Jumlah stok" 
                    />
                </div>
            </div>

            {/* DESKRIPSI */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                <textarea 
                    name="description" 
                    defaultValue={initialData?.description}
                    required 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Jelaskan isi produk Anda..." 
                />
            </div>

            {/* LINK FILE */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link File / Konten (Opsional)</label>
                <input 
                    name="fileUrl" 
                    defaultValue={initialData?.fileUrl}
                    type="url" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://drive.google.com/..." 
                />
                <p className="text-xs text-gray-500 mt-1">Link ini akan diberikan ke pembeli setelah pembayaran sukses.</p>
            </div>

            {/* TOMBOL SIMPAN */}
            <div className="pt-4">
                <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30 transition active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> Simpan Produk</>}
                </button>
            </div>
        </form>
    </div>
  );
}