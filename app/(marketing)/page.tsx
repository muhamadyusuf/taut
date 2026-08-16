import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  CalendarDays,
  Eye,
  Newspaper,
  Sparkles,
  Zap,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import HeroMockup from "@/app/_components/marketing/HeroMockup";
import Reveal from "@/app/_components/marketing/Reveal";
import CountUp from "@/app/_components/marketing/CountUp";
import FeatureCard, { type FeatureItem } from "@/app/_components/marketing/FeatureCard";
import {
  SlugArt,
  AnalyticsArt,
  QrArt,
  MicrositeArt,
  CategoryArt,
  ShieldArt,
} from "@/app/_components/marketing/FeatureArt";

export const metadata: Metadata = {
  title: "Shortlink Gratis Terbaik dengan Analitik & QR Code",
  description: "Ubah link panjang menjadi singkat.in/namamu. Platform perpendek link gratis dengan fitur statistik lengkap, kustomisasi slug, dan QR code otomatis.",
  alternates: {
    canonical: "https://singkat.in", // Mencegah duplikat konten
  },
};

const STATS = [
  { label: "Tautan Aktif", value: 10, decimals: 0, suffix: "K+" },
  { label: "Klik Terhitung", value: 5.2, decimals: 1, suffix: "M" },
  { label: "Pengguna", value: 2.5, decimals: 1, suffix: "K" },
  { label: "Uptime", value: 99.9, decimals: 1, suffix: "%" },
];

/**
 * Urutan `wide` menghasilkan pola bento 3 kolom: 2+1 / 1+2 / 2+1.
 * `tint` mewarnai semburat di kanvas ilustrasi masing-masing kartu.
 */
const FEATURES: FeatureItem[] = [
  {
    art: SlugArt,
    label: "Identitas",
    title: "Tautan bernama sendiri",
    tint: "var(--brand)",
    wide: true,
    body: (
      <>
        Ubah URL sepanjang satu paragraf jadi{" "}
        <span className="font-semibold text-brand">singkat.in/namamu</span> — mudah
        diingat, mudah diketik, dan memperkuat personal branding.
      </>
    ),
  },
  {
    art: AnalyticsArt,
    label: "Data",
    title: "Analitik real-time",
    tint: "var(--warning)",
    body: "Lihat berapa klik yang masuk tiap hari, dan tautan mana yang benar-benar bekerja.",
  },
  {
    art: QrArt,
    label: "Cetak",
    title: "QR code instan",
    tint: "var(--info)",
    body: "Setiap tautan otomatis punya QR siap unduh untuk poster, kartu nama, atau merchandise.",
  },
  {
    art: MicrositeArt,
    label: "Halaman",
    title: "Microsite & bio link",
    tint: "var(--brand)",
    wide: true,
    body: "Satu halaman rapi untuk menampung semua tautanmu, lengkap dengan pilihan tema siap pakai — tanpa perlu menyentuh kode sama sekali.",
  },
  {
    art: ShieldArt,
    label: "Proteksi",
    title: "Diperiksa sebelum diteruskan",
    tint: "var(--success)",
    wide: true,
    body: "Setiap tautan dipindai dari indikasi spam dan phishing, dan pengunjung selalu melihat tujuan aslinya lebih dulu sebelum melanjutkan.",
  },
  {
    art: CategoryArt,
    label: "Rapi",
    title: "Kategori terkelola",
    tint: "var(--info)",
    body: "Kelompokkan per kampanye atau mata kuliah, biar tidak tenggelam saat sudah ratusan.",
  },
];

const USE_CASES = [
  "Kampus", "UMKM", "Content Creator", "Event Organizer", "Startup",
  "Komunitas", "Dosen", "Toko Online", "Freelancer", "Organisasi",
];

const STEPS = [
  {
    no: "01",
    title: "Tempel tautan panjang",
    body: "Salin URL apa pun — form pendaftaran, Google Drive, katalog produk — lalu tempel ke kolom tautan.",
  },
  {
    no: "02",
    title: "Atur slug & kategori",
    body: "Tentukan nama link sesuai kebutuhan, beri judul, dan kelompokkan ke kategori yang sesuai.",
  },
  {
    no: "03",
    title: "Bagikan & pantau",
    body: "Sebar lewat QR code atau bio link, lalu lihat performanya langsung di halaman statistik.",
  },
];

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Landing page tetap tampil walau Convex sedang tidak bisa dihubungi
async function getLatestArticles() {
  try {
    return await fetchQuery(api.articles.getPublishedArticles, { limit: 3 });
  } catch {
    return [];
  }
}

