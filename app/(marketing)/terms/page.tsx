import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat Penggunaan",
  description: "Aturan penggunaan layanan shortlink singkat.in.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-[#2d3748]">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Syarat Penggunaan</h1>
      
      <div className="prose prose-blue max-w-none space-y-8 text-gray-600">
        <h3 className="text-xl font-bold text-[#2d3748] mb-3">1. Akses Layanan</h3>
        <p>
            Layanan Singkat.in terbuka untuk umum. Pengguna dapat mendaftar menggunakan alamat email yang valid (Google, Yahoo, Email Kantor, dll) untuk mengakses fitur manajemen tautan.
        </p>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">2. Larangan Konten (Zero Tolerance)</h3>
          <p>Anda dilarang keras menggunakan layanan ini untuk memendekkan tautan yang mengarah ke:</p>
          <ul className="list-disc pl-5 space-y-2 text-red-600 font-medium">
            <li>Situs Perjudian Online atau Pornografi.</li>
            <li>Phishing, Scam, atau Malware.</li>
            <li>Ujaran kebencian, SARA, atau konten ilegal menurut hukum Indonesia.</li>
          </ul>
          <p className="mt-2 text-sm text-gray-500">
            Pelanggaran terhadap poin ini akan mengakibatkan <strong>penghapusan akun permanen</strong> dan pelaporan ke pihak akademik/berwajib.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">3. Penafian (Disclaimer)</h3>
          <p>
            Layanan ini disediakan &quot;sebagaimana adanya&quot;. Tim singkat.in tidak bertanggung jawab atas kerugian langsung atau tidak langsung yang timbul akibat penggunaan layanan, termasuk namun tidak terbatas pada gangguan server atau kehilangan data.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">4. Perubahan Ketentuan</h3>
          <p>
            Kami berhak mengubah syarat ini sewaktu-waktu. Perubahan akan berlaku efektif segera setelah diposting di halaman ini.
          </p>
        </section>
      </div>
    </div>
  );
}