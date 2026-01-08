import type { Metadata } from "next";
import { ShieldCheck, Zap, Globe, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Singkat.in",
  description: "Platform manajemen tautan modern untuk semua kebutuhan digital.",
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-[#2d3748]">
        <h1 className="text-6xl md:text-5xl font-extrabold mb-6">
          Solusi Link Pendek yang <span className="text-[#0193ff]">Simpel & Powerful.</span>
        </h1>
        <p className="text-xl text-gray-500 leading-relaxed mb-12">
          Singkat.in adalah inisiatif teknologi dari Prodi Teknologi Informasi ITTS untuk mempermudah distribusi informasi, materi akademik, dan presensi digital dalam satu tautan yang aman dan terpercaya.
        </p>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-[#0193ff] mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Aman & Privat</h3>
            <p className="text-gray-500">Kami memprioritaskan keamanan data pengguna. Sistem kami dirancang untuk mencegah spam dan tautan berbahaya.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-yellow-50 w-12 h-12 rounded-xl flex items-center justify-center text-yellow-600 mb-4">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Infrastruktur Global</h3>
            <p className="text-gray-500">Server berkinerja tinggi yang memastikan tautan Anda dapat diakses dengan cepat dari seluruh dunia.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center text-green-600 mb-4">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Analitik Real-time</h3>
            <p className="text-gray-500">Pantau performa tautan Anda, ketahui dari mana audiens berasal, dan optimalkan strategi digital Anda.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <Globe size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Terbuka untuk Umum</h3>
            <p className="text-gray-500">Siapapun bisa mendaftar. Mulai dari pelajar, UMKM, hingga korporasi. Tidak ada batasan eksklusif.</p>
          </div>
        </div>
    </div>
  );
}