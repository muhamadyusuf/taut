"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Jeda mulai animasi, untuk efek berurutan antar kartu. */
  delay?: number;
  /** Jarak geser awal, mis. "2rem". Default 1.75rem dari CSS. */
  y?: string;
  /** Skala awal, mis. 0.96 untuk efek zoom-in halus. */
  scale?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Memunculkan konten saat masuk viewport.
 *
 * Catatan aksesibilitas & SEO: teks tetap ada di DOM sejak render pertama —
 * yang dianimasikan hanya opacity/transform. Kalau IntersectionObserver tidak
 * tersedia, konten langsung ditampilkan agar tidak ada yang tersembunyi.
 *
 * Status tampil ditulis langsung ke `data-visible` lewat ref, bukan lewat
 * state React. Elemen ini bisa muncul puluhan kali dalam satu halaman, dan
 * tidak ada satu pun yang perlu render ulang hanya untuk berganti kelas CSS.
 */
export default function Reveal({
  children,
  delay = 0,
  y,
  scale,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      el.dataset.visible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            // Sekali muncul, tidak perlu diamati lagi.
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style: Record<string, string> = {};
  if (delay) style["--reveal-delay"] = `${delay}ms`;
  if (y) style["--reveal-y"] = y;
  if (scale !== undefined) style["--reveal-scale"] = String(scale);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-visible="false"
      style={style}
    >
      {children}
    </Tag>
  );
}
