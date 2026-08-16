import { ConvexError } from "convex/values";
import type { PlanId } from "@/convex/plans";

/**
 * Bentuk error yang dilempar convex/entitlements.ts saat kuota habis atau fitur
 * dikunci paket. Sengaja terstruktur, bukan sekadar teks, supaya UI bisa
 * memunculkan ajakan upgrade yang tepat sasaran.
 */
export type PlanErrorData = {
  code: "UPGRADE_REQUIRED" | "QUOTA_EXCEEDED";
  message: string;
  currentPlan?: PlanId;
  requiredPlan?: PlanId | null;
  feature?: string;
  limitKey?: string;
  limit?: number;
  used?: number;
};

function isPlanErrorData(value: unknown): value is PlanErrorData {
  if (typeof value !== "object" || value === null) return false;
  const data = value as Record<string, unknown>;
  return (
    (data.code === "UPGRADE_REQUIRED" || data.code === "QUOTA_EXCEEDED") &&
    typeof data.message === "string"
  );
}

/** Mengembalikan detail batasan paket, atau null kalau errornya soal lain. */
export function planErrorOf(error: unknown): PlanErrorData | null {
  if (error instanceof ConvexError && isPlanErrorData(error.data)) {
    return error.data;
  }
  return null;
}

/**
 * Pesan yang layak ditampilkan ke user dari error apa pun.
 *
 * ConvexError yang datanya berupa objek punya `message` bawaan yang penuh nama
 * fungsi dan jejak internal — tidak untuk dibaca orang. Ambil pesan yang kita
 * tulis sendiri lebih dulu.
 */
export function errorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan"
): string {
  const planError = planErrorOf(error);
  if (planError) return planError.message;

  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }

  if (error instanceof Error && error.message) {
    // Convex membungkus pesan asli dengan awalan seperti
    // "[CONVEX M(forms:createForm)] [Request ID: ...] Server Error\nUncaught Error: ..."
    // Ambil kalimat terakhir yang benar-benar ditulis manusia.
    const match = error.message.match(/Uncaught (?:Convex)?Error:\s*([\s\S]*?)(?:\n\s+at\s|$)/);
    if (match?.[1]) return match[1].trim();
    return error.message;
  }

  return fallback;
}
