import type { Metadata } from "next";
import { ShieldCheck, Zap, Globe, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Singkat.in",
  description: "Platform manajemen tautan modern untuk semua kebutuhan digital.",
};

const VALUES = [
  {
    icon: ShieldCheck,
    tone: "bg-brand-soft text-brand",
    title: "Aman & Privat",
    body: "Kami memprioritaskan keamanan data pengguna. Sistem kami dirancang untuk mencegah spam dan tautan berbahaya.",
  },
  {
    icon: Zap,
    tone: "bg-warning-soft text-warning",
    title: "Infrastruktur Global",
    body: "Server berkinerja tinggi yang memastikan tautan Anda dapat diakses dengan cepat dari seluruh dunia.",
  },
  {
    icon: BarChart3,
    tone: "bg-success-soft text-success",
    title: "Analitik Real-time",
    body: "Pantau performa tautan Anda, ketahui dari mana audiens berasal, dan optimalkan strategi digital Anda.",
  },
  {
    icon: Globe,
    tone: "bg-info-soft text-info",
    title: "Terbuka untuk Umum",
    body: "Siapapun bisa mendaftar. Mulai dari pelajar, UMKM, hingga korporasi. Tidak ada batasan eksklusif.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
        Solusi Link Pendek yang{" "}
        <span className="text-gradient-brand">Simpel &amp; Powerful.</span>
      </h1>
      <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-3xl">
        Singkat.in adalah inisiatif teknologi dari Prodi Teknologi Informasi ITTS
        untuk mempermudah distribusi informasi, materi akademik, dan presensi
        digital dalam satu tautan yang aman dan terpercaya.
      </p>

      {/* Values Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {VALUES.map((value) => (
          <div
            key={value.title}
            className="card-saweria p-8 hover:-translate-y-1 transition-transform"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${value.tone}`}
            >
              <value.icon size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{value.title}</h3>
            <p className="text-muted-foreground">{value.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
