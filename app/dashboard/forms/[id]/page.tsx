"use client";

import { useEffect, useState, use, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Link from "next/link";
import { QRCode } from "react-qrcode-logo";
import {
  Plus, Trash2, Save, GripVertical, ArrowLeft, Copy, ExternalLink,
  BarChart2, AlertCircle, ChevronDown, Settings2, Palette, Layers, Check, Download, QrCode as QrIcon,
} from "lucide-react";
import { FORM_THEMES, DEFAULT_FORM_THEME, formThemeLabel } from "@/lib/formThemeConfig";
import DrivePicker from "../../microsite/_components/DrivePicker";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

type QuestionType =
  | "short_answer"
  | "paragraph"
  | "multiple_choice"
  | "checkboxes"
  | "dropdown"
  | "linear_scale";

type Question = {
  id: string;
  type: QuestionType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
};

type Section = {
  id: string;
  title?: string;
  description?: string;
  questions: Question[];
};

interface FormData {
  _id: Id<"forms">;
  title: string;
  description?: string;
  slug: string;
  status: string;
  acceptingResponses: boolean;
  confirmationMessage?: string;
  theme?: string;
  headerImageUrl?: string;
  sections: Section[];
}

const QUESTION_TYPES: QuestionType[] = [
  "short_answer",
  "paragraph",
  "multiple_choice",
  "checkboxes",
  "dropdown",
  "linear_scale",
];

function newQuestion(): Question {
  return {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: "short_answer",
    label: "",
    description: "",
    required: false,
  };
}

function newSection(): Section {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    description: "",
    questions: [],
  };
}

