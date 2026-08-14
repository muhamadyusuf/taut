"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, ClipboardList, Send, ArrowLeft, ArrowRight } from "lucide-react";
import { getFormTheme } from "@/lib/formThemeConfig";

interface Question {
  id: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
}

interface Section {
  id: string;
  title?: string;
  description?: string;
  questions: Question[];
}

interface FormShape {
  _id: Id<"forms">;
  title: string;
  description?: string;
  acceptingResponses: boolean;
  confirmationMessage?: string;
  theme?: string;
  headerImageUrl?: string;
  sections: Section[];
}

export default function FormFillClient({ form }: { form: FormShape }) {
  const submitResponse = useMutation(api.forms.submitResponse);
  const theme = getFormTheme(form.theme);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const sections = form.sections;
  const currentSection = sections[step];
  const isLastStep = step === sections.length - 1;

  const setSingleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [value] }));
  };

  const toggleCheckboxAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const next = current.includes(option)
        ? current.filter((v) => v !== option)
        : [...current, option];
      return { ...prev, [questionId]: next };
    });
  };

  if (!form.acceptingResponses) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-saweria max-w-md w-full p-8 text-center">
          <ClipboardList size={40} className="mx-auto text-subtle mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">{form.title}</h1>
          <p className="text-muted-foreground">Formulir ini sudah tidak menerima jawaban baru.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${theme.pageBg}`}>
        <div className="card-saweria max-w-md w-full p-8 text-center">
          <CheckCircle2 size={40} className="mx-auto text-success mb-4" />
          <p className="text-foreground font-medium">
            {form.confirmationMessage || "Terima kasih! Jawaban Anda telah tercatat."}
          </p>
        </div>
      </div>
    );
  }

  const validateSection = (section: Section) => {
    for (const q of section.questions) {
      if (!q.required) continue;
      const value = answers[q.id];
      const hasValue = value?.some((v) => v.trim() !== "");
      if (!hasValue) {
        setError(`Pertanyaan "${q.label}" wajib diisi.`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (!validateSection(currentSection)) return;
    setStep((s) => Math.min(s + 1, sections.length - 1));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateSection(currentSection)) return;

    setSubmitting(true);
    try {
      await submitResponse({
        formId: form._id,
        answers: Object.entries(answers).map(([questionId, value]) => ({ questionId, value })),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim jawaban.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen py-10 px-4 ${theme.pageBg}`}>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className={`card-saweria overflow-hidden ${!form.headerImageUrl ? `border-t-8 ${theme.headerBar}` : ""}`}>
          {form.headerImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.headerImageUrl}
              alt=""
              referrerPolicy="no-referrer"
              className="w-full h-40 md:h-56 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">{form.title}</h1>
            {form.description && <p className="text-muted-foreground whitespace-pre-line">{form.description}</p>}
          </div>
        </div>

        {sections.length > 1 && (
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              Bagian {step + 1} dari {sections.length}
            </span>
            <div className="flex gap-1">
              {sections.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-8 rounded-full transition-colors ${i <= step ? theme.swatch : "bg-border"}`}
                />
              ))}
            </div>
          </div>
        )}

        {(currentSection.title || currentSection.description) && (
          <div className="card-saweria p-6">
            {currentSection.title && <h2 className="text-lg font-bold text-foreground mb-1">{currentSection.title}</h2>}
            {currentSection.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">{currentSection.description}</p>
            )}
          </div>
        )}

        {currentSection.questions.map((q) => (
          <div key={q.id} className="card-saweria p-6 space-y-3">
            <div>
              <label className="font-semibold text-foreground">
                {q.label || "Tanpa Judul"} {q.required && <span className="text-danger">*</span>}
              </label>
              {q.description && <p className="text-sm text-muted-foreground mt-1">{q.description}</p>}
            </div>

            {q.type === "short_answer" && (
              <input
                type="text"
                value={answers[q.id]?.[0] || ""}
                onChange={(e) => setSingleAnswer(q.id, e.target.value)}
                className="input-field"
                placeholder="Jawaban Anda"
              />
            )}

            {q.type === "paragraph" && (
              <textarea
                value={answers[q.id]?.[0] || ""}
                onChange={(e) => setSingleAnswer(q.id, e.target.value)}
                className="input-field h-28 resize-none"
                placeholder="Jawaban Anda"
              />
            )}

            {q.type === "multiple_choice" && (
              <div className="space-y-2">
                {(q.options || []).map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id]?.[0] === opt}
                      onChange={() => setSingleAnswer(q.id, opt)}
                      className="w-4 h-4 accent-brand"
                    />
                    <span className="text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "checkboxes" && (
              <div className="space-y-2">
                {(q.options || []).map((opt, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={answers[q.id]?.includes(opt) || false}
                      onChange={() => toggleCheckboxAnswer(q.id, opt)}
                      className="w-4 h-4 accent-brand"
                    />
                    <span className="text-foreground">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.type === "dropdown" && (
              <select
                value={answers[q.id]?.[0] || ""}
                onChange={(e) => setSingleAnswer(q.id, e.target.value)}
                className="input-field"
              >
                <option value="">Pilih...</option>
                {(q.options || []).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {q.type === "linear_scale" && (
              <div className="flex items-center gap-4 pt-2">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{q.scaleMinLabel}</span>
                <div className="flex gap-3 flex-1 justify-center">
                  {Array.from(
                    { length: (q.scaleMax ?? 5) - (q.scaleMin ?? 1) + 1 },
                    (_, i) => (q.scaleMin ?? 1) + i
                  ).map((n) => (
                    <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id]?.[0] === String(n)}
                        onChange={() => setSingleAnswer(q.id, String(n))}
                        className="w-4 h-4 accent-brand"
                      />
                      <span className="text-xs text-muted-foreground">{n}</span>
                    </label>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground w-20 shrink-0 text-right">{q.scaleMaxLabel}</span>
              </div>
            )}
          </div>
        ))}

        {error && (
          <div className="bg-danger-soft text-danger text-sm font-medium p-4 rounded-xl">{error}</div>
        )}

        <div className="flex justify-between items-center pb-10">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="btn-ghost flex items-center gap-2 px-6 py-3"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
          ) : (
            <span />
          )}

          {isLastStep ? (
            <button
              type="submit"
              disabled={submitting}
              className={`rounded-full font-bold flex items-center gap-2 px-8 py-3 transition ${theme.button}`}
            >
              <Send size={16} /> {submitting ? "Mengirim..." : "Kirim"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className={`rounded-full font-bold flex items-center gap-2 px-8 py-3 transition ${theme.button}`}
            >
              Berikutnya <ArrowRight size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

