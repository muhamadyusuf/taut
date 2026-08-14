import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import Reveal from "@/app/_components/marketing/Reveal";
import FeatureCard, { type FeatureItem } from "@/app/_components/marketing/FeatureCard";
import {
  ShieldArt,
  GlobalArt,
  AnalyticsArt,
  CommunityArt,
} from "@/app/_components/marketing/FeatureArt";

export const metadata: Metadata = {
  title: "Tentang Singkat.in",
  description: "Platform manajemen tautan modern untuk semua kebutuhan digital.",
};

/** Pola bento 3 kolom untuk 4 kartu: 2+1 / 1+2. */
const VALUES: FeatureItem[] = [
  {
    art: ShieldArt,
    label: "Keamanan",
    title: "Aman & privat",
    tint: "var(--brand)",
    wide: true,
    body: "Kami memprioritaskan keamanan data pengguna. Setiap tautan dipindai dari indikasi spam dan konten berbahaya sebelum diteruskan, dan pengunjung selalu melihat tujuan aslinya lebih dulu.",
  },
  {
    art: GlobalArt,
    label: "Performa",
    title: "Infrastruktur global",
    tint: "var(--warning)",
    body: "Server berkinerja tinggi yang memastikan tautan Anda dapat diakses dengan cepat dari seluruh dunia.",
  },
  {
    art: AnalyticsArt,
    label: "Wawasan",
    title: "Analitik real-time",
    tint: "var(--success)",
    body: "Pantau performa tautan Anda dan optimalkan strategi digital berdasarkan data, bukan tebakan.",
  },
  {
    art: CommunityArt,
    label: "Akses",
    title: "Terbuka untuk umum",
    tint: "var(--info)",
    wide: true,
    body: "Siapa pun bisa mendaftar — mulai dari pelajar, dosen, UMKM, hingga korporasi. Tidak ada batasan eksklusif dan tidak ada biaya tersembunyi untuk mulai memakainya.",
  },
];

export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ================= INTRO ================= */}
      <section className="bg-aurora relative px-6 py-16 lg:py-24">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-brand shadow-sm">
              <Sparkles size={15} />
              Tentang kami
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Solusi Link Pendek yang{" "}
              <span className="text-gradient-animated">Simpel &amp; Powerful.</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Singkat.in adalah inisiatif teknologi dari Prodi Teknologi Informasi
              ITTS untuk mempermudah distribusi informasi, materi akademik, dan
              presensi digital dalam satu tautan yang aman dan terpercaya.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= NILAI ================= */}
      <section className="border-y border-border bg-card py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-14 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Yang kami pegang
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Empat prinsip yang menentukan bagaimana platform ini dibangun.
            </p>
          </Reveal>

          <div className="scene-3d grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value, i) => (
              <Reveal
                key={value.title}
                delay={(i % 3) * 110}
                className={value.wide ? "lg:col-span-2" : ""}
              >
                <FeatureCard {...value} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
