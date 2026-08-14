import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import {
  BarChart3,
  QrCode,
  ArrowRight,
  Link as LinkIcon,
  CalendarDays,
  Eye,
  Newspaper,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const metadata: Metadata = {
  title: "Shortlink Gratis Terbaik dengan Analitik & QR Code",
  description: "Ubah link panjang menjadi singkat.in/namamu. Platform perpendek link gratis dengan fitur statistik lengkap, kustomisasi slug, dan QR code otomatis.",
  alternates: {
    canonical: "https://singkat.in", // Mencegah duplikat konten
  },
};

const STATS = [
  { label: "Tautan Aktif", val: "10K+" },
  { label: "Klik Terhitung", val: "5.2M" },
  { label: "Pengguna", val: "2.5K" },
  { label: "Uptime", val: "99.9%" },
];

const FEATURES = [
  {
    icon: LinkIcon,
    title: "Custom Slug",
    tone: "text-brand bg-brand-soft",
    body: (
      <>
        Bikin link yang mudah diingat seperti{" "}
        <span className="text-brand font-medium">singkat.in/namamu</span>. Personal
        branding jadi lebih kuat.
      </>
    ),
  },
  {
    icon: BarChart3,
    title: "Analitik Lengkap",
    tone: "text-warning bg-warning-soft",
    body: "Data adalah kekuatan. Pantau jumlah klik secara real-time untuk memaksimalkan jangkauanmu.",
  },
  {
    icon: QrCode,
    title: "QR Code Instan",
    tone: "text-info bg-info-soft",
    body: "Cetak QR Code untuk keperluan offline. Tempel di poster, kartu nama, atau merchandise.",
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
    <div>
      {/* --- HERO SECTION --- */}
      <section className="bg-aurora relative overflow-hidden pt-12 pb-20 lg:pt-24 lg:pb-32 px-6">
        {/* Grid halus di belakang hero, ikut warna border tema */}
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full text-brand font-semibold text-sm mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
            </span>
            Tautkan duniamu dalam satu klik
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]">
            Lebih Singkat, <br />
            <span className="text-gradient-brand">Lebih Terhubung.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Perpendek tautan, pantau performanya, dan bagikan lewat QR code —
            semuanya dari satu tempat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-saweria text-lg px-10 py-4 flex items-center gap-2 group">
                  Mulai singkat.in
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard/links">
                <button className="btn-saweria text-lg px-10 py-4 flex items-center gap-2 group">
                  Mulai singkat.in
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </SignedIn>
          </div>

          {/* Mockup Preview / Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="surface-panel p-4 rounded-2xl transition-transform hover:-translate-y-1"
              >
                <p className="text-2xl font-bold text-foreground">{stat.val}</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-card border-y border-border relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Fitur singkat.in
            </h2>
            <p className="text-muted-foreground">
              Semua yang kamu butuhkan agar link lebih powerful.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-8 rounded-[30px] bg-background border border-border hover:border-brand hover:shadow-[0_10px_40px_-15px_var(--brand)] transition-all duration-300 group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.tone}`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- ARTIKEL TERBARU --- */}
      {articles.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-soft-fg">
                  <Newspaper className="h-3.5 w-3.5" />
                  Blog
                </span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold text-foreground">
                  Artikel Terbaru
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Tips, tutorial, dan kabar terbaru dari tim singkat.in.
                </p>
              </div>

              <Link
                href="/blog"
                className="group inline-flex shrink-0 items-center gap-2 font-semibold text-brand hover:text-brand-hover transition-colors"
              >
                Lihat semua artikel
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article._id}
                  href={`/blog/${article.slug}`}
                  className="group card-saweria flex flex-col overflow-hidden"
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
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
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
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
