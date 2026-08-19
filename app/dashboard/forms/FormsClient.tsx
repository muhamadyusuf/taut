"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  ClipboardList, Plus, Trash2, Pencil, BarChart2,
  Copy, ExternalLink, FileText,
} from "lucide-react";
import { getFormTheme, formThemeLabel } from "@/lib/formThemeConfig";
import { alertMessageFor } from "@/lib/planError";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { dateLocale } from "@/lib/i18n/dateLocale";

export default function FormsClient() {
  const locale = useLocale();
  const t = getDictionary(locale).dashboard.forms;
  const forms = useQuery(api.forms.getMyForms);
  const createForm = useMutation(api.forms.createForm);
  const deleteForm = useMutation(api.forms.deleteForm);
  const router = useRouter();

  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const formId = await createForm({ title: newTitle });
      router.push(`/dashboard/forms/${formId}`);
    } catch (err) {
      // Tanpa catch, penolakan kuota paket hanya jadi promise yang gagal diam-diam
      // dan user melihat tombol yang seolah tidak berfungsi.
      alert(alertMessageFor(err, t.createFailed));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: Id<"forms">) => {
    if (confirm(t.deleteConfirm)) {
      await deleteForm({ id });
    }
  };

  const copyPublicLink = (slug: string) => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/f/${slug}`;
    navigator.clipboard.writeText(url);
    alert(t.copiedAlert);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* --- FORM INPUT ATAS --- */}
      <div className="card-saweria p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-brand-soft p-3 rounded-2xl text-brand">
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
            <p className="text-muted-foreground text-sm">{t.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex w-full md:w-auto gap-3">
          <input
            type="text"
            placeholder={t.newPlaceholder}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input-field flex-1 md:w-64"
            required
          />
          <button
            disabled={loading}
            type="submit"
            className="btn-saweria rounded-xl px-6 py-3 shrink-0"
            aria-label={t.createAria}
          >
            {loading ? "..." : <Plus size={20} />}
          </button>
        </form>
      </div>

      {/* --- LIST FORMULIR --- */}
      {!forms || forms.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-[30px] bg-card/50">
          <FileText size={48} className="mx-auto text-subtle mb-4" />
          <p className="text-muted-foreground font-medium">{t.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {forms.map((form) => {
            const questionCount = form.sections.reduce((total, s) => total + s.questions.length, 0);
            const theme = getFormTheme(form.theme);
            return (
            <div key={form._id} className="card-saweria p-6 group relative flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-brand-soft text-brand p-2 rounded-lg">
                    <ClipboardList size={20} />
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${theme.swatch}`}
                    title={formThemeLabel(form.theme, locale)}
                  />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
                    form.status === "published"
                      ? "bg-success-soft text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {form.status === "published" ? t.published : t.draft}
                </span>
              </div>

              <h3 className="text-lg font-bold text-foreground mb-1 truncate">
                {form.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                {t.meta(
                  questionCount,
                  form.sections.length,
                  format(form.createdAt, "d MMM yyyy", { locale: dateLocale(locale) })
                )}
              </p>

              <div className="flex-1" />

              <div className="flex items-center gap-1 pt-3 border-t border-border">
                <Link
                  href={`/dashboard/forms/${form._id}`}
                  className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-brand px-2 py-2 rounded-lg hover:bg-brand-soft transition"
                  title={t.editTitle}
                >
                  <Pencil size={14} /> {t.edit}
                </Link>
                <Link
                  href={`/dashboard/forms/${form._id}/responses`}
                  className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-brand px-2 py-2 rounded-lg hover:bg-brand-soft transition"
                  title={t.responsesTitle}
                >
                  <BarChart2 size={14} /> {t.responses}
                </Link>

                <div className="flex-1" />

                {form.status === "published" && (
                  <>
                    <button
                      onClick={() => copyPublicLink(form.slug)}
                      className="text-subtle hover:text-brand p-2 rounded-full hover:bg-brand-soft transition"
                      title={t.copyTitle}
                    >
                      <Copy size={16} />
                    </button>
                    <a
                      href={`/f/${form.slug}`}
                      target="_blank"
                      className="text-subtle hover:text-brand p-2 rounded-full hover:bg-brand-soft transition"
                      title={t.openTitle}
                    >
                      <ExternalLink size={16} />
                    </a>
                  </>
                )}
                <button
                  onClick={() => handleDelete(form._id)}
                  className="text-subtle hover:text-danger p-2 rounded-full hover:bg-danger-soft transition"
                  title={t.deleteTitle}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
