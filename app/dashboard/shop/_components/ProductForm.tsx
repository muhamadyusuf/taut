"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Save } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import DrivePicker from "../../microsite/_components/DrivePicker";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
  const t = getDictionary(useLocale()).dashboard.productForm;
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
        alert(t.invalidStock);
        setLoading(false);
        return;
    }

    // Validate price
    const priceVal = Number(formData.get("price"));
    if (priceVal < 1000) {
        alert(t.invalidPrice);
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
            alert(t.created);
        } else if (mode === "edit" && initialData) {
            await updateProduct({ id: initialData._id, ...payload });
            alert(t.updated);
        }
        router.push("/dashboard/shop");
        router.refresh();
    } catch (err) {
        const message = err instanceof Error ? err.message : t.unknownError;
        alert(t.saveFailed(message));
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData || !confirm(t.deleteConfirm)) return;
    
    setIsDeleting(true);
    try {
        await deleteProduct({ id: initialData._id });
        router.push("/dashboard/shop");
        router.refresh();
    } catch (err) {
        const message = err instanceof Error ? err.message : t.unknownError;
        alert(t.deleteFailed(message));
    } finally {
        setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">
                {mode === "create" ? t.createTitle : t.editTitle}
            </h2>
            {mode === "edit" && (
                <button 
                    type="button" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-1.5 text-sm text-danger hover:text-danger px-3 py-1.5 rounded-lg hover:bg-danger-soft border border-danger/30 hover:border-danger transition"
                    title={t.deleteProduct}
                >
                    {isDeleting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                    {t.deleteProduct}
                </button>
            )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAMA PRODUK */}
            <div>
                <label className="block text-sm font-bold text-foreground mb-1">{t.nameLabel}</label>
                <input 
                    name="title" 
                    defaultValue={initialData?.title}
                    required 
                    type="text" 
                    className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand outline-none" 
                    placeholder={t.namePlaceholder} 
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {/* HARGA */}
                <div>
                    <label className="block text-sm font-bold text-foreground mb-1">{t.priceLabel}</label>
                    <input 
                        name="price" 
                        defaultValue={initialData?.price}
                        required 
                        type="number" 
                        min="1000" 
                        className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand outline-none" 
                        placeholder={t.pricePlaceholder} 
                    />
                </div>
                {/* STOK */}
                <div>
                    <label className="block text-sm font-bold text-foreground mb-1">{t.stockLabel}</label>
                    <input 
                        name="stock" 
                        defaultValue={initialData?.stock ?? 1}
                        required 
                        type="number" 
                        min="0" 
                        step="1"
                        className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand outline-none" 
                        placeholder={t.stockPlaceholder} 
                    />
                    <p className="text-xs text-subtle mt-1">{t.stockHint}</p>
                </div>
            </div>

            {/* DESKRIPSI */}
            <div>
                <label className="block text-sm font-bold text-foreground mb-1">{t.descriptionLabel}</label>
                <textarea 
                    name="description" 
                    defaultValue={initialData?.description}
                    required 
                    rows={4} 
                    className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand outline-none" 
                    placeholder={t.descriptionPlaceholder} 
                />
            </div>

            {/* GAMBAR PRODUK — Google Drive Picker */}
            <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t.imageLabel}</label>
                <DrivePicker
                    label={t.imagePicker}
                    currentUrl={imageUrl || null}
                    onSelect={(url) => setImageUrl(url)}
                />
                {imageUrl && (
                    <div className="mt-2 flex items-start gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imageUrl}
                            alt={t.imagePreviewAlt}
                            referrerPolicy="no-referrer"
                            className="w-20 h-20 object-cover rounded-lg border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground break-all line-clamp-2">{imageUrl}</p>
                            <button
                                type="button"
                                onClick={() => setImageUrl("")}
                                className="mt-1 text-xs text-danger hover:text-danger"
                            >
                                {t.removeImage}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* LINK FILE — Google Drive Picker */}
            <div>
                <label className="block text-sm font-bold text-foreground mb-2">{t.fileLabel}</label>
                <DrivePicker
                    label={t.filePicker}
                    currentUrl={fileUrl || null}
                    onSelect={(url) => setFileUrl(url)}
                />
                {fileUrl && (
                    <div className="mt-2 flex items-center justify-between gap-2 bg-muted rounded-lg px-3 py-2 border">
                        <p className="text-xs text-muted-foreground break-all line-clamp-1 flex-1">{fileUrl}</p>
                        <button
                            type="button"
                            onClick={() => setFileUrl("")}
                            className="text-xs text-danger hover:text-danger shrink-0"
                        >
                            {t.removeFile}
                        </button>
                    </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{t.fileHint}</p>
            </div>

            {/* TOMBOL SIMPAN */}
            <div className="pt-4">
                <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full bg-brand text-brand-contrast py-3 rounded-xl font-bold hover:bg-brand-hover disabled:opacity-50 flex justify-center items-center gap-2 shadow-[var(--shadow-brand)] transition active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin"/> : <><Save size={18}/> {t.submit}</>}
                </button>
            </div>
        </form>
    </div>
  );
}