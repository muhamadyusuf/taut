"use client";

import { use } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { ArrowLeft, Trash2, Inbox } from "lucide-react";

export default function FormResponsesPage({ params }: { params: Promise<{ id: Id<"forms"> }> }) {
  const { id } = use(params);

  const form = useQuery(api.forms.getFormById, { id });
  const responses = useQuery(api.forms.getResponses, { formId: id });
  const deleteResponse = useMutation(api.forms.deleteResponse);

  const handleDelete = async (responseId: Id<"form_responses">) => {
    if (confirm("Hapus jawaban ini?")) {
      await deleteResponse({ id: responseId });
    }
  };

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
