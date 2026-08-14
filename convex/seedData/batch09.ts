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
    content: `<p>Kewaspadaan terhadap tautan pendek adalah hal yang sehat, bukan berlebihan. Justru karena tujuannya tidak terlihat, tautan pendek dipakai baik untuk keperluan sah maupun untuk penipuan — dan dari luar keduanya terlihat sama.</p>
<p>Berikut cara memeriksanya sebelum Anda mengambil risiko.</p>
<h2>Periksa domainnya lebih dulu</h2>
<p>Bagian sebelum garis miring adalah nama layanan. Domain yang tidak pernah Anda temui sebelumnya layak diperlakukan dengan hati-hati.</p>
<p>Perhatikan juga ejaan yang menyerupai layanan terkenal dengan satu huruf berbeda, huruf yang ditukar, atau tambahan tanda hubung. Ini teknik yang sangat umum dan sangat efektif karena mata cenderung membaca yang diharapkan, bukan yang tertulis.</p>
<h2>Perhatikan konteks pengirimnya</h2>
<ul>
<li><strong>Apakah Anda memang mengharapkan tautan ini?</strong> Tautan yang datang tanpa diminta layak lebih dicurigai.</li>
<li><strong>Apakah pengirimnya menjelaskan isi tautan</strong> sebelum mengirimkannya?</li>
<li><strong>Apakah pesan mendesak Anda bertindak cepat?</strong> Desakan waktu adalah ciri paling konsisten dari penipuan.</li>
<li><strong>Apakah pesan meminta data pribadi, kode verifikasi, atau pembayaran?</strong></li>
<li><strong>Apakah gaya bahasanya sesuai dengan pengirim yang Anda kenal?</strong> Akun yang diretas sering terdeteksi dari perubahan gaya menulis.</li>
</ul>
<p>Poin ketiga layak ditekankan. Hampir semua penipuan mengandalkan korban yang tidak sempat berpikir. Kalau sebuah pesan membuat Anda merasa harus bertindak sekarang juga, itu justru alasan untuk berhenti sejenak.</p>
<h2>Gunakan halaman pratinjau</h2>
<p>Sebagian layanan menampilkan halaman antara yang memperlihatkan domain tujuan sebelum meneruskan.</p>
<p>Kalau layanan yang dipakai menyediakannya, halaman ini adalah kesempatan terakhir Anda memeriksa. Baca nama domainnya, dan tanyakan apakah masuk akal dengan isi pesan yang Anda terima.</p>
<h2>Tanda bahaya setelah mendarat</h2>
<p>Kalau setelah diteruskan Anda mendapati halaman yang meminta kata sandi, kode verifikasi, atau data kartu — berhenti.</p>
<p>Layanan yang sah tidak pernah meminta kode verifikasi lewat tautan yang dikirim orang lain. Kode verifikasi dirancang untuk memastikan bahwa <em>Anda</em> yang sedang masuk, bukan untuk dibagikan kepada siapa pun.</p>
<p>Perhatikan juga alamat halaman tujuan. Halaman palsu sering meniru tampilan persis sampai ke detail terkecil, tapi tidak bisa meniru nama domainnya.</p>
<h2>Kalau terlanjur mengklik</h2>
<p>Mengklik saja umumnya belum berbahaya, selama Anda tidak memasukkan data apa pun atau mengunduh berkas.</p>
<p>Langkah yang perlu diambil:</p>
<ul>
<li>Tutup halaman tanpa mengisi apa pun.</li>
<li>Kalau sempat memasukkan kata sandi, segera ganti kata sandi itu di tempat aslinya — bukan lewat tautan tadi.</li>
<li>Kalau sempat memberikan kode verifikasi, hubungi layanan terkait secepatnya.</li>
<li>Kalau mengunduh berkas, jangan buka dan hapus.</li>
</ul>
<h2>Melindungi orang di sekitar Anda</h2>
<p>Kelompok yang paling sering menjadi korban umumnya adalah yang paling jarang mendapat penjelasan.</p>
<p>Menjelaskan tanda-tanda ini kepada anggota keluarga yang kurang terbiasa dengan teknologi jauh lebih berguna daripada sekadar melarang mereka mengklik apa pun — larangan tanpa pemahaman akan dilanggar begitu ada pesan yang terasa penting.</p>`,
  },
  {
    title: "Modus Penipuan Lewat Link Pendek dan Cara Menghindarinya",
    slug: "modus-penipuan-link-pendek",
    category: "Keamanan",
    tags: ["penipuan", "keamanan", "edukasi"],
    excerpt:
      "Mengenali polanya jauh lebih efektif daripada menghafal daftar tautan berbahaya yang selalu berganti.",
    content: `<p>Penipuan berbasis tautan terus berganti bentuk — nama pengirim baru, cerita baru, tampilan baru. Tapi polanya sangat stabil dan hampir tidak berubah selama bertahun-tahun.</p>
<p>Mengenali pola membuat Anda terlindungi bahkan dari modus yang belum pernah Anda dengar, dan itu jauh lebih berguna daripada menghafal daftar yang selalu ketinggalan.</p>
<h2>Pola yang berulang</h2>
<ul>
<li><strong>Hadiah yang tidak pernah Anda ikuti.</strong> Pemberitahuan menang undian dari program yang tidak pernah Anda daftari.</li>
<li><strong>Pemberitahuan paket bermasalah.</strong> Mengaku dari jasa pengiriman, meminta biaya tambahan lewat tautan.</li>
<li><strong>Peringatan akun akan diblokir.</strong> Memanfaatkan kepanikan agar korban tidak sempat memeriksa.</li>
<li><strong>Tawaran pekerjaan bergaji tinggi</strong> dengan syarat yang sangat ringan.</li>
<li><strong>Undangan yang tampak dari kenalan</strong> dari akun yang sudah diretas.</li>
<li><strong>Tagihan atau denda</strong> yang harus dibayar segera untuk menghindari konsekuensi.</li>
</ul>
<h2>Benang merahnya</h2>
<p>Hampir semuanya menggabungkan tiga unsur:</p>
<ul>
<li>Sesuatu yang sangat menggiurkan atau sangat menakutkan.</li>
<li>Batas waktu yang mendesak.</li>
<li>Permintaan agar Anda bertindak lewat tautan, alih-alih lewat aplikasi resmi.</li>
</ul>
<p>Ketika ketiganya muncul bersamaan, kecurigaan hampir selalu beralasan. Unsur ketiga adalah yang paling menentukan — layanan sah tidak keberatan Anda mengakses lewat aplikasi resmi mereka.</p>
<h2>Kebiasaan tunggal yang paling melindungi</h2>
<p>Jangan pernah mengakses akun penting lewat tautan dari pesan. Buka aplikasi atau ketik alamatnya sendiri.</p>
<p>Kebiasaan ini menggugurkan sebagian besar modus yang ada, karena hampir semua penipuan bergantung pada korban yang mengikuti tautan mereka. Kalau Anda selalu masuk lewat jalur sendiri, halaman palsu tidak pernah punya kesempatan.</p>
<p>Untuk pemberitahuan yang mengaku dari lembaga resmi, hubungi lembaga itu lewat nomor yang Anda cari sendiri — bukan nomor yang tercantum di pesan.</p>
<h2>Kenapa tautan pendek dipakai penipu</h2>
<p>Bukan karena tautan pendek berbahaya, melainkan karena ia menyembunyikan alamat tujuan yang jelas-jelas mencurigakan.</p>
<p>Alamat palsu yang panjang dan aneh akan langsung menimbulkan curiga. Setelah dipendekkan, kecurigaan itu hilang sampai korban sudah berada di halaman palsu.</p>
<p>Ini juga alasan mengapa layanan yang bertanggung jawab menyediakan halaman pratinjau — untuk mengembalikan informasi yang disembunyikan.</p>
<h2>Melindungi orang di sekitar Anda</h2>
<p>Jelaskan pola ini kepada anggota keluarga yang kurang terbiasa dengan teknologi, terutama tiga unsur benang merah di atas.</p>
<p>Pendekatan yang bekerja: minta mereka menelepon Anda setiap kali menerima pesan yang mendesak soal uang atau akun. Aturan sederhana yang bisa diikuti tanpa perlu memahami teknologi.</p>
<h2>Melaporkan</h2>
<p>Laporkan tautan penipuan ke layanan yang domainnya dipakai.</p>
<p>Layanan yang bertanggung jawab akan menonaktifkannya, dan ini melindungi calon korban berikutnya. Laporan Anda juga membantu layanan tersebut mengenali pola dan memblokir tautan serupa secara otomatis.</p>`,
  },
  {
    title: "Kenapa Halaman Pratinjau Sebelum Redirect Itu Penting",
    slug: "pentingnya-halaman-pratinjau-redirect",
    category: "Keamanan",
    tags: ["pratinjau", "keamanan", "kepercayaan"],
    excerpt:
      "Satu halaman antara yang menampilkan tujuan sebelum meneruskan mengubah keseimbangan antara kepraktisan dan rasa aman.",
    content: `<p>Kelemahan mendasar tautan pendek adalah menyembunyikan tujuan. Ini bukan cacat teknis melainkan konsekuensi langsung dari cara kerjanya — dan konsekuensi itu dimanfaatkan baik oleh pengguna sah maupun oleh penipu.</p>
<p>Halaman pratinjau adalah jawaban langsung terhadap kelemahan itu: ia mengembalikan informasi yang hilang tanpa membuang manfaat pemendekan.</p>
<h2>Apa yang ditampilkan halaman pratinjau</h2>
<ul>
<li>Nama domain tujuan, sehingga pengunjung tahu ke mana mereka akan dibawa.</li>
<li>Konfirmasi bahwa tautan telah melewati pemeriksaan dasar.</li>
<li>Tombol untuk melanjutkan secara sadar, bukan otomatis.</li>
<li>Identitas pemilik tautan, kalau tersedia.</li>
</ul>
<h2>Manfaat bagi pengunjung</h2>
<p>Pengunjung mendapat kesempatan membatalkan sebelum benar-benar sampai di halaman tujuan.</p>
<p>Bagi audiens yang pernah mengalami penipuan — kelompok yang jumlahnya tidak kecil di Indonesia — jeda ini adalah pembeda antara mengklik dan tidak. Mereka tidak menghindari tautan pendek karena membencinya, tapi karena tidak punya cara memverifikasi.</p>
<h2>Manfaat bagi pemilik tautan</h2>
<p>Yang sering luput disadari: halaman pratinjau justru menaikkan tingkat klik pada audiens yang belum mengenal Anda.</p>
<p>Logikanya sederhana. Sebagian orang yang tadinya membatalkan karena ragu sekarang melanjutkan karena keraguannya terjawab. Anda kehilangan sedikit kemulusan, tapi mendapat kelompok yang tadinya tidak pernah sampai sama sekali.</p>
<p>Halaman ini juga memberi ruang untuk menampilkan identitas Anda, memperkuat pengenalan merek pada setiap perjalanan tautan.</p>
<h2>Keberatan yang wajar</h2>
<p>Halaman antara menambah satu langkah, dan langkah tambahan biasanya menurunkan konversi. Ini benar — untuk audiens yang sudah percaya.</p>
<p>Karena itu, halaman pratinjau paling bernilai pada tautan yang menyasar audiens baru, dan paling mengganggu pada tautan internal untuk audiens yang sudah setia.</p>
<p>Kalau layanan Anda memungkinkan, atur per tautan alih-alih menerapkannya seragam.</p>
<h2>Menjaga agar tidak mengganggu</h2>
<p>Halaman pratinjau yang baik memenuhi beberapa syarat:</p>
<ul>
<li>Ringan dan memuat cepat.</li>
<li>Menyediakan penerusan otomatis setelah beberapa detik.</li>
<li>Menampilkan tombol lanjut yang jelas dan mudah ditekan.</li>
<li>Tidak dipenuhi iklan yang menahan pengunjung.</li>
</ul>
<p>Halaman antara yang penuh iklan dan menahan pengunjung terlalu lama akan mendapat penolakan yang sama dengan tautan mencurigakan — dan merusak tujuan awalnya.</p>
<h2>Kaitannya dengan reputasi domain</h2>
<p>Layanan yang menyediakan halaman pratinjau umumnya juga lebih ketat menindak penyalahgunaan, karena keduanya berasal dari sikap yang sama terhadap keamanan.</p>
<p>Ini penting bagi Anda sebagai pengguna: domain yang bersih dari penyalahgunaan lebih kecil kemungkinannya masuk daftar blokir platform — dan pemblokiran domain adalah risiko terbesar yang Anda tanggung saat memakai layanan pihak ketiga.</p>`,
  },
  {
    title: "Melindungi Data Pengunjung Saat Memakai Shortlink",
    slug: "melindungi-data-pengunjung-shortlink",
    category: "Keamanan",
    tags: ["privasi", "data", "tanggung jawab"],
    excerpt:
      "Anda bertanggung jawab atas pengunjung yang Anda kirim lewat tautan Anda. Ini yang perlu Anda ketahui dan sampaikan.",
    content: `<p>Ketika seseorang mengklik tautan Anda, Anda menjadi perantara antara mereka dan layanan yang Anda pilih. Tanggung jawab ini sering tidak disadari sampai muncul pertanyaan dari pengunjung — dan pada saat itu, tidak punya jawaban adalah posisi yang tidak nyaman.</p>
<h2>Data apa yang biasanya tercatat</h2>
<p>Sebagian besar layanan tautan pendek mencatat:</p>
<ul>
<li>Waktu klik.</li>
<li>Jenis perangkat dan peramban.</li>
<li>Perkiraan lokasi berdasarkan alamat jaringan.</li>
<li>Halaman asal pengunjung, pada sebagian layanan.</li>
</ul>
<p>Yang umumnya <em>tidak</em> tercatat adalah identitas pribadi, karena tidak ada proses login di sisi pengunjung. Layanan tautan pendek tahu bahwa seseorang dari Surabaya mengklik pukul sepuluh pagi, bukan siapa orangnya.</p>
<h2>Yang perlu Anda periksa</h2>
<ul>
<li>Baca kebijakan privasi layanan yang Anda pakai, khususnya berapa lama data disimpan.</li>
<li>Periksa apakah data dibagikan ke pihak ketiga.</li>
<li>Pastikan Anda bisa menghapus data ketika diperlukan.</li>
<li>Periksa di negara mana data disimpan, kalau ini relevan untuk kepatuhan Anda.</li>
</ul>
<p>Ini pemeriksaan yang hanya perlu dilakukan sekali saat memilih layanan, tapi jarang dilakukan sama sekali.</p>
<h2>Kewajiban Anda terhadap pengunjung</h2>
<p>Kalau Anda mengumpulkan data lewat tautan untuk keperluan pemasaran, sampaikan hal itu di tempat yang wajar — misalnya di halaman tujuan atau kebijakan privasi Anda sendiri.</p>
<p>Keterbukaan ini bukan hanya soal kepatuhan terhadap aturan, tapi juga soal menjaga hubungan. Pengunjung yang merasa dilacak diam-diam bereaksi jauh lebih keras daripada pengunjung yang diberi tahu sejak awal.</p>
<h2>Batas yang sebaiknya tidak dilewati</h2>
<p>Menggabungkan data klik dengan data pribadi untuk membangun profil individu tanpa sepengetahuan mereka adalah praktik yang sebaiknya dihindari — terlepas dari apakah aturan setempat mengizinkannya.</p>
<p>Analitik yang sehat berfokus pada pola kelompok: kanal mana yang bekerja, jam berapa yang ramai, materi mana yang menarik. Semuanya bisa dijawab tanpa menelusuri individu tertentu.</p>
<h2>Untuk data sensitif</h2>
<p>Kalau tautan Anda mengarah ke sesuatu yang bersifat pribadi — hasil pemeriksaan kesehatan, dokumen personal, atau informasi keuangan — pertimbangkan untuk tidak memakai pemendek pihak ketiga sama sekali.</p>
<p>Kemudahan tidak sebanding dengan risikonya dalam kasus semacam ini. Layanan pemendek akan mencatat bahwa seseorang mengakses tautan tersebut, dan meski identitasnya tidak tercatat, keberadaan catatan itu sendiri sudah menjadi risiko yang tidak perlu.</p>
<h2>Menjawab pertanyaan pengunjung</h2>
<p>Siapkan jawaban singkat bila ada yang bertanya mengapa Anda memakai tautan pendek.</p>
<p>Jawaban yang jujur dan sederhana hampir selalu diterima dengan baik: "supaya alamatnya muat di caption dan saya bisa tahu materi mana yang dibaca orang". Yang menimbulkan kecurigaan adalah jawaban yang berkelit.</p>
<h2>Mengumpulkan seperlunya</h2>
<p>Kumpulkan data yang benar-benar akan memengaruhi keputusan Anda.</p>
<p>Data yang dikumpulkan tanpa rencana penggunaan hanya menambah tanggung jawab penyimpanan tanpa memberi manfaat — dan menjadi kewajiban yang harus Anda jaga tanpa alasan yang jelas.</p>`,
  },
  {
    title: "Apa yang Terjadi pada Link Anda Saat Dilaporkan Spam",
    slug: "link-dilaporkan-spam",
    category: "Keamanan",
    tags: ["spam", "pemblokiran", "pemulihan"],
    excerpt:
      "Pemblokiran biasanya terjadi tanpa pemberitahuan. Mengenali tandanya lebih awal mempersingkat waktu pemulihan.",
    content: `<p>Tautan yang diblokir jarang disertai pemberitahuan kepada pemiliknya. Yang Anda lihat hanyalah klik yang tiba-tiba berhenti, atau laporan dari orang lain bahwa tautan Anda memunculkan peringatan.</p>
<p>Karena tidak ada notifikasi, banyak pemilik tautan baru menyadarinya setelah berminggu-minggu kehilangan trafik.</p>
<h2>Siapa yang bisa memblokir</h2>
<ul>
<li><strong>Platform media sosial</strong> — menolak tautan ditempel, atau menurunkan jangkauannya diam-diam tanpa pemberitahuan.</li>
<li><strong>Penyedia email</strong> — mengirim pesan Anda ke folder spam.</li>
<li><strong>Peramban</strong> — menampilkan halaman peringatan merah sebelum meneruskan.</li>
<li><strong>Layanan pemendek itu sendiri</strong> — menonaktifkan tautan yang dilaporkan.</li>
<li><strong>Penyedia jaringan</strong> — memblokir di tingkat operator, biasanya untuk kasus berat.</li>
</ul>
<p>Yang paling merugikan adalah jenis pertama, karena tidak terlihat sama sekali. Tautan Anda tetap berfungsi kalau diklik, tapi unggahan yang memuatnya hampir tidak ditampilkan ke siapa pun.</p>
<h2>Kenapa bisa terjadi meski konten Anda sah</h2>
<p>Penyebab yang paling sering bukan konten Anda, melainkan domain yang Anda pakai.</p>
<p>Kalau banyak penipu memakai layanan yang sama, seluruh domain bisa masuk daftar pengawasan, dan tautan Anda ikut terkena. Ini kerugian kolektif yang tidak bisa Anda cegah selain dengan memilih layanan yang aktif menindak penyalahgunaan.</p>
<p>Penyebab kedua: pola penyebaran yang menyerupai spam — tautan sama yang ditempel di puluhan grup dalam waktu singkat, atau volume klik yang melonjak tidak wajar.</p>
<h2>Tanda-tanda awal</h2>
<p>Klik yang turun drastis tanpa perubahan aktivitas promosi adalah tanda paling jelas.</p>
<p>Periksa juga dengan membuka tautan Anda dari perangkat dan jaringan yang berbeda — terutama dari jaringan seluler operator lain. Pemblokiran sering berlaku di sebagian tempat saja pada tahap awal.</p>
<p>Tanda lain: unggahan yang memuat tautan mendapat jangkauan jauh lebih rendah daripada unggahan tanpa tautan.</p>
<h2>Langkah pemulihan</h2>
<ul>
<li><strong>Periksa apakah tujuan tautan Anda masih sesuai</strong> dengan yang semula — akun yang diretas kadang mengubah tujuan tanpa Anda sadari.</li>
<li><strong>Ajukan peninjauan</strong> ke pihak yang memblokir, sertai penjelasan singkat tentang isi tautan.</li>
<li><strong>Siapkan tautan pengganti</strong> agar promosi tidak berhenti total selama menunggu.</li>
<li><strong>Kurangi kecepatan penyebaran</strong> untuk sementara.</li>
</ul>
<p>Proses peninjauan bisa memakan waktu berhari-hari, jadi menyiapkan pengganti sejak awal adalah langkah yang praktis.</p>
<h2>Pencegahan</h2>
<p>Beberapa kebiasaan yang menurunkan risiko secara signifikan:</p>
<ul>
<li>Pilih layanan yang aktif menindak penyalahgunaan di domainnya.</li>
<li>Sebar tautan secara bertahap, bukan serempak ke banyak tempat.</li>
<li>Pastikan tujuan tautan selalu sesuai dengan yang Anda janjikan.</li>
<li>Hindari memakai tautan yang sama di puluhan grup dalam satu hari.</li>
<li>Pertimbangkan domain sendiri kalau volume Anda besar.</li>
</ul>
<h2>Kalau pemblokiran tidak bisa dicabut</h2>
<p>Siapkan rencana perpindahan: ekspor daftar tautan, buat tautan baru di layanan lain, dan arahkan tautan lama ke tautan baru selama masih memungkinkan.</p>
<p>Yang tidak bisa diselamatkan adalah tautan yang sudah tercetak di materi fisik — alasan tambahan untuk memilih layanan dengan hati-hati sejak awal.</p>`,
  },
  {
    title: "Cara Menonaktifkan Link yang Salah Sebar",
    slug: "menonaktifkan-link-salah-sebar",
    category: "Keamanan",
    tags: ["kesalahan", "pemulihan", "pengelolaan"],
    excerpt:
      "Tautan yang salah kirim tidak bisa ditarik, tapi tujuannya bisa diubah — dan itu biasanya sudah cukup.",
    content: `<p>Kepanikan setelah salah mengirim tautan sering berujung pada tindakan yang justru memperburuk keadaan — biasanya menghapus sesuatu yang seharusnya diubah.</p>
<p>Yang perlu diingat: Anda mungkin tidak bisa menarik pesan, tapi Anda masih sepenuhnya mengendalikan ke mana tautan itu membawa orang.</p>
<h2>Urutan tindakan yang benar</h2>
<ul>
<li><strong>Ubah tujuannya lebih dulu.</strong> Ini langkah paling cepat dan paling berdampak. Arahkan ke halaman netral atau halaman penjelasan.</li>
<li><strong>Baru hapus pesan aslinya</strong> bila memungkinkan.</li>
<li><strong>Kirim koreksi</strong> bila tautan sudah sempat dibuka banyak orang.</li>
</ul>
<p>Urutannya penting dan sering terbalik. Menghapus pesan lebih dulu tidak menghentikan siapa pun yang sudah menyalin tautan atau menerima notifikasi — sementara mengubah tujuan berlaku seketika untuk semua orang, termasuk yang sudah menyalin.</p>
<h2>Kenapa menghapus tautan bukan pilihan terbaik</h2>
<p>Menghapus tautan sepenuhnya membuat pengunjung menemui halaman kosong tanpa penjelasan.</p>
<p>Ini justru menimbulkan lebih banyak pertanyaan dan kecurigaan. Orang yang menemui halaman kosong akan bertanya-tanya apa yang seharusnya ada di sana, dan sebagian akan bertanya kepada Anda — memperbesar perhatian pada kesalahan yang ingin Anda kecilkan.</p>
<p>Mengalihkan ke halaman yang menjelaskan situasi secara singkat jauh lebih baik.</p>
<h2>Kalau tautan berisi hal sensitif</h2>
<p>Untuk dokumen yang tidak seharusnya tersebar, mengubah tujuan tautan saja tidak cukup.</p>
<p>Cabut juga izin akses pada dokumen aslinya. Orang yang sudah membuka mungkin telah menyalin alamat asli dari bilah pencarian browser mereka — dan alamat itu tetap berfungsi meski tautan pendeknya sudah dialihkan.</p>
<p>Langkah lengkapnya: ubah tujuan tautan, cabut akses dokumen, lalu periksa apakah ada salinan yang sudah diunduh dan perlu ditindaklanjuti.</p>
<h2>Menilai dampaknya</h2>
<p>Periksa jumlah klik yang terjadi antara pengiriman dan perbaikan.</p>
<p>Angka ini menentukan seberapa besar koreksi yang perlu Anda kirim. Kalau hanya beberapa klik, koreksi personal ke orang bersangkutan lebih baik daripada pengumuman umum yang justru menarik perhatian pada kesalahan.</p>
<p>Kalau kliknya banyak, pengumuman terbuka yang singkat dan jelas lebih baik daripada membiarkan orang bingung.</p>
<h2>Menulis koreksi yang baik</h2>
<ul>
<li>Sebutkan apa yang salah tanpa penjelasan berlebihan.</li>
<li>Berikan tautan yang benar.</li>
<li>Kalau ada yang perlu dilakukan penerima, sebutkan dengan jelas.</li>
<li>Jangan berlebihan meminta maaf — itu memperbesar kesan masalahnya.</li>
</ul>
<h2>Mencegah terulang</h2>
<p>Sebagian besar kasus salah sebar berasal dari menyalin tautan yang mirip.</p>
<p>Judul internal yang jelas dan berbeda satu sama lain adalah pencegahan paling sederhana. Kalau Anda punya tiga tautan bernama "promo", kesalahan hanya soal waktu.</p>
<p>Kebiasaan kedua yang membantu: selalu buka tautan sekali sebelum mengirim, bahkan untuk tautan yang Anda yakin benar.</p>`,
  },
  {
    title: "Etika Melacak Klik: Batas antara Analitik dan Privasi",
    slug: "etika-melacak-klik",
    category: "Keamanan",
    tags: ["etika", "privasi", "analitik"],
    excerpt:
      "Kemampuan mengukur tidak otomatis berarti kepantasan mengukur. Ada garis yang sebaiknya tidak dilewati.",
    content: `<p>Alat analitik modern bisa mencatat jauh lebih banyak daripada yang sebenarnya dibutuhkan. Pertanyaannya bukan apa yang bisa diukur, melainkan apa yang pantas diukur — dan pertanyaan itu jarang diajukan karena tidak ada yang memaksa Anda mengajukannya.</p>
<h2>Pengukuran yang wajar</h2>
<ul>
<li>Jumlah klik pada sebuah tautan.</li>
<li>Pola waktu klik dalam bentuk agregat.</li>
<li>Perbandingan performa antarkanal.</li>
<li>Jenis perangkat secara umum, untuk keperluan penyesuaian tampilan.</li>
<li>Perkiraan sebaran geografis pada tingkat kota atau provinsi.</li>
</ul>
<p>Semua ini berfokus pada pola kelompok dan tidak menyingkap identitas siapa pun. Anda bisa menjelaskannya kepada pengunjung tanpa merasa canggung.</p>
<h2>Yang mulai memasuki wilayah abu-abu</h2>
<p>Membuat tautan berbeda untuk setiap individu penerima, lalu mencatat siapa yang membuka dan siapa yang tidak.</p>
<p>Praktik ini umum dalam pemasaran email dan secara teknis sah, tetapi penerima jarang menyadarinya. Kalau Anda melakukannya, sampaikan dalam kebijakan Anda — dan pertimbangkan apakah informasi yang didapat sepadan dengan risiko kepercayaan bila diketahui.</p>
<h2>Yang sebaiknya tidak dilakukan</h2>
<ul>
<li>Melacak individu tertentu tanpa sepengetahuannya untuk keperluan pribadi.</li>
<li>Menggabungkan data klik dengan data pribadi dari sumber lain untuk membangun profil.</li>
<li>Menggunakan tautan pelacak dalam percakapan pribadi untuk memeriksa apakah seseorang membaca pesan Anda.</li>
<li>Membagikan data klik individu kepada pihak lain.</li>
</ul>
<p>Kategori ketiga layak ditegaskan secara khusus: memakai tautan pelacak dalam hubungan personal untuk mengawasi seseorang adalah penyalahgunaan, terlepas dari alasannya dan terlepas dari hubungan Anda dengan orang tersebut.</p>
<h2>Prinsip yang bisa dipegang</h2>
<p>Kalau Anda tidak nyaman menjelaskan apa yang Anda ukur kepada orang yang diukur, kemungkinan besar Anda sudah melewati batas.</p>
<p>Uji sederhana ini menyelesaikan sebagian besar keraguan tanpa perlu membaca peraturan. Rasa canggung saat membayangkan menjelaskannya adalah sinyal yang cukup andal.</p>
<h2>Mengumpulkan seperlunya</h2>
<p>Kumpulkan data yang benar-benar akan memengaruhi keputusan Anda.</p>
<p>Tanyakan sebelum mengaktifkan pelacakan tambahan: keputusan apa yang akan saya ambil berbeda karena data ini? Kalau tidak ada jawabannya, data itu hanya menambah tanggung jawab penyimpanan tanpa manfaat.</p>
<h2>Menghapus yang tidak diperlukan</h2>
<p>Data lama yang tidak lagi Anda pakai sebaiknya dihapus, bukan disimpan karena "siapa tahu berguna".</p>
<p>Data yang tidak ada tidak bisa bocor, tidak bisa disalahgunakan, dan tidak perlu dijaga. Ini bentuk pengelolaan risiko yang paling sederhana dan paling sering diabaikan.</p>
<h2>Ketika bekerja untuk klien</h2>
<p>Kalau Anda mengelola tautan untuk pihak lain, sepakati sejak awal siapa yang memiliki datanya dan apa yang boleh dilakukan terhadapnya.</p>
<p>Kejelasan di awal mencegah perselisihan saat kerja sama berakhir — dan menentukan apakah Anda boleh menyimpan data tersebut setelahnya.</p>`,
  },
  {
    title: "Menghindari Link Kedaluwarsa di Materi Cetak",
    slug: "menghindari-link-kedaluwarsa-cetak",
    category: "Keamanan",
    tags: ["cetak", "perawatan", "praktik terbaik"],
    excerpt:
      "Brosur yang dicetak hari ini akan ditemukan orang tiga tahun lagi. Tautan di dalamnya perlu disiapkan untuk itu.",
    content: `<p>Materi cetak punya umur yang jauh lebih panjang dari perkiraan pembuatnya. Buku panduan tersimpan di laci bertahun-tahun. Brosur terselip di antara dokumen. Kemasan produk bertahan di rak sampai kedaluwarsa, lalu di lemari pembeli lebih lama lagi.</p>
<p>Semua itu bisa ditemukan dan diklik kapan saja — sering pada saat Anda sudah lupa bahwa materi itu pernah ada.</p>
<h2>Prinsip dasarnya</h2>
<p>Jangan pernah mencetak tautan yang tujuannya tidak bisa Anda ubah.</p>
<p>Ini berarti selalu memakai tautan pendek dinamis — tidak pernah alamat asli yang panjang, dan tidak pernah kode QR statis. Aturan ini tidak punya pengecualian untuk materi cetak.</p>
<h2>Memilih tujuan yang tahan lama</h2>
<ul>
<li><strong>Arahkan ke halaman yang perannya tetap</strong>, bukan ke halaman berisi informasi bertanggal.</li>
<li><strong>Hindari mengarahkan ke akun media sosial tertentu</strong> — platform bisa berubah aturan atau ditinggalkan.</li>
<li><strong>Hindari dokumen di layanan pihak ketiga</strong> yang bisa berpindah atau berubah izin aksesnya.</li>
<li><strong>Pilih halaman yang Anda kendalikan sendiri</strong> sebagai perantara bila memungkinkan.</li>
</ul>
<p>Prinsipnya: semakin sedikit pihak yang harus tetap ada agar tautan Anda berfungsi, semakin panjang umurnya.</p>
<h2>Menyiapkan halaman penadah</h2>
<p>Untuk tautan yang tujuannya pasti kedaluwarsa — misalnya promo musiman atau pendaftaran acara — siapkan halaman penadah sejak awal.</p>
<p>Halaman ini menjelaskan bahwa program tersebut sudah berakhir, kapan berakhirnya, dan menawarkan sesuatu yang masih berlaku. Pengunjung yang terlambat tetap mendapat sesuatu alih-alih kekecewaan.</p>
<p>Satu halaman penadah bisa melayani puluhan tautan lama sekaligus.</p>
<h2>Membuat jadwal peninjauan</h2>
<p>Catat semua tautan yang tercetak di materi fisik dalam satu daftar terpisah, lengkap dengan keterangan:</p>
<ul>
<li>Di materi mana tautan itu muncul.</li>
<li>Berapa banyak yang dicetak.</li>
<li>Ke mana disebarkan.</li>
<li>Kapan terakhir diperiksa.</li>
</ul>
<p>Tinjau daftar ini setiap enam bulan dan pastikan setiap tujuan masih hidup dan relevan.</p>
<h2>Menandai yang paling kritis</h2>
<p>Tautan yang tercetak dalam jumlah besar atau di materi mahal layak mendapat perhatian ekstra.</p>
<p>Prioritaskan pemeriksaannya, karena dampak kerusakannya paling besar dan paling sulit diperbaiki. Tautan di sepuluh ribu kemasan lebih penting daripada tautan di lima puluh brosur.</p>
<h2>Mendokumentasikan untuk penerus</h2>
<p>Kalau Anda meninggalkan posisi atau organisasi, serahkan daftar ini kepada penerus secara eksplisit.</p>
<p>Tautan yatim yang tidak diketahui siapa pemiliknya adalah penyebab paling umum materi cetak lama berakhir sebagai tautan mati — bukan karena tidak ada yang peduli, tapi karena tidak ada yang tahu tautan itu ada.</p>
<h2>Kalau terlanjur ada tautan mati</h2>
<p>Kalau Anda menemukan bahwa materi cetak lama mengarah ke halaman mati, jangan biarkan.</p>
<p>Selama tautannya masih di bawah kendali Anda, alihkan ke halaman penjelasan. Biaya perbaikannya nol, dan manfaatnya berlaku untuk setiap orang yang menemukan materi itu di masa depan.</p>`,
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
<p>Tautan Anda tersebar di kemasan, brosur, unggahan lama, dan tanda tangan email. Semua itu terus mengirim pengunjung setiap hari.</p>
<p>Dan pengunjung mempercayainya — karena berasal dari Anda. Kepercayaan yang Anda bangun bertahun-tahun justru menjadi yang membuat serangan ini efektif.</p>
<p>Perubahan tujuan tidak akan terlihat di mana pun sampai ada yang melapor. Tidak ada notifikasi, tidak ada tanda visual, dan tautannya tetap terlihat normal.</p>
<h2>Langkah dasar yang wajib</h2>
<ul>
<li><strong>Aktifkan verifikasi dua langkah.</strong> Ini pelindung tunggal paling efektif dan paling sering diabaikan.</li>
<li><strong>Gunakan kata sandi unik</strong> yang tidak dipakai di layanan lain.</li>
<li><strong>Periksa perangkat yang sedang masuk</strong> secara berkala dan keluarkan yang tidak dikenali.</li>
<li><strong>Amankan email pemulihan.</strong> Email adalah kunci induk; kalau ia jatuh, semua ikut jatuh.</li>
</ul>
<p>Poin terakhir sering dilupakan. Verifikasi dua langkah di akun tautan tidak berarti banyak kalau email pemulihannya masih memakai kata sandi lama tanpa perlindungan tambahan.</p>
<h2>Untuk akun yang dipakai bersama</h2>
<p>Hindari berbagi satu kata sandi antaranggota tim.</p>
<p>Kalau layanan mendukung akses per pengguna, gunakan itu — selain lebih aman, Anda juga mendapat riwayat siapa mengubah apa. Kalau tidak mendukung, minimal ganti kata sandi setiap kali ada anggota yang keluar dari tim.</p>
<p>Dan jangan pernah membagikan kata sandi lewat pesan yang tidak terenkripsi atau menuliskannya di dokumen bersama.</p>
<h2>Memantau perubahan</h2>
<p>Sesekali buka beberapa tautan utama Anda dari perangkat yang tidak login dan pastikan tujuannya masih benar.</p>
<p>Pemeriksaan lima menit ini mendeteksi masalah jauh lebih cepat daripada menunggu laporan dari pengunjung — dan pengunjung yang menemui halaman berbahaya biasanya tidak melapor, mereka hanya berhenti mempercayai Anda.</p>
<h2>Menyiapkan cadangan</h2>
<p>Simpan daftar pasangan slug dan tujuan di luar dashboard, diperbarui setiap beberapa bulan.</p>
<p>Kalau terjadi sesuatu, daftar ini memungkinkan Anda memulihkan konfigurasi dengan cepat alih-alih menyusun ulang dari ingatan — dan ingatan hampir selalu tidak lengkap untuk ratusan tautan.</p>
<h2>Kalau terjadi</h2>
<ul>
<li>Segera ganti kata sandi dan keluarkan semua sesi aktif.</li>
<li>Periksa dan perbaiki tujuan setiap tautan satu per satu.</li>
<li>Periksa apakah ada tautan baru yang dibuat tanpa sepengetahuan Anda.</li>
<li>Umumkan kepada audiens bila ada kemungkinan mereka sempat diarahkan ke tempat yang salah.</li>
</ul>
<p>Langkah terakhir terasa berat, tapi diam justru lebih merugikan. Audiens yang mengetahui dari Anda akan memaafkan; yang mengetahui sendiri setelah dirugikan tidak.</p>`,
  },
  {
    title: "Kebijakan Konten Shortlink: Apa yang Boleh dan Tidak",
    slug: "kebijakan-konten-shortlink",
    category: "Keamanan",
    tags: ["kebijakan", "aturan", "tanggung jawab"],
    excerpt:
      "Memahami batasan layanan mencegah tautan Anda dinonaktifkan di tengah kampanye yang sedang berjalan.",
    content: `<p>Setiap layanan tautan pendek memiliki aturan tentang apa yang boleh ditautkan. Aturan ini sering dianggap birokrasi yang mempersulit, padahal fungsinya justru melindungi seluruh pengguna.</p>
<p>Alasannya: kalau domain layanan masuk daftar blokir karena penyalahgunaan, semua pengguna terkena dampaknya — termasuk Anda yang tidak melanggar apa pun.</p>
<h2>Yang umumnya dilarang di semua layanan</h2>
<ul>
<li>Halaman yang meniru layanan lain untuk mencuri data.</li>
<li>Penyebaran perangkat lunak berbahaya.</li>
<li>Konten yang melanggar hukum setempat.</li>
<li>Skema penipuan berkedok investasi atau hadiah.</li>
<li>Konten yang melanggar hak cipta pihak lain.</li>
<li>Materi yang mengeksploitasi anak.</li>
</ul>
<p>Kategori-kategori ini tidak punya wilayah abu-abu di layanan mana pun.</p>
<h2>Wilayah yang bergantung pada layanan</h2>
<p>Beberapa kategori diperlakukan berbeda antarlayanan:</p>
<ul>
<li>Tautan afiliasi dalam jumlah besar.</li>
<li>Konten dewasa.</li>
<li>Promosi perjudian.</li>
<li>Tautan menuju halaman berisi banyak iklan pengalih.</li>
<li>Tautan menuju layanan pemendek lain.</li>
</ul>
<p>Periksa ketentuan layanan yang Anda pakai sebelum menjalankan kampanye besar di kategori ini. Menemukan larangan setelah tautan tersebar adalah situasi yang mahal.</p>
<h2>Kenapa pelanggaran satu pengguna berdampak ke semua</h2>
<p>Ketika sebuah domain dipakai berulang kali untuk penipuan, platform dan peramban mulai memblokir seluruh domain — bukan tautan tertentu, karena memblokir per tautan tidak praktis dalam skala besar.</p>
<p>Inilah alasan layanan yang bertanggung jawab bersikap tegas. Kelonggaran berlebih akan merugikan pengguna yang sah, dan pada akhirnya menghancurkan layanan itu sendiri.</p>
<h2>Tanggung jawab Anda sebagai pengguna</h2>
<p>Pastikan tujuan tautan sesuai dengan yang Anda janjikan dalam materi promosi.</p>
<p>Ketidaksesuaian antara janji dan tujuan adalah pemicu laporan spam yang paling sering — bahkan ketika isinya sendiri tidak melanggar apa pun. Pengguna yang merasa tertipu akan melapor, dan laporan itu diperlakukan serius terlepas dari niat Anda.</p>
<h2>Kalau tautan Anda dinonaktifkan keliru</h2>
<p>Ajukan peninjauan disertai penjelasan singkat tentang isi tautan dan konteks penggunaannya.</p>
<p>Layanan yang dikelola dengan baik menyediakan jalur banding, dan kesalahan penilaian otomatis cukup umum terjadi — terutama untuk tautan yang polanya menyerupai penyalahgunaan meski isinya sah.</p>
<p>Sertakan bukti pendukung kalau ada: tangkapan layar halaman tujuan, penjelasan tentang usaha Anda, atau riwayat penggunaan sebelumnya.</p>
<h2>Menjaga hubungan jangka panjang</h2>
<p>Riwayat penggunaan yang bersih membuat penyelesaian jadi lebih cepat bila suatu saat ada masalah.</p>
<p>Ini nilai yang tidak terlihat sampai Anda membutuhkannya — dan pada saat itu, selisih antara akun dengan riwayat baik dan akun tanpa riwayat bisa berarti selisih berhari-hari dalam pemulihan.</p>
<h2>Membaca ketentuan sebelum berkomitmen</h2>
<p>Luangkan sepuluh menit membaca ketentuan layanan sebelum menjadikannya bagian dari operasional Anda. Perhatikan khususnya bagian tentang penonaktifan akun dan hak Anda atas data.</p>`,
  },
];
