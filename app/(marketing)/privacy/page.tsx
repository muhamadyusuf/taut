import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Bagaimana kami mengelola dan melindungi data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-[#2d3748]">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Kebijakan Privasi</h1>
      
      <div className="prose prose-blue max-w-none space-y-8 text-gray-600">
        <section>
          <p className="lead">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
          </p>
          <p>
            Singkat.in menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana singkat.in (&quot;kami&quot;) mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan layanan kami.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">1. Informasi yang Kami Kumpulkan</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Informasi Akun:</strong> Saat mendaftar menggunakan email, kami menyimpan nama, alamat email, dan foto profil Anda melalui layanan autentikasi pihak ketiga (Clerk).</li>
            <li><strong>Data Tautan:</strong> Kami menyimpan URL asli, judul tautan, dan tautan pendek (slug) yang Anda buat.</li>
            <li><strong>Data Analitik:</strong> Kami mengumpulkan data non-pribadi terkait pengunjung tautan Anda, seperti alamat IP (dianonimkan), tipe perangkat, browser, dan lokasi geografis umum untuk keperluan statistik.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">2. Penggunaan Informasi</h3>
          <p>Kami menggunakan informasi tersebut semata-mata untuk:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menyediakan layanan pemendekan tautan dan pembuatan QR Code.</li>
            <li>Memantau statistik penggunaan untuk keperluan laporan akademik prodi.</li>
            <li>Mencegah penyalahgunaan layanan (spam, phishing, atau konten ilegal).</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">3. Keamanan Data</h3>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis yang sesuai standar industri. Autentikasi dikelola oleh Clerk yang memiliki sertifikasi keamanan tinggi, dan database dikelola menggunakan infrastruktur Convex yang aman.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-[#2d3748] mb-3">4. Hak Pengguna</h3>
          <p>
            Sebagai civitas akademika, Anda berhak untuk mengakses, mengoreksi, atau menghapus tautan yang telah Anda buat kapan saja melalui Dashboard aplikasi.
          </p>
        </section>
      </div>
    </div>
  );
}