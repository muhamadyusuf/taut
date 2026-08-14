import { SeedArticle } from "./types";

// Pilar 10 — Optimasi & strategi lanjutan. Menutup kalender dengan topik untuk
// pembaca yang sudah menguasai dasar dan siap membangun sistem.
export const BATCH_10: SeedArticle[] = [
  {
    title: "Kecepatan Redirect: Kenapa Milidetik Berpengaruh pada Konversi",
    slug: "kecepatan-redirect-konversi",
    category: "Optimasi",
    tags: ["kecepatan", "konversi", "teknis"],
    excerpt:
      "Penundaan yang tidak terasa bagi Anda bisa berarti sebagian pengunjung tidak pernah sampai ke tujuan.",
    content: `<p>Waktu yang dibutuhkan sebuah pengalihan sering dianggap tidak relevan karena hitungannya milidetik. Tapi pada koneksi seluler yang tidak stabil, angka itu bisa membengkak menjadi beberapa detik — dan beberapa detik adalah waktu yang cukup untuk membatalkan.</p>
<h2>Apa yang terjadi saat tautan diklik</h2>
<p>Ada beberapa tahap: penerjemahan nama domain, pembuatan koneksi aman, pencarian tujuan di basis data, lalu pemuatan halaman tujuan. Setiap tahap menambah waktu, dan pada jaringan yang buruk setiap tahap bisa mengalami pengulangan.</p>
<h2>Yang bisa Anda kendalikan</h2>
<ul>
<li><strong>Hindari pengalihan berlapis.</strong> Setiap lapis mengulang seluruh tahapan dari awal.</li>
<li><strong>Pilih layanan dengan server yang dekat dengan audiens Anda.</strong> Jarak fisik masih berpengaruh nyata.</li>
<li><strong>Pastikan halaman tujuan ringan.</strong> Pengalihan yang cepat menjadi sia-sia bila tujuannya berat.</li>
<li><strong>Hindari pengalihan berbasis skrip.</strong> Ia menunggu seluruh halaman perantara dimuat lebih dulu.</li>
</ul>
<h2>Menguji dari kondisi nyata</h2>
<p>Uji tautan Anda dari koneksi seluler di lokasi dengan sinyal sedang, bukan dari jaringan kantor. Kondisi ini jauh lebih mewakili sebagian besar audiens Indonesia yang mengklik dari ponsel.</p>
<h2>Melihat gejalanya di data</h2>
<p>Selisih besar antara jumlah klik dan jumlah kunjungan yang tercatat di alat analitik situs sering menandakan sebagian pengunjung menyerah di tengah jalan. Kalau selisih itu melebihi empat puluh persen, kecepatan adalah tersangka pertama yang layak diperiksa.</p>
<h2>Prioritas perbaikan</h2>
<p>Perbaiki halaman tujuan lebih dulu — di sanalah biasanya sebagian besar waktu terbuang. Optimasi pengalihan baru berarti setelah tujuan Anda sendiri sudah ringan.</p>`,
  },
  {
    title: "Mengatur Kategori Link agar Dashboard Tidak Berantakan",
    slug: "mengatur-kategori-link",
    category: "Optimasi",
    tags: ["kategori", "pengelolaan", "produktivitas"],
    excerpt:
      "Sistem kategori yang baik dibuat berdasarkan cara Anda mencari, bukan berdasarkan cara Anda membuat.",
    content: `<p>Kesalahan paling umum dalam menyusun kategori adalah mengelompokkan berdasarkan bagaimana tautan dibuat, bukan berdasarkan bagaimana nanti dicari. Akibatnya sistem terasa logis di awal tapi tidak membantu saat dibutuhkan.</p>
<h2>Mulai dari pertanyaan pencarian</h2>
<p>Tuliskan pertanyaan yang biasanya muncul di kepala Anda saat mencari tautan. "Mana tautan untuk klien A?" menghasilkan kategori per klien. "Mana tautan kampanye Ramadan?" menghasilkan kategori per kampanye. Kategori terbaik adalah yang menjawab pertanyaan Anda yang paling sering.</p>
<h2>Pilih satu sumbu utama</h2>
<ul>
<li><strong>Per klien</strong> — cocok untuk agensi dan pekerja lepas.</li>
<li><strong>Per produk atau lini</strong> — cocok untuk usaha dengan beberapa lini.</li>
<li><strong>Per kampanye</strong> — cocok untuk tim pemasaran yang bekerja berbasis periode.</li>
<li><strong>Per kanal</strong> — cocok bila perbedaan platform adalah pertimbangan utama Anda.</li>
</ul>
<p>Memilih lebih dari satu sumbu menghasilkan kategori yang saling tumpang tindih dan kebingungan tentang tautan harus ditaruh di mana.</p>
<h2>Jumlah kategori yang wajar</h2>
<p>Antara lima sampai lima belas. Kurang dari lima berarti kategori terlalu luas untuk membantu. Lebih dari lima belas berarti Anda menghabiskan waktu memilih kategori alih-alih bekerja.</p>
<h2>Menangani yang tidak masuk mana pun</h2>
<p>Sediakan satu kategori umum untuk tautan yang tidak jelas tempatnya. Tanpa ini, tautan semacam itu akan dibiarkan tanpa kategori sama sekali. Tinjau isi kategori umum setiap beberapa bulan — kalau ada pola berulang di dalamnya, itu tanda perlu kategori baru.</p>
<h2>Merapikan berkala</h2>
<p>Setiap kuartal, periksa kategori yang isinya hanya satu atau dua tautan. Kategori sekecil itu biasanya lebih baik digabung.</p>`,
  },
  {
    title: "Cara Merapikan Ratusan Link Lama yang Tidak Terpakai",
    slug: "merapikan-link-lama",
    category: "Optimasi",
    tags: ["pembersihan", "arsip", "pengelolaan"],
    excerpt:
      "Membersihkan tautan lama bukan soal menghapus sebanyak mungkin, melainkan soal memutuskan mana yang masih perlu hidup.",
    content: `<p>Setelah beberapa tahun, dashboard tautan mulai menyerupai laci yang tidak pernah dibereskan. Membersihkannya terasa menakutkan karena setiap tautan mungkin masih dipakai seseorang di suatu tempat.</p>
<h2>Memilah berdasarkan klik terakhir</h2>
<p>Mulai dengan mengurutkan berdasarkan aktivitas terkini, bukan berdasarkan tanggal pembuatan. Tautan berusia tiga tahun yang masih menerima klik setiap minggu jelas lebih penting daripada tautan bulan lalu yang tidak pernah disentuh.</p>
<h2>Tiga kelompok keputusan</h2>
<ul>
<li><strong>Masih aktif diklik</strong> — pertahankan, dan pastikan tujuannya masih benar. Ini kelompok yang paling merugikan bila rusak.</li>
<li><strong>Pernah aktif tapi kini sepi</strong> — arsipkan. Ubah tujuannya ke halaman yang masih relevan, jangan dihapus.</li>
<li><strong>Tidak pernah diklik sama sekali</strong> — kandidat untuk dihapus. Biasanya sisa uji coba atau tautan yang tidak pernah jadi disebar.</li>
</ul>
<h2>Kenapa menghapus itu berisiko</h2>
<p>Tautan yang dihapus mengirim pengunjung ke halaman kosong. Kalau tautan itu ternyata tercetak di materi yang masih beredar, Anda baru akan tahu setelah ada yang mengeluh. Mengalihkan selalu lebih aman daripada menghapus.</p>
<h2>Menyiapkan halaman penadah</h2>
<p>Buat satu halaman yang menjelaskan bahwa tautan yang dituju sudah tidak aktif, disertai jalur menuju informasi terkini. Arahkan seluruh tautan arsip ke sana. Satu halaman menyelesaikan ratusan tautan sekaligus.</p>
<h2>Menjadikannya kebiasaan</h2>
<p>Setelah pembersihan besar pertama, sisihkan tiga puluh menit setiap kuartal. Pembersihan rutin yang kecil tidak pernah terasa berat, sementara menunda sampai bertahun-tahun menciptakan pekerjaan yang selalu ditunda lagi.</p>
<h2>Mencatat keputusannya</h2>
<p>Simpan catatan tautan mana yang diarsipkan dan kapan. Kalau suatu saat ada yang menanyakan, Anda punya jawaban.</p>`,
  },
  {
    title: "Menyiapkan Link untuk Kampanye Musiman dan Hari Besar",
    slug: "link-kampanye-musiman",
    category: "Optimasi",
    tags: ["musiman", "kampanye", "perencanaan"],
    excerpt:
      "Kampanye musiman berulang setiap tahun. Menyiapkan tautan yang bisa dipakai ulang menghemat pekerjaan berulang.",
    content: `<p>Ramadan, tahun ajaran baru, akhir tahun — kampanye musiman datang pada waktu yang sudah diketahui. Justru karena bisa diprediksi, persiapannya sering ditunda sampai mendekati hari.</p>
<h2>Dua pendekatan penamaan</h2>
<p>Ada dua pilihan, masing-masing dengan konsekuensinya:</p>
<ul>
<li><strong>Slug bertahun</strong> seperti <em>ramadan2026</em> — memberi data terpisah per tahun, tapi butuh tautan baru setiap tahun dan tidak bisa dicetak di materi jangka panjang.</li>
<li><strong>Slug tanpa tahun</strong> seperti <em>ramadan</em> — bisa dipakai ulang selamanya dan boleh dicetak di materi permanen, tapi datanya bercampur antartahun.</li>
</ul>
<p>Untuk sebagian besar kebutuhan, gunakan keduanya: slug tanpa tahun untuk materi cetak dan pengenalan jangka panjang, slug bertahun untuk kampanye digital yang perlu diukur terpisah.</p>
<h2>Menyiapkan lebih awal</h2>
<p>Buat seluruh tautan sebulan sebelum musim dimulai, lengkap dengan halaman tujuan sementara yang menyatakan kampanye akan segera dibuka. Ini memungkinkan Anda mulai menyebarkan tautan sebelum kampanye resmi berjalan.</p>
<h2>Mengelola transisi</h2>
<p>Yang sering terlewat adalah apa yang terjadi setelah musim berakhir. Siapkan tujuan pengganti sejak awal dan jadwalkan penggantiannya. Tautan promo lebaran yang masih menuju halaman diskon di bulan Agustus memberi kesan usaha yang tidak terurus.</p>
<h2>Menyimpan pelajaran</h2>
<p>Setelah musim berakhir, catat angka dan kesimpulannya di tempat yang akan Anda buka tahun depan. Kampanye musiman berikutnya akan jauh lebih efisien kalau Anda tidak memulai dari nol.</p>
<h2>Membandingkan antartahun</h2>
<p>Dengan slug bertahun, perbandingan antarperiode jadi langsung terlihat. Pertumbuhan dari tahun ke tahun adalah ukuran yang lebih jujur daripada angka absolut satu musim.</p>`,
  },
  {
    title: "Checklist Sebelum Menyebar Link ke Publik",
    slug: "checklist-sebelum-menyebar-link",
    category: "Optimasi",
    tags: ["checklist", "praktik terbaik", "kualitas"],
    excerpt:
      "Lima menit pemeriksaan sebelum menyebar mencegah koreksi yang memalukan setelahnya.",
    content: `<p>Sebagian besar masalah tautan bisa dicegah dengan pemeriksaan singkat. Daftar berikut disusun dari kesalahan yang paling sering terjadi dan paling mahal dampaknya.</p>
<h2>Pemeriksaan tujuan</h2>
<ul>
<li>Buka tautan di jendela penyamaran — tidak boleh meminta login atau izin akses.</li>
<li>Buka dari ponsel, bukan hanya dari komputer.</li>
<li>Periksa halaman tujuan termuat dalam waktu wajar di koneksi seluler.</li>
<li>Pastikan isi halaman sesuai dengan yang Anda janjikan di materi promosi.</li>
</ul>
<h2>Pemeriksaan tautan</h2>
<ul>
<li>Slug tidak mengandung karakter yang mudah tertukar.</li>
<li>Slug bisa diucapkan lewat telepon tanpa dieja.</li>
<li>Judul internal sudah diisi dan bisa dikenali tiga bulan lagi.</li>
<li>Kategori sudah ditentukan.</li>
</ul>
<h2>Pemeriksaan pengukuran</h2>
<ul>
<li>Ada tautan terpisah untuk setiap penempatan yang ingin dibedakan.</li>
<li>Parameter pelacakan sudah ditambahkan bila diperlukan.</li>
<li>Anda tahu angka pembanding sebelum kampanye dimulai.</li>
</ul>
<h2>Pemeriksaan tampilan berbagi</h2>
<p>Tempel tautan di aplikasi pesan dan lihat pratinjau yang muncul. Judul dan gambar yang keliru sering baru ketahuan di tahap ini, dan inilah yang pertama dilihat calon pengklik.</p>
<h2>Pemeriksaan rencana akhir</h2>
<p>Tentukan sejak sekarang apa yang akan terjadi pada tautan ini setelah kampanye berakhir. Keputusan yang diambil di awal jauh lebih baik daripada tautan yang terlantar karena tidak ada yang ingat harus mengurusnya.</p>
<h2>Menjadikannya rutin</h2>
<p>Simpan daftar ini di tempat yang Anda buka setiap kali membuat tautan penting. Daftar periksa hanya berguna kalau benar-benar dibaca, bukan sekadar diketahui ada.</p>`,
  },
  {
    title: "Cara Menggunakan Satu Link untuk Banyak Platform",
    slug: "satu-link-banyak-platform",
    category: "Optimasi",
    tags: ["strategi", "platform", "efisiensi"],
    excerpt:
      "Ada kalanya satu tautan untuk semua tempat justru pilihan yang benar. Ini kapan dan bagaimana melakukannya.",
    content: `<p>Saran umum adalah membuat tautan terpisah per penempatan. Tapi ada situasi di mana satu tautan tunggal justru lebih menguntungkan, dan penting mengenali kapan.</p>
<h2>Kapan satu tautan lebih baik</h2>
<ul>
<li><strong>Tautan identitas jangka panjang.</strong> Alamat yang mewakili Anda sebaiknya tunggal agar mudah diingat dan diucapkan.</li>
<li><strong>Materi cetak permanen.</strong> Kartu nama dan kemasan sebaiknya memakai alamat yang sama dengan yang Anda sebutkan secara lisan.</li>
<li><strong>Kampanye kecil.</strong> Kalau total kliknya diperkirakan di bawah seratus, pemisahan hanya menambah pekerjaan tanpa data yang bermakna.</li>
</ul>
<h2>Cara tetap mendapat data</h2>
<p>Menggunakan satu tautan tidak berarti kehilangan kemampuan mengukur sepenuhnya. Halaman tujuan tetap bisa mencatat asal pengunjung lewat alat analitik situs, meski dengan tingkat ketelitian yang lebih rendah.</p>
<p>Cara lain: gunakan satu tautan utama yang mengarah ke halaman berisi beberapa tombol, dan bedakan pengukuran di tingkat tombol alih-alih di tingkat tautan masuk.</p>
<h2>Pendekatan gabungan</h2>
<p>Yang paling praktis biasanya kombinasi: satu tautan identitas permanen yang dipakai di mana-mana, ditambah tautan kampanye terpisah untuk promosi berjangka waktu yang perlu diukur ketat.</p>
<h2>Menjaga agar tetap terkelola</h2>
<p>Tautan tunggal yang dipakai di mana-mana harus dirawat lebih hati-hati, karena kerusakannya berdampak ke semua tempat sekaligus. Masukkan ke daftar pemeriksaan berkala Anda dengan prioritas tertinggi.</p>
<h2>Kapan harus memecah</h2>
<p>Begitu Anda mulai bertanya "sebenarnya dari mana pengunjung ini datang" dan tidak bisa menjawabnya, saat itulah waktunya memecah. Sampai pertanyaan itu muncul, kesederhanaan lebih berharga.</p>`,
  },
  {
    title: "Mengukur ROI dari Kampanye Berbasis Link",
    slug: "mengukur-roi-kampanye-link",
    category: "Optimasi",
    tags: ["roi", "perhitungan", "bisnis"],
    excerpt:
      "Menghubungkan klik dengan rupiah membutuhkan beberapa asumsi. Menyatakan asumsinya secara terbuka membuat angkanya berguna.",
    content: `<p>Pertanyaan "apakah kampanye ini menguntungkan" tidak bisa dijawab oleh jumlah klik. Menghubungkan aktivitas dengan hasil finansial menuntut beberapa langkah tambahan.</p>
<h2>Menghitung biaya yang sebenarnya</h2>
<p>Biaya kampanye bukan hanya biaya iklan. Masukkan juga waktu yang Anda habiskan, biaya produksi materi, dan biaya layanan pendukung. Banyak kampanye yang terlihat menguntungkan berubah gambarannya setelah waktu kerja dihitung.</p>
<h2>Menghubungkan klik dengan pendapatan</h2>
<ul>
<li>Gunakan tautan terpisah per kampanye agar pendapatan bisa ditelusuri.</li>
<li>Tanyakan kepada pembeli dari mana mereka tahu, sebagai pembanding data digital.</li>
<li>Perhitungkan jeda waktu — sebagian pembeli baru bertransaksi beberapa minggu setelah klik pertama.</li>
</ul>
<h2>Jeda waktu yang sering diabaikan</h2>
<p>Menilai kampanye pada hari terakhirnya hampir selalu terlalu dini. Untuk produk dengan nilai lebih besar, jeda antara klik pertama dan pembelian bisa mencapai beberapa minggu. Tetapkan jendela pengamatan yang wajar sesuai jenis produk Anda dan patuhi.</p>
<h2>Nilai seumur hidup pelanggan</h2>
<p>Kampanye yang merugi pada transaksi pertama bisa sangat menguntungkan bila pembeli kembali. Bandingkan biaya mendapatkan satu pembeli dengan total belanja mereka sepanjang waktu, bukan hanya dengan transaksi pertama.</p>
<h2>Menyatakan asumsinya</h2>
<p>Setiap perhitungan mengandung asumsi: berapa lama jendela pengamatan, bagaimana menangani pembeli yang datang dari beberapa kanal, berapa nilai seumur hidup yang dipakai. Tuliskan asumsi-asumsi ini bersama hasilnya. Angka tanpa asumsi yang jelas mudah disalahgunakan untuk membenarkan keputusan yang sudah diambil sebelumnya.</p>
<h2>Membandingkan antarkampanye</h2>
<p>Gunakan asumsi yang sama untuk semua kampanye yang Anda bandingkan. Konsistensi metode lebih penting daripada ketepatan absolut angkanya.</p>`,
  },
  {
    title: "Migrasi dari Layanan Shortlink Lain: Langkah Aman",
    slug: "migrasi-layanan-shortlink",
    category: "Optimasi",
    tags: ["migrasi", "perpindahan", "panduan"],
    excerpt:
      "Tautan lama tidak bisa dipindahkan. Yang bisa dilakukan adalah memindahkan aliran pengunjungnya secara bertahap.",
    content: `<p>Kendala utama berpindah layanan adalah kenyataan bahwa tautan lama tetap berada di bawah kendali layanan lama. Anda tidak bisa memindahkannya, hanya bisa mengelola peralihannya.</p>
<h2>Yang perlu disadari sejak awal</h2>
<p>Tautan lama yang sudah tercetak dan tersebar akan terus mengarah ke layanan lama selamanya. Rencana migrasi yang realistis menerima kenyataan ini alih-alih berusaha melawannya.</p>
<h2>Langkah persiapan</h2>
<ul>
<li><strong>Ekspor seluruh daftar tautan lama</strong> beserta tujuan dan statistiknya. Lakukan ini sebelum apa pun yang lain.</li>
<li><strong>Kelompokkan berdasarkan aktivitas.</strong> Tautan yang masih aktif diklik memerlukan penanganan berbeda dari yang sudah mati.</li>
<li><strong>Identifikasi tautan yang tercetak di materi fisik.</strong> Ini kelompok yang paling tidak bisa ditinggalkan.</li>
</ul>
<h2>Strategi peralihan bertahap</h2>
<p>Untuk tautan lama yang masih aktif, ubah tujuannya di layanan lama agar mengarah ke tautan baru Anda. Ini menciptakan jembatan: pengunjung dari materi lama tetap sampai, sementara seluruh materi baru memakai tautan baru.</p>
<p>Pertahankan akun lama tetap aktif selama jembatan ini masih dibutuhkan. Menutup akun lama berarti memutus seluruh aliran dari materi yang sudah tersebar.</p>
<h2>Mengganti materi secara bertahap</h2>
<p>Prioritaskan materi digital yang bisa disunting — unggahan tersemat, tanda tangan email, dan bio profil. Materi cetak diganti secara alami saat cetakan berikutnya.</p>
<h2>Memantau peralihan</h2>
<p>Pantau klik pada tautan lama selama beberapa bulan. Ketika angkanya mendekati nol, jembatan sudah bisa dibongkar. Kalau tetap tinggi, artinya masih ada materi yang belum teridentifikasi.</p>
<h2>Yang tidak bisa diselamatkan</h2>
<p>Statistik historis umumnya tidak bisa dipindahkan. Ekspor dan simpan sebagai arsip, lalu terima bahwa perhitungan di layanan baru dimulai dari nol.</p>`,
  },
  {
    title: "Otomatisasi Pembuatan Link untuk Tim Besar",
    slug: "otomatisasi-pembuatan-link",
    category: "Optimasi",
    tags: ["otomatisasi", "tim", "skala"],
    excerpt:
      "Ketika pembuatan tautan menjadi hambatan, otomatisasi menghemat waktu — tapi juga bisa menciptakan kekacauan baru.",
    content: `<p>Pada skala tertentu, membuat tautan satu per satu menjadi hambatan nyata. Tapi otomatisasi yang diterapkan sebelum sistem penamaan mapan hanya akan menghasilkan kekacauan dengan lebih cepat.</p>
<h2>Prasyarat sebelum mengotomatiskan</h2>
<ul>
<li>Konvensi penamaan sudah disepakati dan tertulis.</li>
<li>Struktur kategori sudah stabil selama beberapa bulan.</li>
<li>Ada satu orang yang bertanggung jawab meninjau hasilnya.</li>
</ul>
<p>Tanpa ketiganya, otomatisasi memperbesar masalah yang sudah ada alih-alih menyelesaikannya.</p>
<h2>Yang layak diotomatiskan lebih dulu</h2>
<p>Mulai dari pekerjaan yang paling berulang dan paling jelas polanya: pembuatan tautan untuk kampanye dengan struktur tetap, atau penerbitan tautan per anggota tim penjualan. Pola yang jelas berarti aturan otomatisasi yang sederhana.</p>
<h2>Yang sebaiknya tetap manual</h2>
<p>Tautan identitas jangka panjang dan tautan yang akan dicetak di materi fisik sebaiknya dibuat manual. Keputusan penamaannya menuntut pertimbangan yang tidak bisa diserahkan pada aturan otomatis.</p>
<h2>Menjaga kualitas</h2>
<p>Tetapkan peninjauan berkala terhadap tautan yang dibuat otomatis. Tanpa peninjauan, kesalahan pada aturan bisa menghasilkan ratusan tautan bermasalah sebelum ada yang menyadarinya.</p>
<h2>Membatasi hak akses</h2>
<p>Semakin mudah membuat tautan, semakin mudah pula membuat kekacauan. Batasi siapa yang bisa menjalankan proses otomatis, dan catat siapa membuat apa.</p>
<h2>Mengukur manfaatnya</h2>
<p>Hitung waktu yang benar-benar dihemat setelah tiga bulan. Otomatisasi yang menuntut perawatan lebih besar daripada waktu yang dihematnya lebih baik dihentikan — dan ini lebih sering terjadi daripada yang diperkirakan.</p>`,
  },
  {
    title: "Roadmap Strategi Link 12 Bulan untuk Bisnis Kecil",
    slug: "roadmap-strategi-link-12-bulan",
    category: "Optimasi",
    tags: ["strategi", "perencanaan", "umkm"],
    excerpt:
      "Rencana bertahap selama setahun, dari satu tautan pertama sampai sistem yang berjalan sendiri.",
    content: `<p>Menerapkan semuanya sekaligus adalah cara tercepat untuk menyerah. Rencana berikut membagi pekerjaan menjadi tahapan yang masing-masing memberi hasil sebelum tahap berikutnya dimulai.</p>
<h2>Bulan 1–2: fondasi</h2>
<ul>
<li>Buat satu tautan identitas permanen dengan nama usaha Anda.</li>
<li>Siapkan satu halaman berisi katalog, harga, dan kontak.</li>
<li>Pasang alamatnya di semua profil media sosial.</li>
</ul>
<h2>Bulan 3–4: pengukuran dasar</h2>
<ul>
<li>Pisahkan tautan per kanal promosi.</li>
<li>Mulai catat klik mingguan di satu lembar kerja sederhana.</li>
<li>Tetapkan angka pembanding untuk bulan-bulan berikutnya.</li>
</ul>
<h2>Bulan 5–6: perluasan ke fisik</h2>
<ul>
<li>Buat kode QR untuk kemasan, meja, dan etalase — masing-masing dengan tautan sendiri.</li>
<li>Bandingkan performa antarlokasi setelah sebulan penuh.</li>
<li>Alihkan anggaran ke lokasi yang terbukti paling menghasilkan.</li>
</ul>
<h2>Bulan 7–8: pendalaman</h2>
<ul>
<li>Mulai pengujian dua versi pada materi promosi utama.</li>
<li>Susun konvensi penamaan tertulis sebelum jumlah tautan membengkak.</li>
<li>Terapkan kategori dan rapikan tautan yang sudah ada.</li>
</ul>
<h2>Bulan 9–10: pertumbuhan</h2>
<ul>
<li>Bangun sistem tautan untuk reseller atau mitra bila relevan.</li>
<li>Susun kalender konten bulanan dengan tautan disiapkan di muka.</li>
<li>Mulai hitung konversi, bukan sekadar klik.</li>
</ul>
<h2>Bulan 11–12: konsolidasi</h2>
<ul>
<li>Lakukan pembersihan menyeluruh terhadap tautan yang tidak aktif.</li>
<li>Susun ringkasan tahunan: kanal mana yang menghasilkan, mana yang tidak.</li>
<li>Tetapkan rencana tahun berikutnya berdasarkan data, bukan perkiraan.</li>
</ul>
<h2>Prinsip yang menjaga rencana ini berjalan</h2>
<p>Setiap tahap harus memberi hasil yang terasa sebelum Anda melanjutkan. Kalau sebuah tahap tidak memberi manfaat nyata, jangan dipaksakan — lewati dan kembali nanti bila kebutuhannya muncul.</p>`,
  },
];