export default function FormBuilderPage({ params }: { params: Promise<{ id: Id<"forms"> }> }) {
  const { id } = use(params);

  const locale = useLocale();
  const dict = getDictionary(locale).dashboard;
  const t = dict.formBuilder;

  const formQuery = useQuery(api.forms.getFormById, { id });
  const updateForm = useMutation(api.forms.updateForm);

  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formQuery && !formData) {
      setFormData({
        ...formQuery,
        theme: formQuery.theme || DEFAULT_FORM_THEME,
        sections: (formQuery.sections?.length ? formQuery.sections : [newSection()]) as Section[],
      });
    }
  }, [formQuery, formData]);

  const handleChange = (updater: (prev: FormData) => FormData) => {
    if (!formData) return;
    setFormData(updater(formData));
    setIsDirty(true);
  };

  if (formQuery === null) {
    return (
      <div className="p-10 text-center text-danger">{t.notFound}</div>
    );
  }

  if (!formData) {
    return <div className="p-10 text-center animate-pulse text-muted-foreground">{t.loading}</div>;
  }

  // --- SECTION HELPERS ---
  const addSection = () => {
    handleChange((prev) => ({ ...prev, sections: [...prev.sections, newSection()] }));
  };

  const updateSection = (sIndex: number, patch: Partial<Section>) => {
    handleChange((prev) => {
      const next = [...prev.sections];
      next[sIndex] = { ...next[sIndex], ...patch };
      return { ...prev, sections: next };
    });
  };

  const deleteSection = (sIndex: number) => {
    if (!confirm(t.deleteSectionConfirm)) return;
    handleChange((prev) => {
      const next = [...prev.sections];
      next.splice(sIndex, 1);
      return { ...prev, sections: next };
    });
  };

  // --- QUESTION HELPERS ---
  const addQuestion = (sIndex: number) => {
    handleChange((prev) => {
      const sections = [...prev.sections];
      sections[sIndex] = { ...sections[sIndex], questions: [...sections[sIndex].questions, newQuestion()] };
      return { ...prev, sections };
    });
  };

  const updateQuestion = (sIndex: number, qIndex: number, patch: Partial<Question>) => {
    handleChange((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sIndex].questions];
      questions[qIndex] = { ...questions[qIndex], ...patch };
      sections[sIndex] = { ...sections[sIndex], questions };
      return { ...prev, sections };
    });
  };

  const changeQuestionType = (sIndex: number, qIndex: number, type: QuestionType) => {
    const current = formData.sections[sIndex].questions[qIndex];
    const needsOptions = type === "multiple_choice" || type === "checkboxes" || type === "dropdown";
    const patch: Partial<Question> = { type };
    if (needsOptions) {
      patch.options = current.options?.length ? current.options : [t.optionDefault(1)];
    } else {
      patch.options = undefined;
    }
    if (type === "linear_scale") {
      patch.scaleMin = current.scaleMin ?? 1;
      patch.scaleMax = current.scaleMax ?? 5;
    } else {
      patch.scaleMin = undefined;
      patch.scaleMax = undefined;
      patch.scaleMinLabel = undefined;
      patch.scaleMaxLabel = undefined;
    }
    updateQuestion(sIndex, qIndex, patch);
  };

  const deleteQuestion = (sIndex: number, qIndex: number) => {
    if (!confirm(t.deleteQuestionConfirm)) return;
    handleChange((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sIndex].questions];
      questions.splice(qIndex, 1);
      sections[sIndex] = { ...sections[sIndex], questions };
      return { ...prev, sections };
    });
  };

  const addOption = (sIndex: number, qIndex: number) => {
    handleChange((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sIndex].questions];
      const options = [...(questions[qIndex].options || [])];
      options.push(t.optionDefault(options.length + 1));
      questions[qIndex] = { ...questions[qIndex], options };
      sections[sIndex] = { ...sections[sIndex], questions };
      return { ...prev, sections };
    });
  };

  const updateOption = (sIndex: number, qIndex: number, oIndex: number, value: string) => {
    handleChange((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sIndex].questions];
      const options = [...(questions[qIndex].options || [])];
      options[oIndex] = value;
      questions[qIndex] = { ...questions[qIndex], options };
      sections[sIndex] = { ...sections[sIndex], questions };
      return { ...prev, sections };
    });
  };

  const deleteOption = (sIndex: number, qIndex: number, oIndex: number) => {
    handleChange((prev) => {
      const sections = [...prev.sections];
      const questions = [...sections[sIndex].questions];
      const options = [...(questions[qIndex].options || [])];
      options.splice(oIndex, 1);
      questions[qIndex] = { ...questions[qIndex], options };
      sections[sIndex] = { ...sections[sIndex], questions };
      return { ...prev, sections };
    });
  };

  // --- DRAG & DROP (bagian & pertanyaan, termasuk pindah antar bagian) ---
  const handleOnDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "SECTION") {
      handleChange((prev) => {
        const sections = Array.from(prev.sections);
        const [moved] = sections.splice(source.index, 1);
        sections.splice(destination.index, 0, moved);
        return { ...prev, sections };
      });
      return;
    }

    // type === "QUESTION"
    const sourceSectionId = source.droppableId.replace("questions-", "");
    const destSectionId = destination.droppableId.replace("questions-", "");

    handleChange((prev) => {
      const sections = prev.sections.map((s) => ({ ...s, questions: [...s.questions] }));
      const sourceSection = sections.find((s) => s.id === sourceSectionId);
      const destSection = sections.find((s) => s.id === destSectionId);
      if (!sourceSection || !destSection) return prev;
      const [moved] = sourceSection.questions.splice(source.index, 1);
      destSection.questions.splice(destination.index, 0, moved);
      return { ...prev, sections };
    });
  };

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);
    try {
      await updateForm({
        id: formData._id,
        title: formData.title,
        description: formData.description,
        slug: formData.slug,
        status: formData.status,
        acceptingResponses: formData.acceptingResponses,
        confirmationMessage: formData.confirmationMessage,
        theme: formData.theme,
        headerImageUrl: formData.headerImageUrl,
        sections: formData.sections,
      });
      setIsDirty(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : dict.common.genericError;
      alert(t.saveFailed(message));
    } finally {
      setLoading(false);
    }
  };

  const copyPublicLink = () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/f/${formData.slug}`;
    navigator.clipboard.writeText(url);
    alert(t.copiedAlert);
  };

  const downloadQR = () => {
    const qrElement = qrRef.current;
    const canvas = qrElement?.querySelector("canvas");
    if (!canvas) return;
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qr-form-${formData.slug}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex justify-between items-center sticky top-0 glass z-20 py-4 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/dashboard/forms" className="text-subtle hover:text-muted-foreground transition shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold flex items-center gap-2 truncate">
            {formData.title || t.untitled}
            {isDirty && <span className="w-2 h-2 bg-warning rounded-full animate-pulse shrink-0" title={t.unsavedTitle} />}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/dashboard/forms/${formData._id}/responses`}
            className="btn-ghost rounded-full px-4 py-2 flex items-center gap-2 text-sm"
          >
            <BarChart2 size={16} /> {t.responses}
          </Link>
          <button
            onClick={handleSave}
            disabled={loading || !isDirty}
            className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition shadow-sm text-sm ${
              isDirty ? "bg-brand text-brand-contrast hover:bg-brand-hover" : "bg-muted text-subtle cursor-not-allowed"
            }`}
          >
            <Save size={16} /> {loading ? dict.common.saving : dict.common.save}
          </button>
        </div>
      </div>

      {/* Publish & Link */}
      <div className="card-saweria p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <Settings2 size={18} /> {t.statusHeading}
          </div>
          <button
            onClick={() =>
              handleChange((prev) => ({
                ...prev,
                status: prev.status === "published" ? "draft" : "published",
              }))
            }
            className={`text-xs font-bold px-4 py-2 rounded-full transition ${
              formData.status === "published"
                ? "bg-success-soft text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {formData.status === "published" ? t.statusPublished : t.statusDraft}
          </button>
        </div>

        {formData.status === "published" && (
          <div className="flex items-center gap-2 bg-muted p-3 rounded-xl border border-border">
            <span className="text-sm text-muted-foreground truncate flex-1">
              {process.env.NEXT_PUBLIC_APP_URL}/f/{formData.slug}
            </span>
            <button onClick={copyPublicLink} className="text-subtle hover:text-brand p-2 rounded-full hover:bg-brand-soft transition" title={t.copyTitle}>
              <Copy size={14} />
            </button>
            <a
              href={`/f/${formData.slug}`}
              target="_blank"
              className="text-subtle hover:text-brand p-2 rounded-full hover:bg-brand-soft transition"
              title={t.openTitle}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        )}

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.acceptingResponses}
            onChange={(e) => handleChange((prev) => ({ ...prev, acceptingResponses: e.target.checked }))}
            className="w-4 h-4 accent-brand"
          />
          <span className="text-sm text-muted-foreground">{t.acceptingResponses}</span>
        </label>
      </div>

      {/* QR Code */}
      {formData.status === "published" && (
        <div className="card-saweria p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-bold">
            <QrIcon size={18} /> {t.qrHeading}
          </div>
          <div className="flex items-center gap-6">
            <div ref={qrRef} className="bg-white p-2 rounded-lg border border-border shrink-0">
              <QRCode
                value={`${process.env.NEXT_PUBLIC_APP_URL}/f/${formData.slug}`}
                size={120}
                ecLevel={"H"}
                logoImage="/logo.svg"
                logoWidth={32}
                logoHeight={32}
                logoOpacity={1}
                quietZone={5}
                qrStyle="squares"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t.qrHint}</p>
              <button
                onClick={downloadQR}
                className="btn-ghost rounded-full px-4 py-2 flex items-center gap-2 text-sm"
              >
                <Download size={16} /> {t.qrDownload}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="card-saweria p-6 md:p-8 space-y-4">
        <div>
          <label className="form-label">{t.titleLabel}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange((prev) => ({ ...prev, title: e.target.value }))}
            className="input-field font-bold text-lg"
            placeholder={t.titlePlaceholder}
          />
        </div>
        <div>
          <label className="form-label">{t.descriptionLabel}</label>
          <textarea
            value={formData.description || ""}
            onChange={(e) => handleChange((prev) => ({ ...prev, description: e.target.value }))}
            className="input-field h-20 resize-none"
            placeholder={t.descriptionPlaceholder}
          />
        </div>
        <DrivePicker
          label={t.headerImageLabel}
          currentUrl={formData.headerImageUrl}
          onSelect={(url) => handleChange((prev) => ({ ...prev, headerImageUrl: url }))}
        />
        <div>
          <label className="form-label">{t.slugLabel}</label>
          <div className="flex items-center border border-border rounded-xl bg-muted overflow-hidden focus-within:ring-4 focus-within:ring-ring focus-within:border-brand transition">
            <span className="pl-3 text-subtle text-sm shrink-0">/f/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange((prev) => ({ ...prev, slug: e.target.value }))}
              className="w-full p-3 bg-transparent font-mono text-brand outline-none text-sm"
            />
          </div>
        </div>
        <div>
          <label className="form-label">{t.confirmationLabel}</label>
          <input
            type="text"
            value={formData.confirmationMessage || ""}
            onChange={(e) => handleChange((prev) => ({ ...prev, confirmationMessage: e.target.value }))}
            className="input-field"
            placeholder={t.confirmationPlaceholder}
          />
        </div>
      </div>

      {/* Theme Picker */}
      <div className="card-saweria p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Palette size={18} /> {t.themeHeading}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(FORM_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleChange((prev) => ({ ...prev, theme: key }))}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                (formData.theme || DEFAULT_FORM_THEME) === key
                  ? "border-brand ring-2 ring-ring"
                  : "border-transparent hover:border-border"
              }`}
              title={formThemeLabel(key, locale)}
            >
              <div className={`w-9 h-9 rounded-full ${theme.swatch} flex items-center justify-center shrink-0`}>
                {(formData.theme || DEFAULT_FORM_THEME) === key && <Check size={16} className="text-white" />}
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">
                {formThemeLabel(key, locale)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Sections & Questions Builder */}
      <div className="flex justify-between items-center pt-2">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Layers size={18} /> {t.builderHeading}
        </h3>
      </div>

      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="sections" type="SECTION">
          {(sectionsProvided) => (
            <div {...sectionsProvided.droppableProps} ref={sectionsProvided.innerRef} className="space-y-6">
              {formData.sections.map((section, sIndex) => (
                <Draggable key={section.id} draggableId={section.id} index={sIndex}>
                  {(sectionDraggable, sectionSnapshot) => (
                    <div
                      ref={sectionDraggable.innerRef}
                      {...sectionDraggable.draggableProps}
                      className={`rounded-2xl border-2 border-dashed border-border p-4 space-y-4 transition-all ${
                        sectionSnapshot.isDragging ? "shadow-lg scale-[1.01] z-50 bg-muted/60" : ""
                      }`}
                    >
                      {/* Section Header */}
                      <div className="flex items-start gap-3">
                        <div {...sectionDraggable.dragHandleProps} className="text-subtle cursor-grab active:cursor-grabbing hover:text-muted-foreground p-1 mt-2">
                          <GripVertical size={20} />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-brand-soft text-brand-soft-fg text-[10px] font-bold px-2 py-1 rounded-full shrink-0">
                              {t.sectionBadge(sIndex + 1, formData.sections.length)}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={section.title || ""}
                            onChange={(e) => updateSection(sIndex, { title: e.target.value })}
                            placeholder={
                              sIndex === 0
                                ? t.sectionTitlePlaceholderFirst
                                : t.sectionTitlePlaceholder(sIndex + 1)
                            }
                            className="input-field font-bold"
                          />
                          <textarea
                            value={section.description || ""}
                            onChange={(e) => updateSection(sIndex, { description: e.target.value })}
                            placeholder={t.sectionDescriptionPlaceholder}
                            className="input-field h-16 resize-none text-sm"
                          />
                        </div>
                        {formData.sections.length > 1 && (
                          <button
                            onClick={() => deleteSection(sIndex)}
                            className="text-subtle hover:text-danger p-2 rounded-full hover:bg-danger-soft transition shrink-0"
                            title={t.deleteSectionTitle}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Questions in this section */}
                      <Droppable droppableId={`questions-${section.id}`} type="QUESTION">
                        {(questionsProvided) => (
                          <div {...questionsProvided.droppableProps} ref={questionsProvided.innerRef} className="space-y-4 pl-2">
                            {section.questions.map((q, qIndex) => (
                              <Draggable key={q.id} draggableId={q.id} index={qIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`card-saweria p-5 transition-all ${snapshot.isDragging ? "shadow-lg rotate-1 scale-[1.01] z-50" : ""}`}
                                  >
                                    <div className="flex items-start gap-3">
                                      <div {...provided.dragHandleProps} className="text-subtle cursor-grab active:cursor-grabbing hover:text-muted-foreground p-1 mt-2">
                                        <GripVertical size={20} />
                                      </div>

                                      <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                          <input
                                            type="text"
                                            value={q.label}
                                            onChange={(e) => updateQuestion(sIndex, qIndex, { label: e.target.value })}
                                            placeholder={t.questionPlaceholder}
                                            className="input-field flex-1 font-semibold"
                                            autoFocus={q.label === ""}
                                          />
                                          <div className="relative shrink-0">
                                            <select
                                              value={q.type}
                                              onChange={(e) => changeQuestionType(sIndex, qIndex, e.target.value as QuestionType)}
                                              className="input-field pr-8 appearance-none cursor-pointer sm:w-52"
                                            >
                                              {QUESTION_TYPES.map((type) => (
                                                <option key={type} value={type}>
                                                  {t.questionTypes[type]}
                                                </option>
                                              ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
                                          </div>
                                        </div>

                                        <input
                                          type="text"
                                          value={q.description || ""}
                                          onChange={(e) => updateQuestion(sIndex, qIndex, { description: e.target.value })}
                                          placeholder={t.questionDescriptionPlaceholder}
                                          className="w-full bg-transparent text-sm text-muted-foreground outline-none placeholder:text-subtle"
                                        />

                                        {/* Options for choice-based types */}
                                        {(q.type === "multiple_choice" || q.type === "checkboxes" || q.type === "dropdown") && (
                                          <div className="space-y-2 pt-1">
                                            {(q.options || []).map((opt, oIndex) => (
                                              <div key={oIndex} className="flex items-center gap-2">
                                                <span className="text-subtle text-xs w-4 shrink-0">{oIndex + 1}.</span>
                                                <input
                                                  type="text"
                                                  value={opt}
                                                  onChange={(e) => updateOption(sIndex, qIndex, oIndex, e.target.value)}
                                                  className="input-field flex-1 py-2"
                                                />
                                                <button
                                                  onClick={() => deleteOption(sIndex, qIndex, oIndex)}
                                                  className="text-subtle hover:text-danger p-1.5 rounded-full hover:bg-danger-soft transition shrink-0"
                                                >
                                                  <Trash2 size={14} />
                                                </button>
                                              </div>
                                            ))}
                                            <button
                                              onClick={() => addOption(sIndex, qIndex)}
                                              className="text-brand text-xs font-bold flex items-center gap-1 pl-6 hover:underline"
                                            >
                                              <Plus size={12} /> {t.addOption}
                                            </button>
                                          </div>
                                        )}

                                        {/* Linear scale config */}
                                        {q.type === "linear_scale" && (
                                          <div className="flex flex-wrap items-center gap-3 pt-1">
                                            <select
                                              value={q.scaleMin ?? 1}
                                              onChange={(e) => updateQuestion(sIndex, qIndex, { scaleMin: Number(e.target.value) })}
                                              className="input-field w-20 py-2"
                                            >
                                              {[0, 1].map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                              ))}
                                            </select>
                                            <span className="text-subtle text-sm">{t.scaleTo}</span>
                                            <select
                                              value={q.scaleMax ?? 5}
                                              onChange={(e) => updateQuestion(sIndex, qIndex, { scaleMax: Number(e.target.value) })}
                                              className="input-field w-20 py-2"
                                            >
                                              {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                                <option key={n} value={n}>{n}</option>
                                              ))}
                                            </select>
                                            <input
                                              type="text"
                                              value={q.scaleMinLabel || ""}
                                              onChange={(e) => updateQuestion(sIndex, qIndex, { scaleMinLabel: e.target.value })}
                                              placeholder={t.scaleMinLabel}
                                              className="input-field flex-1 py-2 min-w-35"
                                            />
                                            <input
                                              type="text"
                                              value={q.scaleMaxLabel || ""}
                                              onChange={(e) => updateQuestion(sIndex, qIndex, { scaleMaxLabel: e.target.value })}
                                              placeholder={t.scaleMaxLabel}
                                              className="input-field flex-1 py-2 min-w-35"
                                            />
                                          </div>
                                        )}

                                        <div className="flex justify-end items-center gap-4 pt-2 border-t border-border">
                                          <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={q.required}
                                              onChange={(e) => updateQuestion(sIndex, qIndex, { required: e.target.checked })}
                                              className="w-4 h-4 accent-brand"
                                            />
                                            <span className="text-xs font-bold text-muted-foreground">{t.required}</span>
                                          </label>
                                          <button
                                            onClick={() => deleteQuestion(sIndex, qIndex)}
                                            className="text-subtle hover:text-danger p-2 rounded-full hover:bg-danger-soft transition"
                                            title={t.deleteQuestionTitle}
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {questionsProvided.placeholder}

                            {section.questions.length === 0 && (
                              <div className="text-center p-6 border-2 border-dashed border-border rounded-xl text-subtle text-sm">
                                {t.emptySection}
                              </div>
                            )}

                            <button
                              onClick={() => addQuestion(sIndex)}
                              className="btn-ghost rounded-full px-4 py-2 text-sm flex items-center gap-1"
                            >
                              <Plus size={16} /> {t.addQuestion}
                            </button>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {sectionsProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <button onClick={addSection} className="btn-saweria rounded-full px-5 py-3 text-sm flex items-center gap-2 mx-auto">
        <Plus size={16} /> {t.addSection}
      </button>

      {formData.sections.every((s) => s.questions.length === 0) && (
        <div className="text-center p-12 border-2 border-dashed border-border rounded-xl text-subtle flex flex-col items-center gap-2">
          <AlertCircle size={32} className="opacity-20" />
          <p>{t.emptyTitle}</p>
          <p className="text-xs">{t.emptyHint}</p>
        </div>
      )}
    </div>
  );
}
