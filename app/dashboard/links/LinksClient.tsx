"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { format } from "date-fns";
import { id as idLocale, enUS } from "date-fns/locale";
import { Link as LinkIcon, Copy, ExternalLink, Calendar, BarChart2, Pencil, Trash2 } from "lucide-react";
import EditLinkModal from "../_components/EditLinkModal";
import { useState } from "react";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default function LinksPage() {
  const links = useQuery(api.links.getMyLinks);
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.links;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingLink, setEditingLink] = useState<any>(null);
  const deleteLink = useMutation(api.links.deleteLink);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Di sini sebaiknya pakai Toast/Snackbar notification agar lebih elegan dari alert()
    alert(t.copiedAlert);
  };

  // Fungsi konfirmasi hapus
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDelete = async (id: any) => {
    if (confirm(t.deleteConfirm)) {
      try {
        await deleteLink({ id });
        // Toast sukses bisa ditambahkan di sini
      } catch {
        alert(t.deleteFailedAlert);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">

      <EditLinkModal
        isOpen={!!editingLink} // Modal buka jika ada link di state
        onClose={() => setEditingLink(null)} // Tutup modal = kosongkan state
        linkData={editingLink}
      />

      {!links || links.length === 0 ? (
        <div className="text-center py-24 card-saweria flex flex-col items-center">
          <div className="bg-brand-soft p-6 rounded-full mb-6">
            <LinkIcon size={48} className="text-brand opacity-60" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t.emptyTitle}</h3>
          <p className="text-muted-foreground mb-6">{t.emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {links.slice().reverse().map((link) => (
            <div
              key={link._id}
              className="card-saweria p-6 sm:p-8 flex flex-col sm:flex-row gap-6 group relative overflow-hidden hover:border-brand/40"
            >
              {/* Dekorasi Latar Belakang Halus */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-brand-soft w-24 h-24 rounded-full opacity-60 transition-transform group-hover:scale-150 duration-500" />

              {/* Ikon Kiri */}
              <div className="hidden sm:flex flex-col items-center justify-center">
                <div className="p-4 rounded-[18px] bg-brand-soft text-brand transition-all group-hover:bg-brand group-hover:text-brand-contrast">
                  <LinkIcon size={28} />
                </div>
              </div>

              {/* Konten Tengah */}
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex flex-col gap-1 mb-3">
                  <h3 className="font-bold text-xl text-foreground truncate">
                    {link.title || t.untitledLink}
                  </h3>
                </div>

                {/* Link Pendek (Hero) */}
                <div className="mb-4">
                  <a
                    href={`${process.env.NEXT_PUBLIC_APP_URL}/${link.shortCode}`}
                    target="_blank"
                    className="text-brand font-bold text-2xl hover:underline flex items-center gap-2 truncate tracking-tight"
                  >
                    <span className="text-muted-foreground font-normal text-base opacity-70">
                      {process.env.NEXT_PUBLIC_APP_URL}/
                    </span>
                    {link.shortCode}
                  </a>
                </div>

                {/* Link Asli */}
                <div className="flex items-center gap-2 bg-muted p-3 rounded-xl border border-border max-w-md">
                  <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    className="text-muted-foreground text-sm hover:text-brand truncate transition-colors font-medium"
                  >
                    {link.originalUrl}
                  </a>
                </div>
              </div>

              {/* Bagian Kanan: Statistik & Aksi */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 relative z-10 border-t sm:border-t-0 border-border pt-4 sm:pt-0">
                {/* Statistik Klik */}
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-brand-soft px-4 py-2 rounded-full text-brand-soft-fg font-bold mb-1">
                    <BarChart2 size={18} />
                    <span className="text-lg">{link.clicks}</span> {t.clicksLabel}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                    <Calendar size={12} /> {format(link.createdAt || new Date(), 'd MMM yyyy', { locale: locale === "en" ? enUS : idLocale })}
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* TOMBOL EDIT */}
                  <button
                    onClick={() => setEditingLink(link)}
                    className="p-2.5 bg-muted hover:bg-warning-soft text-muted-foreground hover:text-warning rounded-full transition-colors"
                    title={t.editTitle}
                  >
                    <Pencil size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(link._id)}
                    className="p-2.5 bg-danger-soft hover:bg-danger/20 text-danger rounded-full transition-colors"
                    title={t.deleteTitle}
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Tombol Copy */}
                  <button
                    onClick={() => copyToClipboard(`${process.env.NEXT_PUBLIC_APP_URL}/${link.shortCode}`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-card border-2 border-brand text-brand rounded-full text-sm font-bold hover:bg-brand hover:text-brand-contrast transition-all duration-300 active:scale-95"
                  >
                    <Copy size={16} /> {t.copyButton}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
