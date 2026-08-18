"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import type { Locale } from "@/lib/i18n/localeConfig";
import { setLocaleCookie } from "@/lib/i18n/useLocale";

const LABELS: Record<Locale, string> = { id: "ID", en: "EN" };

/**
 * Tombol ganti bahasa (ID/EN). Locale disimpan di cookie lalu server component
 * dirender ulang lewat router.refresh() — tanpa perlu prefix URL /id atau /en.
 * Untuk client component (mis. dashboard) yang membaca lewat useLocale(),
 * setLocaleCookie() langsung memicu render ulang tanpa perlu refresh.
 */
export default function LanguageToggle({
  locale,
  className = "",
}: {
  locale: Locale;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const next: Locale = locale === "id" ? "en" : "id";

  const handleClick = () => {
    setLocaleCookie(next);
    startTransition(() => router.refresh());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={`Bahasa: ${locale.toUpperCase()}. Klik untuk ganti ke ${next.toUpperCase()}.`}
      title={`Bahasa: ${locale.toUpperCase()} — klik untuk ${next.toUpperCase()}`}
      className={`flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-sm font-bold text-muted-foreground transition-colors hover:border-brand hover:text-brand active:scale-95 disabled:opacity-60 ${className}`}
    >
      <Languages size={16} />
      {LABELS[locale]}
    </button>
  );
}
