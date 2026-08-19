import { enUS, id as idLocale } from "date-fns/locale";
import type { Locale as AppLocale } from "./localeConfig";

/**
 * Locale date-fns yang cocok dengan bahasa tampilan.
 *
 * Ada supaya tanggal tidak tertinggal saat sisa antarmuka berpindah bahasa —
 * "17 Agu 2026" di layar berbahasa Inggris terbaca seperti bug, bukan pilihan.
 */
export function dateLocale(locale: AppLocale) {
  return locale === "en" ? enUS : idLocale;
}

/** Locale untuk Intl/toLocaleString (angka, mata uang). */
export function numberLocale(locale: AppLocale): string {
  return locale === "en" ? "en-US" : "id-ID";
}
