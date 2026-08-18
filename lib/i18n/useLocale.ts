"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./localeConfig";

// Dipakai di area yang seluruhnya client component (mis. dashboard), di mana
// tidak ada server component induk untuk membaca cookie & meneruskan locale.
const listeners = new Set<() => void>();

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Simpan locale ke cookie lalu beri tahu semua pemakai useLocale() untuk render ulang seketika. */
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Baca locale aktif dari cookie di client component, reaktif terhadap setLocaleCookie(). */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, readCookieLocale, () => DEFAULT_LOCALE);
}
