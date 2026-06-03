"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Save } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import DrivePicker from "../../microsite/_components/DrivePicker";

interface ProductFormProps {
  initialData?: {
    _id: Id<"products">;
    title: string;
    description: string;
    price: number;
    stock: number;
    imageUrl?: string;
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
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [fileUrl, setFileUrl] = useState(initialData?.fileUrl ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Validate stock is non-negative integer
    const stockVal = Number(formData.get("stock"));
    if (!Number.isInteger(stockVal) || stockVal < 0) {
        alert("Stok harus berupa angka bulat non-negatif.");
        setLoading(false);
        return;
    }

    // Validate price
    const priceVal = Number(formData.get("price"));
    if (priceVal < 1000) {
        alert("Harga minimum adalah Rp 1.000.");
        setLoading(false);
        return;
    }
    
    const payload = {
        title: (formData.get("title") as string).trim(),
        description: (formData.get("description") as string).trim(),
        price: priceVal,
        stock: stockVal,
        imageUrl: imageUrl || undefined,
        fileUrl: fileUrl || undefined,
    };

    try {
        if (mode === "create") {
            await createProduct(payload);
            alert("Produk berhasil dibuat!");
        } else if (mode === "edit" && initialData) {
            await updateProduct({ id: initialData._id, ...payload });
            alert("Produk berhasil diperbarui!");
        }
        router.push("/dashboard/shop");
        router.refresh();
    } catch (err) {
        const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui";
        alert("Gagal menyimpan produk: " + message);
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
        const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui";
        alert("Gagal menghapus produk: " + message);
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
                    className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200 hover:border-red-300 transition"
                    title="Hapus Produk"
                >
                    {isDeleting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                    Hapus Produk
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
                {/* STOK */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stok Barang</label>
                    <input 
                        name="stock" 
                        defaultValue={initialData?.stock ?? 1}
                        required 
                        type="number" 
                        min="0" 
                        step="1"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Jumlah stok" 
                    />
                    <p className="text-xs text-gray-400 mt-1">Stok akan otomatis berkurang saat ada transaksi pending.</p>
                </div>
            </div>

            {/* DESKRIPSI */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Produk</label>
                <textarea 
                    name="description" 
                    defaultValue={initialData?.description}
                    required 
                    rows={4} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Jelaskan isi produk Anda..." 
                />
            </div>

            {/* GAMBAR PRODUK — Google Drive Picker */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Produk (Opsional)</label>
                <DrivePicker
                    label="Pilih Gambar dari Google Drive"
                    currentUrl={imageUrl || null}
                    onSelect={(url) => setImageUrl(url)}
                />
                {imageUrl && (
                    <div className="mt-2 flex items-start gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt="Preview gambar produk"
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 break-all line-clamp-2">{imageUrl}</p>
                            <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="mt-1 text-xs text-red-500 hover:text-red-700"
                            >
                                Hapus gambar
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* LINK FILE — Google Drive Picker */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Link File / Konten (Opsional)</label>
                <DrivePicker
                    label="Pilih File dari Google Drive"
                    currentUrl={fileUrl || null}
                    onSelect={(url) => setFileUrl(url)}
                />
                {fileUrl && (
                    <div className="mt-2 flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2 border">
                        <p className="text-xs text-gray-600 break-all line-clamp-1 flex-1">{fileUrl}</p>
                        <button
                            type="button"
                            onClick={() => setFileUrl("")}
                            className="text-xs text-red-500 hover:text-red-700 shrink-0"
                        >
                            Hapus
                        </button>
                    </div>
                )}
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