"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

interface CountUpProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Durasi animasi dalam milidetik. */
  duration?: number;
  className?: string;
}

// useLayoutEffect memicu peringatan saat SSR; di server pakai useEffect saja.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function format(n: number, decimals: number) {
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Angka yang menghitung naik saat masuk viewport.
 *
 * Nilai akhir sudah dirender di HTML server, jadi crawler dan pengguna tanpa
 * JS tetap melihat angka yang benar. Di klien, angka di-reset ke 0 sebelum
 * frame pertama (useLayoutEffect) supaya tidak ada kedipan nilai akhir.
 *
 * Teks diperbarui lewat ref, bukan state — menghindari re-render React di
 * setiap frame animasi.
 */
export default function CountUp({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1600,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    el.textContent = `${prefix}${format(0, decimals)}${suffix}`;

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || done.current) continue;
          done.current = true;
          observer.disconnect();

          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // easeOutExpo — cepat di awal lalu melambat menjelang nilai akhir
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            el.textContent = `${prefix}${format(value * eased, decimals)}${suffix}`;
            if (t < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, decimals, prefix, suffix, duration]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${format(value, decimals)}${suffix}`}
    </span>
  );
}
