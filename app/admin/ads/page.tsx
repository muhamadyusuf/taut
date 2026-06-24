"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Image from "next/image";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  Megaphone,
} from "lucide-react";

type AdForm = {
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
};

const EMPTY_FORM: AdForm = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  isActive: false,
};

export default function AdminAdsPage() {
  const ads = useQuery(api.admin.getAllAds);
  const createAd = useMutation(api.admin.createAd);
  const updateAd = useMutation(api.admin.updateAd);
  const deleteAd = useMutation(api.admin.deleteAd);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<Id<"ads"> | null>(null);
  const [form, setForm] = useState<AdForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Id<"ads"> | null>(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (ad: NonNullable<typeof ads>[number]) => {
    setEditingId(ad._id);
    setForm({
      title: ad.title ?? "",
      description: ad.description ?? "",
      imageUrl: ad.imageUrl ?? "",
      linkUrl: ad.linkUrl ?? "",
      isActive: ad.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: form.title || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        linkUrl: form.linkUrl || undefined,
        isActive: form.isActive,
      };

      if (editingId) {
        await updateAd({ id: editingId, ...payload });
      } else {
        await createAd(payload);
      }
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (
    id: Id<"ads">,
    currentAd: NonNullable<typeof ads>[number]
  ) => {
    await updateAd({
      id,
      title: currentAd.title,
      description: currentAd.description,
      imageUrl: currentAd.imageUrl,
      linkUrl: currentAd.linkUrl,
      isActive: !currentAd.isActive,
    });
  };

  const handleDelete = async (id: Id<"ads">) => {
    await deleteAd({ id });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1736]">Manajemen Iklan</h1>
          <p className="text-gray-500 text-sm mt-1">
            Kelola iklan yang tampil di halaman redirect singkat.in
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#0193ff] hover:bg-[#0078d4] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tambah Iklan
        </button>
      </div>

      {/* Ad list */}
      {ads === undefined ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
          <Megaphone className="h-10 w-10 text-gray-300" />
          <p className="font-medium">Belum ada iklan</p>
          <p className="text-sm">Klik &quot;Tambah Iklan&quot; untuk membuat iklan pertama</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {ads.map((ad) => (
            <div
              key={ad._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Preview Image */}
              {ad.imageUrl ? (
                <div className="relative h-44 w-full bg-gray-100">
                  <Image
                    src={ad.imageUrl}
                    alt={ad.title ?? "Ad"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-44 w-full bg-linear-to-br from-[#0b1736] to-[#0a2970] flex items-center justify-center">
                  <Megaphone className="h-10 w-10 text-white/30" />
                </div>
              )}

              <div className="p-5 flex flex-col gap-3 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#0b1736] text-sm leading-tight">
                      {ad.title || <span className="italic text-gray-400">Tanpa judul</span>}
                    </p>
                    {ad.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {ad.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleToggleActive(ad._id, ad)}
                    title={ad.isActive ? "Nonaktifkan" : "Aktifkan"}
                    className="shrink-0"
                  >
                    {ad.isActive ? (
                      <ToggleRight className="h-7 w-7 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-7 w-7 text-gray-400" />
                    )}
                  </button>
                </div>

                {ad.linkUrl && (
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0193ff] hover:underline truncate"
                  >
                    {ad.linkUrl}
                  </a>
                )}

                <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      ad.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {ad.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => openEdit(ad)}
                      className="p-2 rounded-lg text-gray-400 hover:text-[#0193ff] hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(ad._id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#0b1736]">
                {editingId ? "Edit Iklan" : "Buat Iklan Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Judul
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Judul iklan"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0193ff]/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat iklan"
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0193ff]/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/banner.jpg"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0193ff]/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  URL Tujuan Klik
                </label>
                <input
                  type="url"
                  value={form.linkUrl}
                  onChange={(e) =>
                    setForm({ ...form, linkUrl: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0193ff]/50"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-[#0193ff]"
                />
                <span className="text-sm text-gray-700 font-medium">
                  Jadikan iklan aktif (iklan lain akan dinonaktifkan)
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#0193ff] hover:bg-[#0078d4] disabled:bg-gray-300 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId ? "Simpan Perubahan" : "Buat Iklan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-[#0b1736]">Hapus Iklan?</h3>
            <p className="text-sm text-gray-500">
              Iklan ini akan dihapus permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm py-2.5 rounded-xl"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
