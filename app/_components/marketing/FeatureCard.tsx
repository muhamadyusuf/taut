import type { ComponentType, CSSProperties, ReactNode } from "react";
import TiltCard from "./TiltCard";

export interface FeatureItem {
  /** Komponen ilustrasi dari FeatureArt. */
  art: ComponentType;
  /** Kicker pendek di atas judul, mis. "Keamanan". */
  label: string;
  title: string;
  body: ReactNode;
  /** Warna semburat kanvas ilustrasi, mis. "var(--brand)". */
  tint: string;
  /**
   * Kartu lebar. Di grid 3 kolom, pemakainya perlu menambahkan
   * `lg:col-span-2` pada pembungkus grid item-nya.
   */
  wide?: boolean;
}

/**
 * Kartu fitur dengan kanvas ilustrasi.
 *
 * Dipakai di landing page dan halaman Tentang, jadi satu perubahan desain
 * langsung berlaku di keduanya. Kartu ini mengharapkan induknya memasang
 * kelas `scene-3d` agar efek miringnya punya perspektif.
 */
export default function FeatureCard({
  art: Art,
  label,
  title,
  body,
  tint,
  wide = false,
}: FeatureItem) {
  return (
    <TiltCard max={5} className="h-full">
      <article
        className="group relative h-full rounded-[28px] border border-border bg-background p-5 transition-colors duration-300 hover:border-brand lg:p-6"
        style={{ "--art-tint": tint } as CSSProperties}
      >
        {/*
          Kartu lebar jadi dua kolom di layar besar. `flex-row-reverse`
          memindahkan kanvas (anak pertama di DOM) ke sisi kanan, sementara
          urutan bacanya tetap gambar-lalu-teks.
        */}
        <div
          className={`flex h-full flex-col gap-6 ${
            wide ? "lg:flex-row-reverse lg:items-center lg:gap-8" : ""
          }`}
        >
          <div className={`art-canvas depth-2 h-44 shrink-0 ${wide ? "lg:h-52 lg:w-1/2" : ""}`}>
            <Art />
          </div>

          <div className={wide ? "lg:flex-1" : ""}>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">
              {label}
            </span>
            <h3 className="depth-1 mt-2 text-xl font-bold text-foreground lg:text-[1.35rem]">
              {title}
            </h3>
            <p className="mt-2.5 leading-relaxed text-muted-foreground">{body}</p>
          </div>
        </div>
      </article>
    </TiltCard>
  );
}
