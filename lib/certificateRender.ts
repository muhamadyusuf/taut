import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export interface CertificateField {
  id: string;
  variable: string; // question id, atau "_no" | "_date" | "_formTitle"
  x: number; // persen (0-100) dari lebar gambar
  y: number; // persen (0-100) dari tinggi gambar
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  align: string; // "left" | "center" | "right"
}

interface FormResponseLike {
  submittedAt: number;
  answers: { questionId: string; value: string[] }[];
}

export const SPECIAL_VARIABLES = [
  { value: "_no", label: "Nomor Sertifikat" },
  { value: "_date", label: "Tanggal Submit" },
  { value: "_formTitle", label: "Judul Formulir" },
];

export function computeCertificateValues(
  allQuestions: { id: string; label: string }[],
  formTitle: string,
  response: FormResponseLike,
  serialNumber: number
): Record<string, string> {
  const map: Record<string, string> = {
    _no: String(serialNumber).padStart(4, "0"),
    _date: format(response.submittedAt, "d MMMM yyyy", { locale: localeId }),
    _formTitle: formTitle,
  };
  for (const q of allQuestions) {
    const answer = response.answers.find((a) => a.questionId === q.id);
    map[q.id] = answer?.value.filter(Boolean).join(", ") || "";
  }
  return map;
}

export function interpolateTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => values[key.trim()] ?? "");
}

/** Gambar template + field teks ke <canvas>, hasilkan PNG data URL. */
export function renderCertificatePng(
  imageDataUrl: string,
  width: number,
  height: number,
  fields: CertificateField[],
  values: Record<string, string>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas tidak didukung di browser ini."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      for (const field of fields) {
        const value = values[field.variable] ?? "";
        ctx.font = `${field.bold ? "bold " : ""}${field.fontSize}px ${field.fontFamily}`;
        ctx.fillStyle = field.color;
        ctx.textAlign = field.align as CanvasTextAlign;
        ctx.textBaseline = "middle";
        ctx.fillText(value, (field.x / 100) * width, (field.y / 100) * height);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Gagal memuat gambar template."));
    img.src = imageDataUrl;
  });
}

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] || "";
}
