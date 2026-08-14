"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Trash2, ExternalLink, Copy, Edit, Store, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function ProductsPage() {
  // 1. Ambil Data Produk & Setting Toko (untuk URL Slug)
  const products = useQuery(api.shop.getMyProducts);
  const settings = useQuery(api.shop.getMySettings);
  const deleteProduct = useMutation(api.shop.deleteProduct);
  const toggleStatus = useMutation(api.shop.toggleProductStatus);

  // Loading State
  if (products === undefined || settings === undefined) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-brand"/></div>;
  }

  // Helper: Salin Link Toko
  const copyShopLink = () => {
    if (!settings?.slug) {
        alert("Anda belum mengatur URL Toko. Silakan ke menu Pengaturan.");
        return;
    }
    const url = `${window.location.origin}/s/${settings.slug}`;
    navigator.clipboard.writeText(url);
    alert("Link Toko berhasil disalin!");
  };

  // Helper: Get Shop URL
  const shopUrl = settings?.slug ? `/s/${settings.slug}` : null;

  return (
    <div className="space-y-6">
        
      {/* INFO HEADER TOKO */}
      <div className="bg-brand-soft border border-border p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-card p-2 rounded-lg text-brand">
                <Store size={24} />
            </div>
            <div>
                <h3 className="font-bold text-foreground">{settings?.shopName || "Nama Toko Belum Diatur"}</h3>
                <p className="text-xs text-muted-foreground">
                    {shopUrl ? `singkat.in${shopUrl}` : "Harap atur URL toko di menu Pengaturan"}
                </p>
            </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={copyShopLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-card border border-border text-brand rounded-lg text-sm font-bold hover:bg-brand-soft transition"
            >
                <Copy size={16} /> Salin Link Toko
            </button>
            {shopUrl && (
                <Link 
                    href={shopUrl} 
                    target="_blank"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-brand text-brand-contrast rounded-lg text-sm font-bold hover:bg-brand-hover transition"
                >
                    <ExternalLink size={16} /> Buka Toko
                </Link>
            )}
        </div>
      </div>

      {/* TABEL PRODUK */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                  <Store className="text-subtle" size={32} />
              </div>
              <h3 className="text-lg font-bold text-foreground">Belum ada produk</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                  Toko Anda masih kosong. Tambahkan produk digital pertama Anda untuk mulai berjualan.
              </p>
              <Link href="/dashboard/shop/new" className="btn-saweria px-4 py-2 rounded-lg text-sm">
                  + Tambah Produk
              </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-muted transition-colors">
                  <td className="px-6 py-4">
                      <div className="text-sm font-bold text-foreground">{product.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-foreground">
                      Rp {product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          product.stock > 0 
                            ? "bg-success-soft text-success" 
                            : "bg-danger-soft text-danger"
                      }`}>
                          {product.stock}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <button
                          onClick={() => toggleStatus({ id: product._id })}
                          title={product.isActive ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                              product.isActive
                                  ? "bg-success-soft text-success hover:bg-success/20"
                                  : "bg-muted text-muted-foreground hover:bg-border"
                          }`}
                      >
                          {product.isActive ? <><Eye size={12} /> Tampil</> : <><EyeOff size={12} /> Nonaktif</>}
                      </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                          <Link 
                            href={`/dashboard/shop/edit/${product._id}`} 
                            className="p-2 text-muted-foreground hover:text-brand hover:bg-brand-soft rounded-lg transition"
                            title="Edit Produk"
                          >
                              <Edit size={16} />
                          </Link>
                          
                          <button 
                              onClick={() => {
                                  if(confirm("Yakin ingin menghapus produk ini?")) {
                                      deleteProduct({ id: product._id });
                                  }
                              }}
                              className="p-2 text-muted-foreground hover:text-danger hover:bg-danger-soft rounded-lg transition" 
                              title="Hapus Produk"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}