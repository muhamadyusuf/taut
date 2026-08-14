import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Bagaimana kami mengelola, melindungi, dan menggunakan data pengguna termasuk integrasi Google Drive.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Kebijakan Privasi</h1>
      
      <div className="prose max-w-none space-y-8 text-muted-foreground">
        <section>
          <p className="lead italic text-muted-foreground">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p>
            Singkat.in menghormati privasi Anda. Kebijakan ini menjelaskan bagaimana Singkat.in (&quot;kami&quot;) mengumpulkan, menggunakan, dan melindungi informasi Anda saat menggunakan layanan kami, termasuk fitur Microsite dan integrasi dengan layanan pihak ketiga seperti Google Drive.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">1. Informasi yang Kami Kumpulkan</h3>
          <p className="mb-2">Kami mengumpulkan jenis informasi berikut untuk menyediakan layanan kami:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Informasi Akun:</strong> Saat mendaftar, kami menyimpan nama, alamat email, dan foto profil Anda melalui layanan autentikasi (Google Auth/Clerk).</li>
            <li><strong>Data Tautan:</strong> Kami menyimpan URL asli, judul tautan, dan tautan pendek (slug) yang Anda buat.</li>
            <li><strong>Integrasi Google Drive (Microsite):</strong> Jika Anda menggunakan fitur Microsite dan memilih untuk mengambil gambar dari Google Drive, kami akan meminta akses untuk melihat dan mengelola file <strong>yang Anda pilih secara spesifik</strong>. Kami <strong>tidak</strong> membaca, menyalin, atau menyimpan file lain di Google Drive Anda yang tidak Anda pilih.</li>
            <li><strong>Data Analitik:</strong> Kami mengumpulkan data non-pribadi terkait pengunjung tautan (alamat IP yang dianonimkan, tipe perangkat, browser) untuk keperluan statistik.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">2. Penggunaan Informasi</h3>
          <p>Kami menggunakan informasi tersebut untuk:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Menyediakan layanan pemendekan tautan dan pembuatan QR Code.</li>
            <li><strong>Fitur Microsite:</strong> Mengakses file gambar dari Google Drive yang Anda pilih dan mengubah pengaturan izin file tersebut menjadi <em>&quot;Public/Anyone with the link&quot;</em> agar gambar tersebut dapat tampil dan dilihat oleh pengunjung di halaman Microsite publik Anda.</li>
            <li>Memantau statistik penggunaan untuk keperluan operasional dan pengembangan layanan.</li>
            <li>Mencegah penyalahgunaan layanan (spam, phishing, atau konten ilegal).</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">3. Kepatuhan Terhadap Kebijakan Data Pengguna Google</h3>
          <div className="bg-brand-soft p-4 rounded-lg border border-border text-sm">
            <p className="mb-2 font-semibold">
              Pernyataan Penggunaan Terbatas (Limited Use Disclosure):
            </p>
            <p>
              Penggunaan dan transfer informasi yang diterima oleh Singkat.in dari Google APIs ke aplikasi lain mana pun akan mematuhi <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-brand underline">Kebijakan Data Pengguna Layanan Google API</a>, termasuk persyaratan <em>Limited Use</em>.
            </p>
            <p className="mt-2">
              Kami tidak membagikan data Google pengguna kepada pihak ketiga (seperti model AI/ML) kecuali jika diperlukan untuk menyediakan fungsi pengguna yang jelas atau untuk mematuhi hukum yang berlaku.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">4. Keamanan Data</h3>
          <p>
            Kami menerapkan langkah-langkah keamanan teknis standar industri. Autentikasi dikelola oleh Clerk, dan database dikelola menggunakan infrastruktur Convex yang aman. Kami tidak menyimpan token akses Google Drive Anda secara permanen di database kami; token hanya disimpan sementara di sesi browser lokal (LocalStorage) Anda untuk memfasilitasi pemilihan file.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">5. Hak Pengguna & Kontak</h3>
          <p className="mb-4">
            Anda berhak untuk mengakses, mengoreksi, atau menghapus data Anda kapan saja. Anda juga dapat mencabut akses Singkat.in ke Google Drive Anda kapan saja melalui halaman <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-brand underline">Pengaturan Keamanan Google</a>.
          </p>
          <p>
            Jika memiliki pertanyaan mengenai kebijakan ini, silakan hubungi kami di: <br/>
            <strong>Email:</strong> muhamadyusufaa@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}