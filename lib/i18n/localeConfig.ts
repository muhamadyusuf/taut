// Client-safe locale constants/types — no server-only imports (e.g. next/headers) here.
export const LOCALES = ["id", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "id";
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined): value is Locale {
  return value === "id" || value === "en";
}
