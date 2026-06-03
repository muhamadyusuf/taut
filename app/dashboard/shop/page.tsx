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
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;
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
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Store size={24} />
            </div>
            <div>
                <h3 className="font-bold text-blue-900">{settings?.shopName || "Nama Toko Belum Diatur"}</h3>
                <p className="text-xs text-blue-700">
                    {shopUrl ? `singkat.in${shopUrl}` : "Harap atur URL toko di menu Pengaturan"}
                </p>
            </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button 
                onClick={copyShopLink}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition"
            >
                <Copy size={16} /> Salin Link Toko
            </button>
            {shopUrl && (
                <Link 
                    href={shopUrl} 
                    target="_blank"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
                >
                    <ExternalLink size={16} /> Buka Toko
                </Link>
            )}
        </div>
      </div>

      {/* TABEL PRODUK */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
              <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Store className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Belum ada produk</h3>
              <p className="text-gray-500 mb-6 max-w-sm">
                  Toko Anda masih kosong. Tambahkan produk digital pertama Anda untuk mulai berjualan.
              </p>
              <Link href="/dashboard/shop/new" className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm">
                  + Tambah Produk
              </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produk</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{product.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{product.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                      Rp {product.price.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          product.stock > 0 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
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
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                      >
                          {product.isActive ? <><Eye size={12} /> Tampil</> : <><EyeOff size={12} /> Nonaktif</>}
                      </button>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                          <Link 
                            href={`/dashboard/shop/edit/${product._id}`} 
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
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
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
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