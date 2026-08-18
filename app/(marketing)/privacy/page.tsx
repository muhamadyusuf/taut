import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return locale === "en"
    ? {
        title: "Privacy Policy",
        description:
          "How we manage, protect, and use user data, including the Google Drive integration.",
      }
    : {
        title: "Kebijakan Privasi",
        description: "Bagaimana kami mengelola, melindungi, dan menggunakan data pengguna termasuk integrasi Google Drive.",
      };
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).privacy;
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
              <h3 className="text-xl font-bold text-foreground mb-3">1. Information We Collect</h3>
              <p className="mb-2">We collect the following types of information to provide our services:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Account Information:</strong> When you sign up, we store your name, email address, and profile picture via our authentication provider (Google Auth/Clerk).</li>
                <li><strong>Link Data:</strong> We store the original URL, link title, and short link (slug) that you create.</li>
                <li><strong>Google Drive Integration (Microsite):</strong> If you use the Microsite feature and choose to pick images from Google Drive, we request access to view and manage only the files <strong>you specifically select</strong>. We do <strong>not</strong> read, copy, or store any other files in your Google Drive that you did not select.</li>
                <li><strong>Analytics Data:</strong> We collect non-personal data about link visitors (anonymized IP address, device type, browser) for statistics purposes.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">2. Use of Information</h3>
              <p>We use this information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide link-shortening and QR code generation services.</li>
                <li><strong>Microsite feature:</strong> Access image files you select from Google Drive and change their permission setting to <em>&quot;Public/Anyone with the link&quot;</em> so the images can display and be viewed by visitors on your public Microsite page.</li>
                <li>Monitor usage statistics for operational and service-development purposes.</li>
                <li>Prevent service abuse (spam, phishing, or illegal content).</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">3. Compliance with Google User Data Policy</h3>
              <div className="bg-brand-soft p-4 rounded-lg border border-border text-sm">
                <p className="mb-2 font-semibold">
                  Limited Use Disclosure:
                </p>
                <p>
                  Singkat.in&apos;s use and transfer of information received from Google APIs to any other app will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-brand underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
                </p>
                <p className="mt-2">
                  We do not share users&apos; Google data with third parties (such as AI/ML models) except when required to provide a clear user-facing function or to comply with applicable law.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">4. Data Security</h3>
              <p>
                We implement industry-standard technical security measures. Authentication is managed by Clerk, and our database runs on secure Convex infrastructure. We do not permanently store your Google Drive access token in our database; the token is only kept temporarily in your browser&apos;s local session (LocalStorage) to facilitate file selection.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold text-foreground mb-3">5. User Rights & Contact</h3>
              <p className="mb-4">
                You have the right to access, correct, or delete your data at any time. You can also revoke Singkat.in&apos;s access to your Google Drive at any time via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-brand underline">Google Security Settings</a>.
              </p>
              <p>
                If you have questions about this policy, please contact us at: <br />
                <strong>Email:</strong> muhamadyusufaa@gmail.com
              </p>
            </section>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