export default async function Home() {
  const articles = await getLatestArticles();

  return (
    <div className="overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section className="bg-aurora relative px-6 pt-12 pb-24 lg:pt-20 lg:pb-32">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        {/* Lantai grid berperspektif di dasar hero */}
        <div
          className="grid-floor pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-40"
          aria-hidden
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* --- Kolom teks --- */}
          <div className="text-center lg:text-left">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-brand shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Tautkan duniamu dalam satu klik
              </div>
            </Reveal>

            <Reveal delay={90}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl xl:text-7xl">
                Lebih Singkat, <br />
                <span className="text-gradient-animated">Lebih Terhubung.</span>
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                Perpendek tautan, pantau performanya, dan bagikan lewat QR code —
                semuanya dari satu tempat.
              </p>
            </Reveal>

            <Reveal delay={260}>
              {/* Di mobile tombol dibuat selebar layar — target sentuh lebih besar dan barisnya rapi */}
              <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 lg:justify-start">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn-saweria group flex w-full items-center justify-center gap-2 px-8 py-4 text-base sm:w-auto sm:px-10 sm:text-lg">
                      Mulai singkat.in
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <Link href="/dashboard/links" className="w-full sm:w-auto">
                    <button className="btn-saweria group flex w-full items-center justify-center gap-2 px-8 py-4 text-base sm:w-auto sm:px-10 sm:text-lg">
                      Mulai singkat.in
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </SignedIn>

                <Link
                  href="/about"
                  className="btn-ghost w-full px-8 py-4 text-center text-base sm:w-auto"
                >
                  Pelajari dulu
                </Link>
              </div>
            </Reveal>

            <Reveal delay={340}>
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-subtle lg:justify-start">
                <Sparkles size={15} className="text-brand" />
                Gratis selamanya · Tanpa kartu kredit
              </p>
            </Reveal>
          </div>

          {/* --- Kolom mockup 3D --- */}
          <Reveal delay={200} scale={0.94} y="2.5rem" className="lg:pl-6">
            <HeroMockup />
          </Reveal>
        </div>
      </section>

      {/* ================= MARQUEE ================= */}
      <section className="border-y border-border bg-card py-8">
        <p className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-subtle">
          Dipakai untuk berbagai kebutuhan
        </p>
        <div className="marquee-mask overflow-hidden">
          {/* Daftar digandakan agar animasi -50% menghasilkan loop mulus */}
          <div className="marquee-track gap-3">
            {[...USE_CASES, ...USE_CASES].map((item, i) => (
              <span
                key={i}
                aria-hidden={i >= USE_CASES.length}
                className="shrink-0 rounded-full border border-border bg-background px-5 py-2 text-sm font-semibold text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATISTIK ================= */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div className="surface-panel rounded-2xl p-5 text-center transition-transform duration-300 hover:-translate-y-1.5">
                <p className="text-3xl font-bold text-foreground">
                  <CountUp
                    value={stat.value}
                    decimals={stat.decimals}
                    suffix={stat.suffix}
                  />
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= FITUR ================= */}
      <section className="relative border-y border-border bg-card py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mb-16 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg">
              <Zap className="h-3.5 w-3.5" />
              Fitur
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
              Semua yang bikin link lebih powerful
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Bukan cuma memendekkan — tapi mengelola, mengukur, dan membagikan.
            </p>
          </Reveal>

          <div className="scene-3d grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <Reveal
                key={feature.title}
                delay={(i % 3) * 110}
                className={feature.wide ? "lg:col-span-2" : ""}
              >
                <FeatureCard {...feature} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CARA KERJA ================= */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Tiga langkah, selesai
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              Dari tautan panjang jadi tautan siap sebar dalam waktu kurang dari satu menit.
            </p>
          </Reveal>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Garis penghubung antar langkah (desktop) */}
            <div
              className="absolute inset-x-[16%] top-9 hidden h-px bg-linear-to-r from-transparent via-border to-transparent md:block"
              aria-hidden
            />

            {STEPS.map((step, i) => (
              <Reveal key={step.no} delay={i * 140} className="relative">
                <div className="text-center">
                  <div className="mx-auto mb-6 grid h-18 w-18 place-items-center rounded-2xl border border-border bg-card text-2xl font-extrabold text-brand shadow-[var(--shadow-card)]">
                    {step.no}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 pb-24">
        <Reveal className="mx-auto max-w-5xl">
          <div className="bg-aurora relative overflow-hidden rounded-[36px] border border-border bg-card px-8 py-16 text-center">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden />
            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Siap bikin tautan pertamamu?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-muted-foreground">
                Daftar gratis, tanpa batas jumlah tautan, dan langsung dapat statistik.
              </p>

              <div className="mt-8 flex justify-center">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="btn-saweria group flex items-center gap-2 px-10 py-4 text-lg">
                      Daftar Gratis
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard/links">
                    <button className="btn-saweria group flex items-center gap-2 px-10 py-4 text-lg">
                      Buka Dashboard
                      <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= ARTIKEL TERBARU ================= */}
      {articles.length > 0 && (
        <section className="border-t border-border px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg">
                  <Newspaper className="h-3.5 w-3.5" />
                  Blog
                </span>
                <h2 className="mt-4 text-3xl font-bold text-foreground md:text-4xl">
                  Artikel Terbaru
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Tips, tutorial, dan kabar terbaru dari tim singkat.in.
                </p>
              </div>

              <Link
                href="/blog"
                className="group inline-flex shrink-0 items-center gap-2 font-semibold text-brand transition-colors hover:text-brand-hover"
              >
                Lihat semua artikel
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, i) => (
                <Reveal key={article._id} delay={i * 110}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group card-saweria flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                  >
                    <div className="relative aspect-16/9 bg-muted">
                      {article.coverImage ? (
                        <Image
                          src={article.coverImage}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Newspaper className="h-8 w-8 text-subtle" />
                        </div>
                      )}
                      {article.category && (
                        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-brand backdrop-blur-sm">
                          {article.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-2.5 p-5">
                      <h3 className="font-bold leading-snug text-foreground transition-colors group-hover:text-brand line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-subtle">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          {article.views.toLocaleString("id-ID")} dilihat
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
