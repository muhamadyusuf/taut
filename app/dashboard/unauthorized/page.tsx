import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col items-center justify-center p-4 text-center">
      <div className="card-saweria max-w-md w-full p-8 flex flex-col items-center">
        
        {/* Icon Besar */}
        <div className="bg-red-50 p-4 rounded-full text-red-500 mb-6 animate-pulse">
            <ShieldAlert size={64} />
        </div>

        {/* Pesan Error */}
        <h1 className="text-2xl font-bold text-[#2d3748] mb-2">Akses Ditolak</h1>
        <p className="text-[#718096] mb-8 leading-relaxed">
          Maaf, aplikasi ini khusus untuk lingkungan internal <b>Institut Teknologi Tangerang Selatan</b>. 
          <br/><br/>
          Anda terdeteksi menggunakan email non-kampus. Silakan masuk kembali menggunakan email <span className="font-bold text-[#0193ff]">@itts.ac.id</span>.
        </p>

        {/* Tombol Logout & Kembali */}
        <div className="flex flex-col w-full gap-3">
            <SignOutButton redirectUrl="/">
                <button className="btn-saweria w-full bg-red-500 hover:bg-red-600 shadow-red-200 flex items-center justify-center gap-2">
                    <LogOut size={18} /> Keluar & Ganti Akun
                </button>
            </SignOutButton>
            
            <Link href="/" className="text-sm text-[#718096] hover:text-[#0193ff] mt-2 font-medium">
                Kembali ke Halaman Utama
            </Link>
        </div>

      </div>
    </div>
  );
}