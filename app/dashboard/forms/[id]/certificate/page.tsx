"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Mail, UploadCloud, CheckCircle2,
  Type as TypeIcon,
} from "lucide-react";
import DrivePicker from "../../../microsite/_components/DrivePicker";
import DriveFolderPicker from "./_components/DriveFolderPicker";
import {
  CertificateField,
  SPECIAL_VARIABLES,
  computeCertificateValues,
  interpolateTemplate,
  renderCertificatePng,
  dataUrlToBase64,
} from "@/lib/certificateRender";
import { requestGoogleAccessToken } from "@/lib/googleAuth";
import { uploadFileToDriveFolder } from "@/lib/googleDrive";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

const FONT_FAMILIES = ["Helvetica, Arial, sans-serif", "Georgia, serif", "'Times New Roman', serif", "'Courier New', monospace"];

function createField(variable: string): CertificateField {
  return {
    id: crypto.randomUUID(),
    variable,
    x: 50,
    y: 50,
    fontSize: 32,
    color: "#1a1a1a",
    fontFamily: FONT_FAMILIES[0],
    bold: false,
    align: "center",
  };
}

export default function CertificateBuilderPage({ params }: { params: Promise<{ id: Id<"forms"> }> }) {
  const { id: formId } = use(params);

  const locale = useLocale();
  const dict = getDictionary(locale).dashboard;
  const t = dict.certificate;

  const form = useQuery(api.forms.getFormById, { id: formId });
  const responses = useQuery(api.forms.getResponses, { formId });
  const template = useQuery(api.certificates.getTemplate, { formId });

  const saveTemplate = useMutation(api.certificates.saveTemplate);
  const markCertificateGenerated = useMutation(api.certificates.markCertificateGenerated);
  const prepareCertificate = useMutation(api.certificates.prepareCertificate);
  const fetchImageAsBase64 = useAction(api.certificateActions.fetchImageAsBase64);
  const sendCertificateEmail = useAction(api.certificateActions.sendCertificateEmail);

  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [imageSize, setImageSize] = useState({ width: 1000, height: 700 });
  const [fields, setFields] = useState<CertificateField[]>([]);
  const [driveFolderId, setDriveFolderId] = useState("");
  const [driveFolderName, setDriveFolderName] = useState("");
  const [emailQuestionId, setEmailQuestionId] = useState("");
  const [emailSubject, setEmailSubject] = useState(t.defaultEmailSubject);
  const [emailBody, setEmailBody] = useState(t.defaultEmailBody);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const allQuestions = useMemo(() => form?.sections.flatMap((s) => s.questions) || [], [form]);

  // Hydrate lokal state dari data tersimpan (sekali saja)
  useEffect(() => {
    if (template === undefined || hydrated) return;
    if (template) {
      setBackgroundImageUrl(template.backgroundImageUrl);
      setImageSize({ width: template.width, height: template.height });
      setFields(template.fields as CertificateField[]);
      setDriveFolderId(template.driveFolderId || "");
      setDriveFolderName(template.driveFolderName || "");
      setEmailQuestionId(template.emailQuestionId || "");
      setEmailSubject(template.emailSubject || t.defaultEmailSubject);
      setEmailBody(template.emailBody || emailBody);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, hydrated]);

  // Deteksi ukuran asli gambar saat template diganti
  useEffect(() => {
    if (!backgroundImageUrl) return;
    const img = new Image();
    img.referrerPolicy = "no-referrer";
    img.onload = () => setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    img.src = backgroundImageUrl;
  }, [backgroundImageUrl]);

  // Label variabel bawaan diambil dari kamus, bukan dari SPECIAL_VARIABLES:
  // daftar itu juga dipakai perenderan sertifikat dan kuncinya harus tetap sama.
  const variableOptions = [
    ...SPECIAL_VARIABLES.map((v) => ({
      value: v.value,
      label: t.specialVariables[v.value as keyof typeof t.specialVariables] ?? v.label,
    })),
    ...allQuestions.map((q) => ({ value: q.id, label: q.label || t.untitledQuestion })),
  ];

  const handleAddField = () => {
    const field = createField(variableOptions[0]?.value || "_formTitle");
    setFields((prev) => [...prev, field]);
    setSelectedFieldId(field.id);
  };

  const updateField = (fieldId: string, patch: Partial<CertificateField>) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)));
  };

  const removeField = (fieldId: string) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  // --- Drag posisi field di atas preview ---
  const handleFieldMouseDown = (e: React.MouseEvent, fieldId: string) => {
    e.preventDefault();
    setSelectedFieldId(fieldId);
    dragState.current = { id: fieldId, offsetX: 0, offsetY: 0 };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragState.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    updateField(dragState.current.id, { x, y });
  };

  const handleMouseUp = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleSaveTemplate = async () => {
    if (!backgroundImageUrl) {
      alert(t.pickTemplateFirst);
      return;
    }
    setIsSaving(true);
    try {
      await saveTemplate({
        formId,
        backgroundImageUrl,
        width: imageSize.width,
        height: imageSize.height,
        fields,
        driveFolderId: driveFolderId || undefined,
        driveFolderName: driveFolderName || undefined,
        emailQuestionId: emailQuestionId || undefined,
        emailSubject,
        emailBody,
      });
      alert(t.saved);
    } catch (err) {
      alert(err instanceof Error ? err.message : t.saveFailed);
    } finally {
      setIsSaving(false);
    }
  };

  // Render sertifikat untuk 1 respons -> kembalikan { dataUrl, base64 }
  const renderForResponse = async (response: NonNullable<typeof responses>[number], serial: number) => {
    // Kuota dipotong dan kode verifikasi diterbitkan LEBIH DULU, karena kodenya
    // ikut tercetak ke dalam gambar. Menerbitkannya setelah render berarti
    // sertifikat yang diterima peserta tidak memuat kode apa pun.
    const { code } = await prepareCertificate({ responseId: response._id });

    const { base64, mimeType } = await fetchImageAsBase64({ url: backgroundImageUrl });
    const imageDataUrl = `data:${mimeType};base64,${base64}`;
    const values = computeCertificateValues(allQuestions, form?.title || "", response, serial, code);
    const pngDataUrl = await renderCertificatePng(imageDataUrl, imageSize.width, imageSize.height, fields, values);
    return { pngDataUrl, values };
  };

  const handleGenerateAndUpload = async (response: NonNullable<typeof responses>[number], index: number) => {
    if (!driveFolderId) {
      alert(t.pickFolderFirst);
      return;
    }
    setProcessingId(response._id);
    try {
      const { pngDataUrl } = await renderForResponse(response, index + 1);
      const accessToken = await requestGoogleAccessToken();
      const filename = `${t.fileNamePrefix}-${(form?.title || "form").replace(/\s+/g, "-")}-${index + 1}.png`;
      const webViewLink = await uploadFileToDriveFolder({
        accessToken,
        folderId: driveFolderId,
        filename,
        mimeType: "image/png",
        base64Data: dataUrlToBase64(pngDataUrl),
      });
      await markCertificateGenerated({ responseId: response._id, certificateUrl: webViewLink });
    } catch (err) {
      alert(err instanceof Error ? err.message : t.generateFailed);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendEmail = async (response: NonNullable<typeof responses>[number], index: number) => {
    if (!emailQuestionId) {
      alert(t.pickEmailQuestionFirst);
      return;
    }
    const emailAnswer = response.answers.find((a) => a.questionId === emailQuestionId)?.value[0];
    if (!emailAnswer) {
      alert(t.noEmailAnswer);
      return;
    }
    setProcessingId(response._id);
    try {
      const { pngDataUrl, values } = await renderForResponse(response, index + 1);
      await sendCertificateEmail({
        formId,
        responseId: response._id,
        to: emailAnswer,
        subject: interpolateTemplate(emailSubject, values),
        html: interpolateTemplate(emailBody, values).replace(/\n/g, "<br/>"),
        attachmentBase64: dataUrlToBase64(pngDataUrl),
        attachmentFilename: `${t.fileNamePrefix}-${index + 1}.png`,
      });
      alert(t.emailSentTo(emailAnswer));
    } catch (err) {
      alert(err instanceof Error ? err.message : t.emailFailed);
    } finally {
      setProcessingId(null);
    }
  };

  if (form === null) {
    return <div className="p-10 text-center text-danger">{t.notFound}</div>;
  }
  if (!form || !responses || template === undefined) {
    return <div className="p-10 text-center animate-pulse text-muted-foreground">{t.loading}</div>;
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId) || null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/forms/${formId}/responses`} className="text-subtle hover:text-muted-foreground transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t.titlePrefix} — {form.title}
          </h1>
          <p className="text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <button
          onClick={handleSaveTemplate}
          disabled={isSaving}
          className="ml-auto bg-brand hover:opacity-90 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition text-sm disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {dict.common.save}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-saweria p-4 space-y-3">
            <DrivePicker label={t.templateLabel} currentUrl={backgroundImageUrl} onSelect={setBackgroundImageUrl} />
            <p className="text-[11px] text-subtle">{t.templateHint}</p>
          </div>

          {backgroundImageUrl && (
            <div className="card-saweria p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><TypeIcon size={16} /> {t.positionHeading}</h3>
                <button onClick={handleAddField} className="text-xs font-bold text-brand flex items-center gap-1 hover:opacity-80">
                  <Plus size={14} /> {t.addVariable}
                </button>
              </div>
              <div
                ref={canvasRef}
                className="relative w-full border border-border rounded-lg overflow-hidden select-none bg-black/5"
                style={{ aspectRatio: `${imageSize.width} / ${imageSize.height}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={backgroundImageUrl} alt="Template" className="w-full h-full object-contain pointer-events-none" referrerPolicy="no-referrer" />
                {fields.map((field) => {
                  const label = variableOptions.find((v) => v.value === field.variable)?.label || field.variable;
                  return (
                    <div
                      key={field.id}
                      onMouseDown={(e) => handleFieldMouseDown(e, field.id)}
                      className={`absolute cursor-move px-2 py-1 text-xs rounded border-2 whitespace-nowrap -translate-x-1/2 -translate-y-1/2 ${
                        selectedFieldId === field.id ? "border-brand bg-brand-soft" : "border-dashed border-muted-foreground/50 bg-card/70"
                      }`}
                      style={{ left: `${field.x}%`, top: `${field.y}%` }}
                    >
                      {`{{${label}}}`}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedField && (
            <div className="card-saweria p-4 space-y-3">
              <h3 className="font-bold text-sm text-foreground">{t.fieldHeading}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">{t.variableLabel}</label>
                  <select
                    value={selectedField.variable}
                    onChange={(e) => updateField(selectedField.id, { variable: e.target.value })}
                    className="w-full border border-border rounded-lg p-2 text-sm bg-card"
                  >
                    {variableOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.fontSizeLabel}</label>
                  <input type="number" value={selectedField.fontSize} onChange={(e) => updateField(selectedField.id, { fontSize: Number(e.target.value) })} className="w-full border border-border rounded-lg p-2 text-sm bg-card" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.colorLabel}</label>
                  <input type="color" value={selectedField.color} onChange={(e) => updateField(selectedField.id, { color: e.target.value })} className="w-full border border-border rounded-lg p-1 h-9 bg-card" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.fontLabel}</label>
                  <select value={selectedField.fontFamily} onChange={(e) => updateField(selectedField.id, { fontFamily: e.target.value })} className="w-full border border-border rounded-lg p-2 text-sm bg-card">
                    {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.alignLabel}</label>
                  <select value={selectedField.align} onChange={(e) => updateField(selectedField.id, { align: e.target.value })} className="w-full border border-border rounded-lg p-2 text-sm bg-card">
                    <option value="left">{t.alignLeft}</option>
                    <option value="center">{t.alignCenter}</option>
                    <option value="right">{t.alignRight}</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm col-span-2">
                  <input type="checkbox" checked={selectedField.bold} onChange={(e) => updateField(selectedField.id, { bold: e.target.checked })} /> {t.bold}
                </label>
              </div>
              <button onClick={() => removeField(selectedField.id)} className="text-xs font-bold text-danger flex items-center gap-1 hover:opacity-80">
                <Trash2 size={14} /> {t.removeField}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <DriveFolderPicker
            folderId={driveFolderId}
            folderName={driveFolderName}
            onSelect={(fid, fname) => { setDriveFolderId(fid); setDriveFolderName(fname); }}
          />

          <div className="card-saweria p-4 space-y-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Mail size={16} /> {t.emailHeading}</h3>
            <div>
              <label className="text-xs text-muted-foreground">{t.emailQuestionLabel}</label>
              <select value={emailQuestionId} onChange={(e) => setEmailQuestionId(e.target.value)} className="w-full border border-border rounded-lg p-2 text-sm bg-card">
                <option value="">{t.emailQuestionNone}</option>
                {allQuestions.map((q) => <option key={q.id} value={q.id}>{q.label || t.untitledQuestion}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t.emailSubjectLabel}</label>
              <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="w-full border border-border rounded-lg p-2 text-sm bg-card" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t.emailBodyLabel}</label>
              <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={5} className="w-full border border-border rounded-lg p-2 text-sm bg-card" />
              <p className="text-[10px] text-subtle mt-1">
                {t.emailVariableHint("{{_formTitle}}")}
              </p>
            </div>
            <p className="text-[10px] text-subtle">{t.resendHint}</p>
          </div>
        </div>
      </div>

      <div className="card-saweria p-4">
        <h3 className="font-bold text-sm text-foreground mb-3">{t.generateHeading}</h3>
        {responses.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noResponses}</p>
        ) : (
          <div className="space-y-2">
            {responses.map((res, index) => (
              <div key={res._id} className="flex items-center justify-between gap-3 border border-border rounded-lg p-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{t.responseLabel(index + 1)}</p>
                  {res.certificateUrl && (
                    <a href={res.certificateUrl} target="_blank" rel="noreferrer" className="text-xs text-success flex items-center gap-1 hover:underline">
                      <CheckCircle2 size={12} /> {t.viewOnDrive}
                    </a>
                  )}
                  {res.certificateSentAt && <p className="text-[10px] text-subtle">{t.emailSent}</p>}
                </div>
                <button
                  onClick={() => handleGenerateAndUpload(res, index)}
                  disabled={processingId === res._id || !backgroundImageUrl}
                  className="bg-card border border-border hover:border-brand text-foreground font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs disabled:opacity-50"
                >
                  {processingId === res._id ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />} {t.generateToDrive}
                </button>
                <button
                  onClick={() => handleSendEmail(res, index)}
                  disabled={processingId === res._id || !backgroundImageUrl}
                  className="bg-card border border-border hover:border-brand text-foreground font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 text-xs disabled:opacity-50"
                >
                  {processingId === res._id ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} {t.sendEmail}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
