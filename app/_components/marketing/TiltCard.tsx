"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Sudut miring maksimum dalam derajat. */
  max?: number;
  /** Tampilkan pantulan cahaya yang mengikuti kursor. */
  glare?: boolean;
}

/**
 * Kartu yang miring 3D mengikuti kursor.
 *
 * Sudut ditulis langsung ke CSS custom property lewat ref — sengaja tidak
 * memakai state React supaya tidak ada re-render di setiap pointermove.
 * Efek dilewati pada perangkat sentuh (pointer kasar) dan saat pengguna
 * meminta gerak minimal.
 */
export default function TiltCard({
  children,
  className = "",
  max = 9,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const enabled = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled()) return;

    const rect = el.getBoundingClientRect();
    // Posisi kursor dinormalisasi ke rentang -0.5 … 0.5
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    // Sumbu X dibalik: kursor di bawah harus memiringkan kartu menjauh.
    el.style.setProperty("--tilt-x", `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * max).toFixed(2)}deg`);
    el.style.setProperty("--glare-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--glare-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    el.dataset.tilting = "true";
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.dataset.tilting = "false";
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      data-tilting="false"
      className={`tilt-card relative ${className}`}
    >
      {children}
      {glare && <span className="tilt-glare" aria-hidden />}
    </div>
  );
}
