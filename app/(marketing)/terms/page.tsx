import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat Penggunaan",
  description: "Aturan dan ketentuan penggunaan layanan Singkat.in.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Syarat Penggunaan</h1>
      
      <div className="prose max-w-none space-y-8 text-muted-foreground">
        <section>
          <p className="lead italic text-muted-foreground">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p>
            Selamat datang di Singkat.in. Dengan mengakses atau menggunakan layanan kami, Anda setuju untuk terikat oleh Syarat Penggunaan ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">1. Deskripsi Layanan</h3>
          <p>
            Singkat.in menyediakan layanan pemendekan tautan (URL Shortener), pembuatan kode QR, dan pembuatan halaman web mini (Microsite) untuk keperluan personal, akademik, maupun bisnis.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">2. Akun Pengguna</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Layanan ini terbuka untuk umum. Anda dapat mendaftar menggunakan akun Google atau email yang valid.</li>
            <li>Anda bertanggung jawab penuh atas keamanan akun Anda dan segala aktivitas yang terjadi di bawah akun tersebut.</li>
            <li>Kami berhak menonaktifkan akun yang terindikasi melakukan aktivitas mencurigakan atau melanggar aturan.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">3. Larangan Konten (Zero Tolerance)</h3>
          <p>Anda dilarang keras menggunakan layanan ini (baik Shortlink maupun Microsite) untuk menyebarkan konten yang berisi:</p>
          <ul className="list-disc pl-5 space-y-2 text-danger font-medium">
            <li>Perjudian Online, Pornografi, atau konten dewasa lainnya.</li>
            <li>Phishing, Scam, Malware, atau tautan berbahaya.</li>
            <li>Ujaran kebencian, SARA, terorisme, atau konten ilegal menurut hukum Republik Indonesia.</li>
          </ul>
          <p className="mt-2 text-sm text-muted-foreground">
            Pelanggaran terhadap poin ini akan mengakibatkan <strong>penghapusan akun permanen tanpa peringatan</strong> dan pelaporan ke pihak berwajib jika diperlukan.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">4. Penggunaan Fitur Microsite & Integrasi Drive</h3>
          <p>Saat menggunakan fitur Microsite builder yang terintegrasi dengan Google Drive, Anda memahami dan menyetujui bahwa:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Izin Publik:</strong> Saat Anda memilih file gambar dari Google Drive melalui aplikasi kami, Anda memberikan izin kepada sistem kami untuk mengubah pengaturan akses file tersebut menjadi <em>&quot;Public/Anyone with the link&quot;</em>. Hal ini diperlukan agar gambar dapat muncul di website Microsite Anda.</li>
            <li><strong>Tanggung Jawab Konten:</strong> Anda bertanggung jawab penuh atas file yang Anda pilih. Pastikan Anda memiliki hak cipta atau izin untuk menampilkan gambar tersebut secara publik.</li>
            <li><strong>Hak Milik:</strong> Anda tetap memegang hak kepemilikan penuh atas file Anda di Google Drive. Singkat.in tidak mengklaim kepemilikan atas konten pengguna.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">5. Penafian (Disclaimer)</h3>
          <p>
            Layanan ini disediakan &quot;sebagaimana adanya&quot;. Tim Singkat.in tidak bertanggung jawab atas kerugian langsung atau tidak langsung yang timbul akibat penggunaan layanan, termasuk namun tidak terbatas pada gangguan server, kehilangan data, atau kesalahan pengguna dalam mengelola izin file Google Drive mereka.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">6. Perubahan Ketentuan</h3>
          <p>
            Kami berhak mengubah syarat ini sewaktu-waktu. Perubahan akan berlaku efektif segera setelah diposting di halaman ini. Penggunaan berkelanjutan Anda atas layanan setelah perubahan tersebut merupakan persetujuan Anda terhadap syarat yang baru.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-foreground mb-3">7. Kontak</h3>
          <p>
            Jika Anda memiliki pertanyaan tentang Syarat Penggunaan ini, silakan hubungi kami melalui email: <strong>muhamadyusufaa@gmail.com</strong>.
          </p>
        </section>
      </div>
    </div>
  );
}