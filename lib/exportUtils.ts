import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

interface QuestionLike {
  id: string;
  label: string;
}

interface ResponseLike {
  submittedAt: number;
  answers: { questionId: string; value: string[] }[];
}

function buildRows(questions: QuestionLike[], responses: ResponseLike[]) {
  const headers = ["Waktu", ...questions.map((q) => q.label || "Tanpa Judul")];
  const rows = responses.map((res) => {
    const time = format(res.submittedAt, "d MMM yyyy, HH:mm", { locale: localeId });
    const cells = questions.map((q) => {
      const answer = res.answers.find((a) => a.questionId === q.id);
      return answer?.value.filter(Boolean).join(", ") || "";
    });
    return [time, ...cells];
  });
  return { headers, rows };
}

export function exportResponsesToExcel(filename: string, questions: QuestionLike[], responses: ResponseLike[]) {
  const { headers, rows } = buildRows(questions, responses);
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Jawaban");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportResponsesToPdf(filename: string, title: string, questions: QuestionLike[], responses: ResponseLike[]) {
  const { headers, rows } = buildRows(questions, responses);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  autoTable(doc, { head: [headers], body: rows, startY: 20, styles: { fontSize: 8 } });
  doc.save(`${filename}.pdf`);
}

export function buildResponsesCsv(questions: QuestionLike[], responses: ResponseLike[]): string {
  const { headers, rows } = buildRows(questions, responses);
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}
