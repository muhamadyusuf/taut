import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";
import { Link2, Zap, BarChart3, QrCode, ArrowRight, Link as LinkIcon } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard/links");
  }

  return (
    <main className="min-h-screen bg-[#f8faff] overflow-x-hidden selection:bg-[#0193ff] selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2.5 text-[#0193ff]">
            {/* Logo Icon Taut */}
            <div className="bg-[#0193ff] p-2 rounded-xl text-white transform -rotate-6 shadow-lg shadow-blue-200">
                <Link2 strokeWidth={3} size={22} />
            </div>
            {/* Nama Brand */}
            <span className="text-2xl font-bold tracking-tight text-[#2d3748]">Taut<span className="text-[#0193ff]">.id</span></span>
        </div>
        <div className="flex items-center gap-4">
            <SignInButton mode="modal">
                <button className="text-[#718096] font-medium hover:text-[#0193ff] transition px-4 py-2 hidden sm:block">
                    Masuk
                </button>
            </SignInButton>
            <SignInButton mode="modal">
                <button className="bg-white text-[#0193ff] border-2 border-[#0193ff] font-bold py-2 px-6 rounded-full hover:bg-blue-50 transition active:scale-95">
                    Daftar
                </button>
            </SignInButton>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-100/30 blur-[100px] -z-10 rounded-full mix-blend-multiply"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-full text-[#0193ff] font-semibold text-sm mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0193ff]"></span>
                </span>
                Tautkan duniamu dalam satu klik
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-[#2d3748] tracking-tight mb-6 leading-[1.1]">
                Lebih Singkat, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0193ff] to-[#00c6ff]">Lebih Terhubung.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#718096] mb-10 max-w-2xl mx-auto leading-relaxed">
                Platform shortlink andalan kreator Indonesia. Kelola tautan, pantau audiens, dan bagikan karyamu lewat <b>Taut</b>.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <SignInButton mode="modal">
                    <button className="btn-saweria text-lg px-10 py-4 shadow-[0_10px_30px_rgba(1,147,255,0.4)] flex items-center gap-2 group">
                        Mulai Tautkan 
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </SignInButton>
            </div>

            {/* Mockup Preview / Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto opacity-80">
                {[
                    { label: "Tautan Aktif", val: "10K+" },
                    { label: "Klik Terhitung", val: "5.2M" },
                    { label: "Pengguna", val: "2.5K" },
                    { label: "Uptime", val: "99.9%" }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-50">
                        <p className="text-2xl font-bold text-[#2d3748]">{stat.val}</p>
                        <p className="text-xs text-[#718096] uppercase font-bold tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-[#2d3748] mb-4">Fitur Taut</h2>
                <p className="text-[#718096]">Semua yang kamu butuhkan agar link lebih powerful.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <div className="p-8 rounded-[30px] bg-[#f8faff] hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-[0_10px_40px_rgba(1,147,255,0.1)] transition-all duration-300 group">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-[#0193ff] mb-6 group-hover:scale-110 transition-transform">
                        <LinkIcon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-[#2d3748] mb-3">Custom Slug</h3>
                    <p className="text-[#718096] leading-relaxed">
                        Bikin link yang mudah diingat seperti <span className="text-[#0193ff] font-medium">taut.id/namamu</span>. Personal branding jadi lebih kuat.
                    </p>
                </div>

                {/* Feature 2 */}
                <div className="p-8 rounded-[30px] bg-[#f8faff] hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-[0_10px_40px_rgba(1,147,255,0.1)] transition-all duration-300 group">
                    <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform">
                        <BarChart3 size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-[#2d3748] mb-3">Analitik Lengkap</h3>
                    <p className="text-[#718096] leading-relaxed">
                        Data adalah kekuatan. Pantau jumlah klik secara real-time untuk memaksimalkan jangkauanmu.
                    </p>
                </div>

                {/* Feature 3 */}
                <div className="p-8 rounded-[30px] bg-[#f8faff] hover:bg-white border border-transparent hover:border-blue-100 hover:shadow-[0_10px_40px_rgba(1,147,255,0.1)] transition-all duration-300 group">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                        <QrCode size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-[#2d3748] mb-3">QR Code Instan</h3>
                    <p className="text-[#718096] leading-relaxed">
                        Cetak QR Code untuk keperluan offline. Tempel di poster, kartu nama, atau merchandise.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#f8faff] py-12 border-t border-blue-50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-[#0193ff]">
                <Link2 strokeWidth={3} size={20} />
                <span className="font-bold text-[#2d3748]">Taut<span className="text-[#0193ff]">.id</span></span>
            </div>
            <p className="text-sm text-[#718096]">
                © 2024 Taut. Dibuat dengan cinta untuk kreator.
            </p>
            <div className="flex gap-6 text-sm font-medium text-[#718096]">
                <a href="#" className="hover:text-[#0193ff]">Privacy</a>
                <a href="#" className="hover:text-[#0193ff]">Terms</a>
            </div>
        </div>
      </footer>
    </main>
  );
}