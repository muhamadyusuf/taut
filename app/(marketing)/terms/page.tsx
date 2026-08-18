import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? {
        title: "Terms of Use",
        description: "Rules and conditions for using the Singkat.in service.",
      }
    : {
        title: "Syarat Penggunaan",
        description: "Aturan dan ketentuan penggunaan layanan Singkat.in.",
      };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).terms;
  const dateStr = new Date().toLocaleDateString(locale === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8">{t.title}</h1>

      <div className="prose max-w-none space-y-8 text-muted-foreground">
        <section>
          <p className="lead italic text-muted-foreground">
            {t.lastUpdated}: {dateStr}
          </p>
          <p>{t.intro}</p>
        </section>

        {locale === "en" ? (
          <>
            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">1. Service Description</h3>
              <p>
                Singkat.in provides URL shortening, QR code generation, and mini website (Microsite) creation services for personal, academic, and business purposes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">2. User Accounts</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>This service is open to the public. You may register with a valid Google account or email.</li>
                <li>You are fully responsible for the security of your account and any activity that occurs under it.</li>
                <li>We reserve the right to disable accounts suspected of suspicious activity or rule violations.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">3. Prohibited Content (Zero Tolerance)</h3>
              <p>You are strictly prohibited from using this service (Shortlink or Microsite) to distribute content containing:</p>
              <ul className="list-disc pl-5 space-y-2 text-danger font-medium">
                <li>Online gambling, pornography, or other adult content.</li>
                <li>Phishing, scams, malware, or malicious links.</li>
                <li>Hate speech, discrimination, terrorism, or content illegal under Indonesian law.</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                Violating this point will result in <strong>permanent account deletion without warning</strong> and reporting to authorities if necessary.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">4. Microsite Feature & Drive Integration</h3>
              <p>When using the Microsite builder integrated with Google Drive, you understand and agree that:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Public Permission:</strong> When you select an image file from Google Drive through our app, you grant our system permission to change that file&apos;s access setting to <em>&quot;Public/Anyone with the link&quot;</em>. This is required so the image can appear on your Microsite website.</li>
                <li><strong>Content Responsibility:</strong> You are fully responsible for the files you select. Make sure you own the copyright or have permission to display those images publicly.</li>
                <li><strong>Ownership:</strong> You retain full ownership of your files in Google Drive. Singkat.in does not claim ownership of user content.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">5. Disclaimer</h3>
              <p>
                This service is provided &quot;as is&quot;. The Singkat.in team is not liable for any direct or indirect losses arising from the use of the service, including but not limited to server disruptions, data loss, or user errors in managing their Google Drive file permissions.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">6. Changes to Terms</h3>
              <p>
                We reserve the right to change these terms at any time. Changes take effect immediately upon posting on this page. Your continued use of the service after such changes constitutes your agreement to the new terms.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">7. Contact</h3>
              <p>
                If you have questions about these Terms of Use, please contact us at: <strong>muhamadyusufaa@gmail.com</strong>.
              </p>
            </section>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
