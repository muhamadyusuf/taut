"use client";

import { use, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, Trash2, Inbox, Download, FileSpreadsheet, FileText, Award, Loader2 } from "lucide-react";
import { exportResponsesToExcel, exportResponsesToPdf, buildResponsesCsv } from "@/lib/exportUtils";
import { requestGoogleAccessToken } from "@/lib/googleAuth";
import { createGoogleSheetFromCsv } from "@/lib/googleDrive";

export default function FormResponsesPage({ params }: { params: Promise<{ id: Id<"forms"> }> }) {
  const { id } = use(params);

  const form = useQuery(api.forms.getFormById, { id });
  const responses = useQuery(api.forms.getResponses, { formId: id });
  const deleteResponse = useMutation(api.forms.deleteResponse);

  const [exportOpen, setExportOpen] = useState(false);
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleDelete = async (responseId: Id<"form_responses">) => {
    if (confirm("Hapus jawaban ini?")) {
      await deleteResponse({ id: responseId });
    }
  };

  const handleExportExcel = () => {
    if (!form || !responses) return;
    const questions = form.sections.flatMap((s) => s.questions);
    exportResponsesToExcel(form.title, questions, responses);
    setExportOpen(false);
  };

  const handleExportPdf = () => {
    if (!form || !responses) return;
    const questions = form.sections.flatMap((s) => s.questions);
    exportResponsesToPdf(form.title, form.title, questions, responses);
    setExportOpen(false);
  };

  const handleExportGoogleSheet = async () => {
    if (!form || !responses) return;
    setIsExportingSheet(true);
    try {
      const questions = form.sections.flatMap((s) => s.questions);
      const csv = buildResponsesCsv(questions, responses);
      const accessToken = await requestGoogleAccessToken();
      const link = await createGoogleSheetFromCsv(accessToken, `${form.title} - Jawaban`, csv);
      window.open(link, "_blank");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuat Google Sheet.");
    } finally {
      setIsExportingSheet(false);
      setExportOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (form === null) {
    return <div className="p-10 text-center text-danger">Formulir tidak ditemukan atau bukan milik Anda.</div>;
  }

  if (!form || !responses) {
    return <div className="p-10 text-center animate-pulse text-muted-foreground">Memuat Jawaban...</div>;
  }

  const allQuestions = form.sections.flatMap((section) => section.questions);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/forms/${id}`} className="text-subtle hover:text-muted-foreground transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{form.title}</h1>
          <p className="text-sm text-muted-foreground">
            {responses.length} jawaban masuk
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/dashboard/forms/${id}/certificate`}
            className="bg-card border border-border hover:border-brand text-foreground font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition text-sm"
          >
            <Award size={16} /> Sertifikat
          </Link>

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setExportOpen((v) => !v)}
              disabled={responses.length === 0}
              className="bg-brand hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition text-sm disabled:opacity-50"
            >
              <Download size={16} /> Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                <button onClick={handleExportExcel} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2">
                  <FileSpreadsheet size={15} className="text-success" /> Excel (.xlsx)
                </button>
                <button onClick={handleExportPdf} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2">
                  <FileText size={15} className="text-danger" /> PDF
                </button>
                <button onClick={handleExportGoogleSheet} disabled={isExportingSheet} className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted flex items-center gap-2 disabled:opacity-50">
                  {isExportingSheet ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} className="text-brand" />} Google Sheet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-[30px] bg-card/50">
          <Inbox size={48} className="mx-auto text-subtle mb-4" />
          <p className="text-muted-foreground font-medium">Belum ada jawaban yang masuk.</p>
        </div>
      ) : (
        <div className="card-saweria overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-bold text-muted-foreground p-4 whitespace-nowrap">Waktu</th>
                {allQuestions.map((q) => (
                  <th key={q.id} className="text-left font-bold text-muted-foreground p-4 min-w-45">
                    {q.label || "Tanpa Judul"}
                  </th>
                ))}
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {responses.map((res) => (
                <tr key={res._id} className="border-b border-border last:border-0 hover:bg-muted/50 transition">
                  <td className="p-4 whitespace-nowrap text-muted-foreground">
                    {format(res.submittedAt, "d MMM yyyy, HH:mm", { locale: localeId })}
                  </td>
                  {allQuestions.map((q) => {
                    const answer = res.answers.find((a) => a.questionId === q.id);
                    return (
                      <td key={q.id} className="p-4 text-foreground align-top">
                        {answer?.value.filter(Boolean).join(", ") || (
                          <span className="text-subtle">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="text-subtle hover:text-danger p-2 rounded-full hover:bg-danger-soft transition"
                      title="Hapus Jawaban"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
