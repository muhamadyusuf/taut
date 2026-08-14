import { SignOutButton } from "@clerk/nextjs";
import { ShieldAlert, LogOut } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="card-saweria max-w-md w-full p-8 flex flex-col items-center">

        {/* Icon Besar */}
        <div className="bg-danger-soft p-4 rounded-full text-danger mb-6 animate-pulse">
          <ShieldAlert size={64} />
        </div>

        {/* Pesan Error */}
        <h1 className="text-2xl font-bold text-foreground mb-2">Akses Ditolak</h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Maaf, aplikasi ini khusus untuk lingkungan internal <b>Institut Teknologi Tangerang Selatan</b>.
          <br /><br />
          Anda terdeteksi menggunakan email non-kampus. Silakan masuk kembali menggunakan email{" "}
          <span className="font-bold text-brand">@itts.ac.id</span>.
        </p>

        {/* Tombol Logout & Kembali */}
        <div className="flex flex-col w-full gap-3">
          <SignOutButton redirectUrl="/">
            <button className="w-full bg-danger hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-full transition active:scale-95 flex items-center justify-center gap-2">
              <LogOut size={18} /> Keluar &amp; Ganti Akun
            </button>
          </SignOutButton>

          <Link href="/" className="text-sm text-muted-foreground hover:text-brand mt-2 font-medium transition-colors">
            Kembali ke Halaman Utama
          </Link>
        </div>

      </div>
    </div>
  );
}
