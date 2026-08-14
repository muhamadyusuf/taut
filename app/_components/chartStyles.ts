/**
 * Gaya bersama untuk semua chart Recharts.
 *
 * Recharts merender SVG biasa, sehingga nilai `var(--token)` bisa dipakai
 * langsung di prop warna. Artinya chart ikut berubah saat tema diganti tanpa
 * perlu me-render ulang komponen atau membaca state tema di JavaScript.
 */

export const CHART_GRID = "var(--border)";
export const CHART_AXIS_TICK = { fontSize: 11, fill: "var(--muted-foreground)" } as const;
export const CHART_AXIS_TICK_SM = { fontSize: 10, fill: "var(--muted-foreground)" } as const;
export const CHART_LABEL_TICK = { fontSize: 11, fill: "var(--foreground)" } as const;

export const CHART_TOOLTIP = {
  contentStyle: {
    borderRadius: "12px",
    border: "1px solid var(--border)",
    background: "var(--card-elevated)",
    boxShadow: "var(--shadow-card-hover)",
    color: "var(--foreground)",
    fontSize: "12px",
  },
  labelStyle: { color: "var(--muted-foreground)", fontWeight: 600 },
  itemStyle: { color: "var(--foreground)" },
} as const;

/** Highlight cursor di belakang bar/kolom yang di-hover. */
export const CHART_CURSOR = { fill: "var(--muted)" } as const;

/**
 * Palet kategorikal. Dipakai untuk pie/bar multi-seri.
 * Warna dipilih agar tetap terbaca di latar terang maupun gelap.
 */
export const CHART_COLORS = [
  "#0193ff",
  "#f97316",
  "#8b5cf6",
  "#10b981",
  "#f43f5e",
  "#eab308",
  "#14b8a6",
  "#6366f1",
  "#ec4899",
  "#84cc16",
];
