"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

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
  { value: "system", label: "Sistem", icon: Monitor },
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
] as const;

type Mode = (typeof MODES)[number]["value"];

/** Hook kecil: mode tersimpan + status mount (untuk cegah mismatch hidrasi). */
function useThemeMode() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
  const { mode, setTheme, mounted } = useThemeMode();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1 ${className}`}
      role="radiogroup"
      aria-label="Pilih tema tampilan"
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
            title={opt.label}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              active
                ? "bg-card text-brand shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <opt.icon size={14} />
            <span className="hidden sm:inline">{opt.label}</span>
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
  const { mode, resolvedTheme, mounted } = useThemeMode();

  // Jangan render teks apa pun sebelum mount — isinya bergantung localStorage.
  if (!mounted) return <p className={`text-sm text-muted-foreground ${className}`}>&nbsp;</p>;

  const text =
    mode === "system"
      ? `Mengikuti pengaturan komputer Anda — saat ini ${
          resolvedTheme === "dark" ? "gelap" : "terang"
        }.`
      : `Diatur manual ke mode ${mode === "dark" ? "gelap" : "terang"}.`;

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
  const { mode, resolvedTheme, setTheme, mounted } = useThemeMode();

  const index = MODES.findIndex((m) => m.value === mode);
  const next = MODES[(index + 1) % MODES.length];

  const current = MODES[index] ?? MODES[0];
  const description =
    mode === "system"
      ? `Tema: mengikuti sistem (${resolvedTheme === "dark" ? "gelap" : "terang"})`
      : `Tema: ${current.label.toLowerCase()}`;

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      aria-label={`${description}. Klik untuk ganti ke ${next.label.toLowerCase()}.`}
      title={`${description} — klik untuk ${next.label.toLowerCase()}`}
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
