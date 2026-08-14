import { ArrowDown, Check, Copy, Link as LinkIcon, MousePointerClick, TrendingUp } from "lucide-react";
import TiltCard from "./TiltCard";

/** Pola 7×7 menyerupai QR code — dekoratif, bukan QR yang bisa dipindai. */
const QR_PATTERN = [
  1, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 1, 1, 1,
  1, 1, 1, 0, 0, 0, 1,
  0, 0, 0, 1, 1, 0, 0,
  1, 1, 0, 1, 0, 1, 1,
  1, 0, 1, 0, 1, 0, 1,
  1, 1, 1, 0, 1, 1, 1,
];

/** Tinggi batang grafik mini, dalam persen. */
const BARS = [38, 62, 45, 78, 56, 92, 70];

/**
 * Mockup produk 3D di hero.
 *
 * Kedalaman dibuat dari perspective + translateZ, jadi tidak ada WebGL dan
 * tidak ada dependensi tambahan. Hanya lapisan tilt-nya yang interaktif
 * (client component); seluruh isi kartu dirender di server.
 */
export default function HeroMockup() {
  return (
    <div className="scene-3d relative mx-auto w-full max-w-md lg:max-w-lg">
      {/* Cahaya latar di belakang mockup */}
      <div
        className="glow-orb animate-drift absolute -top-10 left-1/4 h-56 w-56 bg-brand/30"
        aria-hidden
      />
      <div
        className="glow-orb animate-drift absolute -bottom-8 right-1/4 h-48 w-48 bg-info/25"
        style={{ animationDelay: "-6s" }}
        aria-hidden
      />

      <TiltCard className="layer-3d" max={10}>
        {/* ── KARTU UTAMA ── */}
        <div className="depth-1 rounded-[28px] border border-border bg-card p-6 shadow-[var(--shadow-card-hover)]">
          {/* Chrome jendela */}
          <div className="mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-subtle">
              singkat.in
            </span>
          </div>

          {/* URL asli yang panjang */}
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtle">
            Tautan asli
          </p>
          <div className="truncate rounded-xl border border-border bg-muted px-3 py-2.5 text-xs text-muted-foreground">
            https://registrasi.itts.ac.id/?ref=singkatin&utm_campaign=2026
          </div>

          <div className="my-3 flex justify-center">
            <span className="rounded-full bg-brand-soft p-1.5 text-brand">
              <ArrowDown size={14} strokeWidth={3} />
            </span>
          </div>

          {/* Hasil link pendek */}
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-subtle">
            Jadi sependek ini
          </p>
          <div className="flex items-center gap-2 rounded-xl border-2 border-brand bg-brand-soft px-3 py-2.5">
            <LinkIcon size={15} className="shrink-0 text-brand" />
            <span className="truncate text-sm font-bold text-brand">
              singkat.in/itts
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-brand px-2 py-1 text-[10px] font-bold text-brand-contrast">
              <Copy size={10} /> Salin
            </span>
          </div>

          {/* Grafik mini */}
          <div className="mt-6 flex items-end justify-between gap-1.5" aria-hidden>
            {BARS.map((h, i) => (
              <span
                key={i}
                className={`flex-1 rounded-t-md ${
                  i === BARS.length - 2 ? "bg-brand" : "bg-brand/25"
                }`}
                style={{ height: `${(h / 100) * 56}px` }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-[10px] font-medium text-subtle">
            <span>Sen</span><span>Sel</span><span>Rab</span>
            <span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
          </div>
        </div>

        {/* ── CHIP QR (melayang di depan) ── */}
        <div className="depth-3 animate-float absolute -right-5 -top-7 rounded-2xl border border-border bg-card p-3 shadow-[var(--shadow-card-hover)] sm:-right-8">
          <div className="grid grid-cols-7 gap-[2px]" aria-hidden>
            {QR_PATTERN.map((on, i) => (
              <span
                key={i}
                className={`h-[5px] w-[5px] rounded-[1px] ${on ? "bg-foreground" : "bg-transparent"}`}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-[9px] font-bold text-muted-foreground">
            QR siap cetak
          </p>
        </div>

        {/* ── CHIP STATISTIK ── */}
        <div className="depth-2 animate-float-delayed absolute -bottom-7 -left-4 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-[var(--shadow-card-hover)] sm:-left-8">
          <span className="relative grid h-8 w-8 place-items-center rounded-full bg-success-soft text-success">
            <MousePointerClick size={15} />
            <span className="animate-ring absolute inset-0 rounded-full border-2 border-success" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-extrabold text-foreground">1.248</p>
            <p className="flex items-center gap-1 text-[10px] font-semibold text-success">
              <TrendingUp size={10} /> klik hari ini
            </p>
          </div>
        </div>

        {/* ── CHIP STATUS ── */}
        <div className="depth-2 animate-float-slow absolute -right-2 bottom-16 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 shadow-[var(--shadow-card)] sm:-right-10">
          <Check size={11} strokeWidth={3} className="text-success" />
          <span className="text-[10px] font-bold text-muted-foreground">Aman dipindai</span>
        </div>
      </TiltCard>
    </div>
  );
}
