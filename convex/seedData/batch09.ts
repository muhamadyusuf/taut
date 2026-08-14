import { SeedArticle } from "./types";

// Pilar 9 — Keamanan & privasi. Menjawab keraguan paling umum terhadap
// tautan pendek dan membangun kepercayaan terhadap layanan.
export const BATCH_09: SeedArticle[] = [
  {
    title: "Cara Mengecek Keamanan Sebuah Shortlink Sebelum Diklik",
    slug: "mengecek-keamanan-shortlink",
    category: "Keamanan",
    tags: ["keamanan", "penipuan", "panduan"],
    excerpt:
      "Tautan pendek menyembunyikan tujuannya. Beberapa cara sederhana bisa mengungkapnya sebelum Anda mengklik.",
    content: `<p>Kewaspadaan terhadap tautan pendek adalah hal yang sehat. Justru karena tujuannya tidak terlihat, tautan pendek dipakai baik untuk keperluan sah maupun untuk penipuan. Berikut cara memeriksanya.</p>
<h2>Periksa domainnya lebih dulu</h2>
<p>Bagian sebelum garis miring adalah nama layanan. Domain yang tidak pernah Anda temui sebelumnya layak diperlakukan dengan hati-hati. Perhatikan juga ejaan yang menyerupai layanan terkenal dengan satu huruf berbeda — ini teknik yang umum dipakai.</p>
<h2>Perhatikan konteks pengirimnya</h2>
<ul>
<li>Apakah Anda memang mengharapkan tautan ini?</li>
<li>Apakah pengirimnya menjelaskan isi tautan sebelum mengirimkannya?</li>
<li>Apakah pesan mendesak Anda bertindak cepat? Desakan waktu adalah ciri paling konsisten dari penipuan.</li>
<li>Apakah pesan meminta data pribadi, kode verifikasi, atau pembayaran?</li>
</ul>
<h2>Gunakan halaman pratinjau</h2>
<p>Sebagian layanan menampilkan halaman antara yang memperlihatkan domain tujuan sebelum meneruskan. Kalau layanan yang dipakai menyediakannya, halaman ini adalah kesempatan terakhir Anda memeriksa sebelum benar-benar sampai.</p>
<h2>Tanda bahaya setelah mendarat</h2>
<p>Kalau setelah diteruskan Anda mendapati halaman yang meminta kata sandi, kode verifikasi, atau data kartu — berhenti. Layanan sah tidak pernah meminta kode verifikasi lewat tautan yang dikirim orang lain.</p>
<p>Perhatikan juga alamat halaman tujuan. Halaman palsu sering meniru tampilan persis tapi tidak bisa meniru nama domainnya.</p>
<h2>Kalau terlanjur mengklik</h2>
<p>Mengklik saja umumnya belum berbahaya selama Anda tidak memasukkan data apa pun atau mengunduh berkas. Tutup halaman, jangan isi apa pun, dan kalau sempat memasukkan kata sandi, segera ganti kata sandi itu di tempat aslinya.</p>`,
  },
  {
    title: "Modus Penipuan Lewat Link Pendek dan Cara Menghindarinya",
    slug: "modus-penipuan-link-pendek",
    category: "Keamanan",
    tags: ["penipuan", "keamanan", "edukasi"],
    excerpt:
      "Mengenali polanya jauh lebih efektif daripada menghafal daftar tautan berbahaya yang selalu berganti.",
    content: `<p>Penipuan berbasis tautan terus berganti bentuk, tetapi polanya sangat stabil. Mengenali pola membuat Anda terlindungi bahkan dari modus yang belum pernah Anda dengar.</p>
<h2>Pola yang berulang</h2>
<ul>
<li><strong>Hadiah yang tidak pernah Anda ikuti.</strong> Pemberitahuan menang undian dari program yang tidak pernah Anda daftari.</li>
<li><strong>Pemberitahuan paket bermasalah.</strong> Mengaku dari jasa pengiriman, meminta biaya tambahan lewat tautan.</li>
<li><strong>Peringatan akun akan diblokir.</strong> Memanfaatkan kepanikan agar korban tidak sempat memeriksa.</li>
<li><strong>Tawaran pekerjaan bergaji tinggi</strong> dengan syarat yang sangat ringan.</li>
<li><strong>Undangan yang tampak dari kenalan</strong> dari akun yang sudah diretas.</li>
</ul>
<h2>Benang merahnya</h2>
<p>Hampir semuanya menggabungkan tiga unsur: sesuatu yang menggiurkan atau menakutkan, batas waktu yang mendesak, dan permintaan agar Anda bertindak lewat tautan alih-alih lewat aplikasi resmi. Ketika ketiganya muncul bersamaan, kecurigaan hampir selalu beralasan.</p>
<h2>Kebiasaan yang melindungi</h2>
<p>Jangan pernah mengakses akun penting lewat tautan dari pesan. Buka aplikasi atau ketik alamatnya sendiri. Kebiasaan tunggal ini menggugurkan sebagian besar modus yang ada.</p>
<p>Untuk pemberitahuan yang mengaku dari lembaga resmi, hubungi lembaga itu lewat nomor yang Anda cari sendiri — bukan nomor yang tercantum di pesan.</p>
<h2>Melindungi orang di sekitar Anda</h2>
<p>Kelompok yang paling sering menjadi korban umumnya adalah yang paling jarang mendapat penjelasan. Menjelaskan pola ini kepada anggota keluarga yang kurang terbiasa dengan teknologi jauh lebih berguna daripada sekadar melarang mereka mengklik apa pun.</p>
<h2>Melaporkan</h2>
<p>Laporkan tautan penipuan ke layanan yang domainnya dipakai. Layanan yang bertanggung jawab akan menonaktifkannya, dan ini melindungi calon korban berikutnya.</p>`,
  },
  {
    title: "Kenapa Halaman Pratinjau Sebelum Redirect Itu Penting",
    slug: "pentingnya-halaman-pratinjau-redirect",
    category: "Keamanan",
    tags: ["pratinjau", "keamanan", "kepercayaan"],
    excerpt:
      "Satu halaman antara yang menampilkan tujuan sebelum meneruskan mengubah keseimbangan antara kepraktisan dan rasa aman.",
    content: `<p>Kelemahan mendasar tautan pendek adalah menyembunyikan tujuan. Halaman pratinjau adalah jawaban langsung terhadap kelemahan itu: ia mengembalikan informasi yang hilang tanpa membuang manfaat pemendekan.</p>
<h2>Apa yang ditampilkan halaman pratinjau</h2>
<ul>
<li>Nama domain tujuan, sehingga pengunjung tahu ke mana mereka akan dibawa.</li>
<li>Konfirmasi bahwa tautan telah melewati pemeriksaan dasar.</li>
<li>Tombol untuk melanjutkan secara sadar, bukan otomatis.</li>
</ul>
<h2>Manfaat bagi pengunjung</h2>
<p>Pengunjung mendapat kesempatan membatalkan sebelum benar-benar sampai. Bagi audiens yang pernah mengalami penipuan — kelompok yang jumlahnya tidak kecil di Indonesia — jeda ini adalah pembeda antara mengklik dan tidak.</p>
<h2>Manfaat bagi pemilik tautan</h2>
<p>Yang sering luput disadari: halaman pratinjau justru menaikkan tingkat klik pada audiens yang belum mengenal Anda. Keraguan yang tadinya membuat mereka membatalkan sekarang terjawab, dan mereka melanjutkan.</p>
<p>Halaman ini juga memberi ruang untuk menampilkan identitas Anda, memperkuat pengenalan merek pada tiap perjalanan tautan.</p>
<h2>Keberatan yang wajar</h2>
<p>Halaman antara menambah satu langkah, dan langkah tambahan biasanya menurunkan konversi. Ini benar untuk audiens yang sudah percaya. Karena itu, halaman pratinjau paling bernilai pada tautan yang menyasar audiens baru, dan paling mengganggu pada tautan internal untuk audiens yang sudah setia.</p>
<h2>Menjaga agar tidak mengganggu</h2>
<p>Halaman pratinjau sebaiknya ringan, memuat cepat, dan menyediakan penerusan otomatis setelah beberapa detik. Halaman antara yang penuh iklan dan menahan pengunjung terlalu lama akan mendapat penolakan yang sama dengan tautan mencurigakan.</p>`,
  },
  {
    title: "Melindungi Data Pengunjung Saat Memakai Shortlink",
    slug: "melindungi-data-pengunjung-shortlink",
    category: "Keamanan",
    tags: ["privasi", "data", "tanggung jawab"],
    excerpt:
      "Anda bertanggung jawab atas pengunjung yang Anda kirim lewat tautan Anda. Ini yang perlu Anda ketahui dan sampaikan.",
    content: `<p>Ketika seseorang mengklik tautan Anda, Anda menjadi perantara antara mereka dan layanan yang Anda pilih. Tanggung jawab ini sering tidak disadari sampai muncul pertanyaan dari pengunjung.</p>
<h2>Data apa yang biasanya tercatat</h2>
<p>Sebagian besar layanan tautan pendek mencatat waktu klik, jenis perangkat, dan perkiraan lokasi berdasarkan alamat jaringan. Sebagian mencatat halaman asal pengunjung. Yang umumnya tidak tercatat adalah identitas pribadi, karena tidak ada proses login di sisi pengunjung.</p>
<h2>Yang perlu Anda periksa</h2>
<ul>
<li>Baca kebijakan privasi layanan yang Anda pakai, khususnya bagian tentang berapa lama data disimpan.</li>
<li>Periksa apakah data dibagikan ke pihak ketiga.</li>
<li>Pastikan Anda bisa menghapus data ketika diperlukan.</li>
</ul>
<h2>Kewajiban Anda terhadap pengunjung</h2>
<p>Kalau Anda mengumpulkan data lewat tautan untuk keperluan pemasaran, sampaikan hal itu di tempat yang wajar — misalnya di halaman tujuan. Keterbukaan ini bukan hanya soal kepatuhan, tapi juga soal menjaga hubungan.</p>
<h2>Batas yang sebaiknya tidak dilewati</h2>
<p>Menggabungkan data klik dengan data pribadi untuk membangun profil individu tanpa sepengetahuan mereka adalah praktik yang sebaiknya dihindari, terlepas dari apakah aturan setempat mengizinkannya. Analitik yang sehat berfokus pada pola kelompok, bukan pada penelusuran perorangan.</p>
<h2>Untuk data sensitif</h2>
<p>Kalau tautan Anda mengarah ke sesuatu yang bersifat pribadi — hasil pemeriksaan, dokumen personal, atau informasi kesehatan — pertimbangkan untuk tidak memakai pemendek pihak ketiga sama sekali. Kemudahan tidak sebanding dengan risikonya dalam kasus semacam ini.</p>
<h2>Menjawab pertanyaan pengunjung</h2>
<p>Siapkan jawaban singkat bila ada yang bertanya mengapa Anda memakai tautan pendek. Jawaban yang jujur dan sederhana hampir selalu diterima dengan baik.</p>`,
  },
  {
    title: "Apa yang Terjadi pada Link Anda Saat Dilaporkan Spam",
    slug: "link-dilaporkan-spam",
    category: "Keamanan",
    tags: ["spam", "pemblokiran", "pemulihan"],
    excerpt:
      "Pemblokiran biasanya terjadi tanpa pemberitahuan. Mengenali tandanya lebih awal mempersingkat waktu pemulihan.",
    content: `<p>Tautan yang diblokir jarang disertai pemberitahuan kepada pemiliknya. Yang Anda lihat hanyalah klik yang tiba-tiba berhenti, atau laporan dari orang lain bahwa tautan Anda memunculkan peringatan.</p>
<h2>Siapa yang bisa memblokir</h2>
<ul>
<li><strong>Platform media sosial</strong> — menolak tautan ditempel atau menurunkan jangkauannya diam-diam.</li>
<li><strong>Penyedia email</strong> — mengirim pesan Anda ke folder spam.</li>
<li><strong>Peramban</strong> — menampilkan halaman peringatan merah sebelum meneruskan.</li>
<li><strong>Layanan pemendek itu sendiri</strong> — menonaktifkan tautan yang dilaporkan.</li>
</ul>
<h2>Kenapa bisa terjadi meski konten Anda sah</h2>
<p>Penyebab yang paling sering bukan konten Anda, melainkan domain yang Anda pakai. Kalau banyak penipu memakai layanan yang sama, seluruh domain bisa masuk daftar pengawasan, dan tautan Anda ikut terkena.</p>
<p>Penyebab lain: pola penyebaran yang menyerupai spam, seperti tautan sama yang ditempel di puluhan grup dalam waktu singkat.</p>
<h2>Tanda-tanda awal</h2>
<p>Klik yang turun drastis tanpa perubahan aktivitas promosi adalah tanda paling jelas. Periksa juga dengan membuka tautan Anda dari perangkat dan jaringan yang berbeda.</p>
<h2>Langkah pemulihan</h2>
<ul>
<li>Periksa apakah tujuan tautan Anda masih sesuai dengan yang semula.</li>
<li>Ajukan peninjauan ke pihak yang memblokir, sertakan penjelasan singkat tentang isi tautan.</li>
<li>Sementara menunggu, siapkan tautan pengganti agar promosi tidak berhenti total.</li>
</ul>
<h2>Pencegahan</h2>
<p>Pilih layanan yang aktif menindak penyalahgunaan di domainnya. Sebar tautan secara bertahap, bukan serempak ke banyak tempat. Dan pastikan tujuan tautan selalu sesuai dengan yang Anda janjikan.</p>`,
  },
  {
    title: "Cara Menonaktifkan Link yang Salah Sebar",
    slug: "menonaktifkan-link-salah-sebar",
    category: "Keamanan",
    tags: ["kesalahan", "pemulihan", "pengelolaan"],
    excerpt:
      "Tautan yang salah kirim tidak bisa ditarik, tapi tujuannya bisa diubah — dan itu biasanya sudah cukup.",
    content: `<p>Kepanikan setelah salah mengirim tautan sering berujung pada tindakan yang justru memperburuk. Yang perlu diingat: Anda mungkin tidak bisa menarik pesan, tapi Anda masih mengendalikan ke mana tautan itu membawa orang.</p>
<h2>Urutan tindakan yang benar</h2>
<ul>
<li><strong>Ubah tujuannya lebih dulu.</strong> Ini langkah paling cepat dan paling berdampak. Arahkan ke halaman netral atau halaman penjelasan.</li>
<li><strong>Baru hapus pesan aslinya</strong> bila memungkinkan.</li>
<li><strong>Kirim koreksi</strong> bila tautan sudah sempat dibuka banyak orang.</li>
</ul>
<p>Urutannya penting. Menghapus pesan lebih dulu tidak menghentikan siapa pun yang sudah menyalin tautan, sementara mengubah tujuan berlaku seketika untuk semua orang.</p>
<h2>Kenapa menghapus tautan bukan pilihan terbaik</h2>
<p>Menghapus tautan sepenuhnya membuat pengunjung menemui halaman kosong tanpa penjelasan. Ini justru menimbulkan lebih banyak pertanyaan dan kecurigaan. Mengalihkan ke halaman yang menjelaskan situasi jauh lebih baik.</p>
<h2>Kalau tautan berisi hal sensitif</h2>
<p>Untuk dokumen yang tidak seharusnya tersebar, mengubah tujuan tautan saja tidak cukup — cabut juga izin akses pada dokumen aslinya. Orang yang sudah membuka mungkin telah menyalin alamat asli dari bilah pencarian.</p>
<h2>Menilai dampaknya</h2>
<p>Periksa jumlah klik yang terjadi antara pengiriman dan perbaikan. Angka ini menentukan seberapa besar koreksi yang perlu Anda kirim. Kalau hanya beberapa klik, koreksi personal ke orang bersangkutan lebih baik daripada pengumuman umum yang justru menarik perhatian.</p>
<h2>Mencegah terulang</h2>
<p>Sebagian besar kasus salah sebar berasal dari menyalin tautan yang mirip. Judul internal yang jelas dan berbeda satu sama lain adalah pencegahan paling sederhana.</p>`,
  },
  {
    title: "Etika Melacak Klik: Batas antara Analitik dan Privasi",
    slug: "etika-melacak-klik",
    category: "Keamanan",
    tags: ["etika", "privasi", "analitik"],
    excerpt:
      "Kemampuan mengukur tidak otomatis berarti kepantasan mengukur. Ada garis yang sebaiknya tidak dilewati.",
    content: `<p>Alat analitik modern bisa mencatat jauh lebih banyak daripada yang sebenarnya dibutuhkan. Pertanyaannya bukan apa yang bisa diukur, melainkan apa yang pantas diukur.</p>
<h2>Pengukuran yang wajar</h2>
<ul>
<li>Jumlah klik pada sebuah tautan.</li>
<li>Pola waktu klik dalam bentuk agregat.</li>
<li>Perbandingan performa antarkanal.</li>
<li>Jenis perangkat secara umum, untuk keperluan penyesuaian tampilan.</li>
</ul>
<p>Semua ini berfokus pada pola kelompok dan tidak menyingkap identitas siapa pun.</p>
<h2>Yang mulai memasuki wilayah abu-abu</h2>
<p>Membuat tautan berbeda untuk setiap individu penerima, lalu mencatat siapa yang membuka dan siapa yang tidak. Praktik ini umum dalam pemasaran email, tetapi penerima jarang menyadarinya. Kalau Anda melakukannya, sampaikan dalam kebijakan Anda.</p>
<h2>Yang sebaiknya tidak dilakukan</h2>
<ul>
<li>Melacak individu tertentu tanpa sepengetahuannya untuk keperluan pribadi.</li>
<li>Menggabungkan data klik dengan data pribadi dari sumber lain untuk membangun profil.</li>
<li>Menggunakan tautan pelacak dalam percakapan pribadi untuk memeriksa apakah seseorang membaca pesan Anda.</li>
</ul>
<p>Kategori terakhir ini layak ditegaskan: memakai tautan pelacak dalam hubungan personal untuk mengawasi seseorang adalah penyalahgunaan, terlepas dari alasannya.</p>
<h2>Prinsip yang bisa dipegang</h2>
<p>Kalau Anda tidak nyaman menjelaskan apa yang Anda ukur kepada orang yang diukur, kemungkinan besar Anda sudah melewati batas. Uji sederhana ini menyelesaikan sebagian besar keraguan.</p>
<h2>Mengumpulkan seperlunya</h2>
<p>Kumpulkan data yang benar-benar akan memengaruhi keputusan Anda. Data yang dikumpulkan tanpa rencana penggunaan hanya menambah tanggung jawab penyimpanan tanpa memberi manfaat.</p>`,
  },
  {
    title: "Menghindari Link Kedaluwarsa di Materi Cetak",
    slug: "menghindari-link-kedaluwarsa-cetak",
    category: "Keamanan",
    tags: ["cetak", "perawatan", "praktik terbaik"],
    excerpt:
      "Brosur yang dicetak hari ini akan ditemukan orang tiga tahun lagi. Tautan di dalamnya perlu disiapkan untuk itu.",
    content: `<p>Materi cetak punya umur yang jauh lebih panjang dari perkiraan pembuatnya. Buku panduan tersimpan di laci, brosur terselip di antara dokumen, dan kemasan produk bertahan di rak. Semua bisa ditemukan bertahun-tahun kemudian.</p>
<h2>Prinsip dasarnya</h2>
<p>Jangan pernah mencetak tautan yang tujuannya tidak bisa Anda ubah. Ini berarti selalu memakai tautan pendek dinamis, tidak pernah alamat asli yang panjang dan tidak pernah kode QR statis.</p>
<h2>Memilih tujuan yang tahan lama</h2>
<ul>
<li>Arahkan ke halaman yang perannya tetap, bukan ke halaman berisi informasi bertanggal.</li>
<li>Hindari mengarahkan ke akun media sosial tertentu — platform bisa berubah atau ditinggalkan.</li>
<li>Hindari mengarahkan ke dokumen di layanan pihak ketiga yang bisa berpindah atau berubah izin aksesnya.</li>
</ul>
<h2>Menyiapkan halaman penadah</h2>
<p>Untuk tautan yang tujuannya pasti kedaluwarsa — misalnya promo musiman — siapkan halaman penadah yang menjelaskan bahwa program tersebut sudah berakhir, disertai penawaran yang masih berlaku. Pengunjung yang terlambat tetap mendapat sesuatu alih-alih kekecewaan.</p>
<h2>Membuat jadwal peninjauan</h2>
<p>Catat semua tautan yang tercetak di materi fisik dalam satu daftar terpisah, lengkap dengan keterangan di materi mana ia muncul. Tinjau daftar ini setiap enam bulan dan pastikan setiap tujuan masih hidup dan relevan.</p>
<h2>Menandai yang paling kritis</h2>
<p>Tautan yang tercetak dalam jumlah besar atau di materi mahal layak mendapat perhatian ekstra. Prioritaskan pemeriksaannya, karena dampak kerusakannya paling besar dan paling sulit diperbaiki.</p>
<h2>Mendokumentasikan untuk penerus</h2>
<p>Kalau Anda meninggalkan posisi atau organisasi, serahkan daftar ini kepada penerus. Tautan yatim yang tidak diketahui siapa pemiliknya adalah penyebab paling umum materi cetak lama berakhir sebagai tautan mati.</p>`,
  },
  {
    title: "Keamanan Akun: Melindungi Dashboard Link Anda",
    slug: "keamanan-akun-dashboard-link",
    category: "Keamanan",
    tags: ["akun", "keamanan", "praktik terbaik"],
    excerpt:
      "Akun yang diretas berarti seluruh tautan Anda bisa diarahkan ke mana pun tanpa Anda sadari.",
    content: `<p>Risiko yang jarang dipikirkan: kalau akun pengelola tautan Anda diambil alih, penyerang tidak perlu meretas apa pun lagi. Cukup mengubah tujuan seluruh tautan Anda, dan setiap materi promosi yang sudah tersebar berubah menjadi jalur menuju halaman berbahaya.</p>
<h2>Kenapa dampaknya besar</h2>
<p>Tautan Anda tersebar di kemasan, brosur, dan unggahan lama. Semua itu terus mengirim pengunjung, dan pengunjung mempercayainya karena berasal dari Anda. Perubahan tujuan tidak akan terlihat sampai ada yang melapor.</p>
<h2>Langkah dasar yang wajib</h2>
<ul>
<li><strong>Aktifkan verifikasi dua langkah.</strong> Ini pelindung tunggal paling efektif.</li>
<li><strong>Gunakan kata sandi unik</strong> yang tidak dipakai di layanan lain.</li>
<li><strong>Periksa perangkat yang sedang masuk</strong> secara berkala dan keluarkan yang tidak dikenali.</li>
<li><strong>Amankan email pemulihan.</strong> Email adalah kunci induk; kalau ia jatuh, semua ikut jatuh.</li>
</ul>
<h2>Untuk akun yang dipakai bersama</h2>
<p>Hindari berbagi satu kata sandi antaranggota tim. Kalau layanan mendukung akses per pengguna, gunakan itu. Kalau tidak, minimal ganti kata sandi setiap kali ada anggota yang keluar dari tim.</p>
<h2>Memantau perubahan</h2>
<p>Sesekali buka beberapa tautan utama Anda dari perangkat yang tidak login dan pastikan tujuannya masih benar. Pemeriksaan lima menit ini mendeteksi masalah jauh lebih cepat daripada menunggu laporan dari pengunjung.</p>
<h2>Menyiapkan cadangan</h2>
<p>Simpan daftar pasangan slug dan tujuan di luar dashboard. Kalau terjadi sesuatu, daftar ini memungkinkan Anda memulihkan konfigurasi dengan cepat alih-alih menyusun ulang dari ingatan.</p>
<h2>Kalau terjadi</h2>
<p>Segera ganti kata sandi, keluarkan semua sesi aktif, lalu periksa dan perbaiki tujuan setiap tautan satu per satu. Umumkan kepada audiens Anda bila ada kemungkinan mereka sempat diarahkan ke tempat yang salah.</p>`,
  },
  {
    title: "Kebijakan Konten Shortlink: Apa yang Boleh dan Tidak",
    slug: "kebijakan-konten-shortlink",
    category: "Keamanan",
    tags: ["kebijakan", "aturan", "tanggung jawab"],
    excerpt:
      "Memahami batasan layanan mencegah tautan Anda dinonaktifkan di tengah kampanye yang sedang berjalan.",
    content: `<p>Setiap layanan tautan pendek memiliki aturan tentang apa yang boleh ditautkan. Aturan ini ada bukan untuk mempersulit pengguna, melainkan untuk menjaga agar domain layanan tidak masuk daftar blokir — yang akan merugikan semua penggunanya sekaligus.</p>
<h2>Yang umumnya dilarang di semua layanan</h2>
<ul>
<li>Halaman yang meniru layanan lain untuk mencuri data.</li>
<li>Penyebaran perangkat lunak berbahaya.</li>
<li>Konten yang melanggar hukum setempat.</li>
<li>Skema penipuan berkedok investasi atau hadiah.</li>
<li>Konten yang melanggar hak cipta pihak lain.</li>
</ul>
<h2>Wilayah yang bergantung pada layanan</h2>
<p>Beberapa kategori diperlakukan berbeda antarlayanan: tautan afiliasi dalam jumlah besar, konten dewasa, promosi perjudian, dan tautan menuju halaman berisi banyak iklan pengalih. Periksa ketentuan layanan yang Anda pakai sebelum menjalankan kampanye besar di kategori ini.</p>
<h2>Kenapa pelanggaran satu pengguna berdampak ke semua</h2>
<p>Ketika sebuah domain dipakai berulang kali untuk penipuan, platform dan peramban mulai memblokir seluruh domain, bukan tautan tertentu. Inilah alasan layanan yang bertanggung jawab bersikap tegas — kelonggaran berlebih akan merugikan pengguna yang sah.</p>
<h2>Tanggung jawab Anda sebagai pengguna</h2>
<p>Pastikan tujuan tautan sesuai dengan yang Anda janjikan dalam materi promosi. Ketidaksesuaian antara janji dan tujuan adalah pemicu laporan spam yang paling sering, bahkan ketika isinya sendiri tidak melanggar apa pun.</p>
<h2>Kalau tautan Anda dinonaktifkan keliru</h2>
<p>Ajukan peninjauan disertai penjelasan singkat tentang isi tautan dan konteks penggunaannya. Layanan yang dikelola dengan baik menyediakan jalur banding, dan kesalahan penilaian otomatis cukup umum terjadi.</p>
<h2>Menjaga hubungan jangka panjang</h2>
<p>Riwayat penggunaan yang bersih membuat penyelesaian jadi lebih cepat bila suatu saat ada masalah. Ini nilai yang tidak terlihat sampai Anda membutuhkannya.</p>`,
  },
];
