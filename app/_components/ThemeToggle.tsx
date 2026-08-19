"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { useLocale } from "@/lib/i18n/useLocale";
import { getDictionary } from "@/lib/i18n/dictionaries";

/**
 * Tiga mode tema.
 *
 * "system" bukan sekadar nilai awal — selama mode ini aktif, next-themes
 * memasang listener `matchMedia("(prefers-color-scheme: dark)")`, sehingga
 * tampilan ikut berubah SEKETIKA saat user mengganti tema di OS-nya tanpa
 * perlu refresh. Begitu user memilih "light"/"dark", pilihan itu tersimpan di
 * localStorage dan menang atas pengaturan OS sampai dikembalikan ke "system".
 */
const MODES = [
  { value: "system", icon: Monitor },
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

type Mode = (typeof MODES)[number]["value"];

// Subscribe kosong yang stabil — nilainya tidak pernah berubah setelah mount.
const noopSubscribe = () => () => {};

/**
 * Bernilai false saat render server & hidrasi, lalu true di klien.
 *
 * Ini menggantikan pola `useState(false)` + `useEffect(() => setMounted(true))`.
 * Hasilnya sama, tapi tanpa setState di dalam effect — React memang menyediakan
 * useSyncExternalStore untuk kasus "snapshot server berbeda dari klien".
 */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/** Hook kecil: mode tersimpan + status mount (untuk cegah mismatch hidrasi). */
function useThemeMode() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  // Sebelum mount kita belum tahu isi localStorage. Pakai "system" (nilai
  // default provider) agar markup server & client identik.
  const mode: Mode = mounted ? ((theme as Mode) ?? "system") : "system";

  return { mode, resolvedTheme: mounted ? resolvedTheme : undefined, setTheme, mounted };
}

/**
 * Segmented control 3 pilihan (Sistem / Terang / Gelap).
 * Dipakai di halaman Pengaturan.
 */
export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const t = getDictionary(useLocale()).themeToggle;
  const { mode, setTheme, mounted } = useThemeMode();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1 ${className}`}
      role="radiogroup"
      aria-label={t.groupAria}
    >
      {MODES.map((opt) => {
        const active = mounted && mode === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            title={t.modes[opt.value]}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              active
                ? "bg-card text-brand shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <opt.icon size={14} />
            <span className="hidden sm:inline">{t.modes[opt.value]}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Keterangan mode aktif. Saat mengikuti sistem, sebutkan hasil deteksinya
 * supaya user paham kenapa tampilannya terang/gelap.
 */
export function ThemeModeHint({ className = "" }: { className?: string }) {
  const t = getDictionary(useLocale()).themeToggle;
  const { mode, resolvedTheme, mounted } = useThemeMode();

  // Jangan render teks apa pun sebelum mount — isinya bergantung localStorage.
  if (!mounted) return <p className={`text-sm text-muted-foreground ${className}`}>&nbsp;</p>;

  const text =
    mode === "system"
      ? t.followingSystem(resolvedTheme === "dark" ? t.modes.dark : t.modes.light)
      : t.manual(mode === "dark" ? t.modes.dark : t.modes.light);

  return <p className={`text-sm text-muted-foreground ${className}`}>{text}</p>;
}

/**
 * Tombol ikon ringkas untuk navbar & header dashboard.
 *
 * Memutar tiga mode: Sistem → Terang → Gelap → Sistem. Sengaja tiga tahap
 * (bukan hanya terang/gelap) supaya user selalu bisa kembali mengikuti tema
 * komputernya tanpa harus membuka halaman Pengaturan.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const t = getDictionary(useLocale()).themeToggle;
  const { mode, resolvedTheme, setTheme, mounted } = useThemeMode();

  const index = MODES.findIndex((m) => m.value === mode);
  const next = MODES[(index + 1) % MODES.length];

  const current = MODES[index] ?? MODES[0];
  const nextLabel = t.modes[next.value].toLowerCase();
  const description =
    mode === "system"
      ? t.shortFollowingSystem(resolvedTheme === "dark" ? t.modes.dark : t.modes.light)
      : t.shortManual(t.modes[current.value].toLowerCase());

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      aria-label={t.switchAria(description, nextLabel)}
      title={t.switchTitle(description, nextLabel)}
      className={`relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-brand hover:text-brand active:scale-95 ${className}`}
    >
      {/* Ketiga ikon selalu dirender; yang tampil dipilih lewat opacity/rotate.
          `mode` sudah bernilai "system" sebelum mount, jadi ikon Monitor yang
          tampil lebih dulu dan markup server/client tetap identik. */}
      {MODES.map((m) => (
        <m.icon
          key={m.value}
          size={18}
          className={`absolute transition-all duration-300 ${
            mode === m.value
              ? "scale-100 rotate-0 opacity-100"
              : "scale-0 -rotate-90 opacity-0"
          }`}
        />
      ))}

      {/* Titik penanda saat tema sedang dikunci manual (bukan ikut sistem). */}
      {mounted && mode !== "system" && (
        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand" />
      )}
    </button>
  );
}
