"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Plus, Smartphone, ExternalLink, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { alertMessageFor, errorMessage } from "@/lib/planError";

export default function MicrositeListPage() {
  const microsites = useQuery(api.microsites.getMyMicrosites);
  const createMicrosite = useMutation(api.microsites.createMicrosite);
  const deleteMicrosite = useMutation(api.microsites.deleteMicrosite);
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const slug = prompt("Masukkan URL Bio yang diinginkan (contoh: andri-bisnis):");
    if (!slug) return;
    setIsCreating(true);
    try {
      const id = await createMicrosite({ slug, title: "Halaman Baru" });
      router.push(`/dashboard/microsite/${id}`); // Redirect ke Editor
    } catch (e) {
      alert(alertMessageFor(e, "Gagal membuat halaman bio."));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: Id<"microsites">, title: string) => {
    if (confirm(`Yakin ingin menghapus halaman "${title}" selamanya?`)) {
      try {
        await deleteMicrosite({ id });
      } catch (e) {
        alert("Gagal menghapus: " + errorMessage(e));
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bio Link Saya</h1>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="btn-saweria px-6 py-2 flex items-center gap-2"
        >
          <Plus size={18} /> {isCreating ? "Membuat..." : "Buat Baru"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {microsites?.map((site) => (
          <div key={site._id} className="card-saweria p-6 group relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="bg-brand-soft p-3 rounded-full text-brand shrink-0">
                  <Smartphone size={24} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate">{site.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">/{site.slug}</p>
                </div>
              </div>

              {/* TOMBOL HAPUS POJOK KANAN ATAS */}
              <button
                onClick={() => handleDelete(site._id, site.title)}
                className="text-subtle hover:text-danger p-2 hover:bg-danger-soft rounded-full transition shrink-0"
                title="Hapus Halaman"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                href={`/dashboard/microsite/${site._id}`}
                className="flex-1 bg-muted hover:bg-brand-soft text-muted-foreground hover:text-brand py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Edit size={14} /> Edit
              </Link>
              <a
                href={`/bio/${site.slug}`}
                target="_blank"
                className="flex-1 border border-border hover:border-brand hover:text-brand text-muted-foreground py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                Lihat <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {microsites?.length === 0 && (
          <div className="col-span-full text-center py-20 bg-muted rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground mb-4">Belum ada Bio Link</p>
            <button onClick={handleCreate} className="text-brand font-bold hover:underline">
              Buat yang pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
