# singkat.in — Strategi Fitur Premium & Subdomain

Dokumen riset/perencanaan. Belum ada kode yang diubah.
Tanggal: 2026-08-16

---

## 1. Kondisi Saat Ini (hasil audit kode)

### Modul yang sudah jalan
| Modul | Status | Catatan |
|---|---|---|
| Shortener | ✅ | `convex/links.ts`, custom slug, kategori (pivot table) |
| Interstitial + Iklan | ✅ | `app/[shortCode]/page.tsx`, countdown 5 detik + banner dari `ads` |
| Microsite / Bio | ✅ | `singkat.in/bio/<slug>`, tema, socials, drag-drop link |
| Toko digital | ✅ | Midtrans **direct-to-merchant** (key milik user), `singkat.in/s/<slug>` |
| Formulir | ✅ | `singkat.in/f/<slug>`, sections, 6 tipe soal |
| Sertifikat otomatis | ✅ | Template + posisi field + upload Google Drive + email via Resend |
| QR Code | ✅ | `qrcode.react` + `react-qrcode-logo` sudah terpasang |
| Blog & Admin | ✅ | Admin dikunci hardcode email di `convex/admin.ts:4` |

### Yang belum ada (fondasi monetisasi)
1. **Tidak ada tabel `users`, `plans`, atau `subscriptions`.** Identitas hanya `identity.subject` dari Clerk yang di-embed sebagai string di setiap tabel. Tidak ada satu tempat pun untuk menyimpan "user ini Pro sampai tanggal X".
2. **Tidak ada entitlement/limit apa pun.** Semua mutation hanya cek `if (!identity) throw`. Tidak ada kuota link, form, microsite, atau produk.
3. **Analytics cuma penghitung.** `links.clicks` di-increment satu angka. Tidak ada tabel event klik → mustahil bikin laporan geo/device/referrer/timeline, yang justru barang jualan utama semua kompetitor.
4. **Belum ada billing platform.** Midtrans yang ada adalah key *milik user* untuk toko mereka sendiri. Untuk jualan langganan, butuh akun Midtrans **milik singkat.in** yang terpisah.
5. **Belum ada rate limit / anti-abuse / scan malware** pada pembuatan link.
6. **Landing page menjanjikan "Gratis selamanya · tanpa batas jumlah tautan"** (`app/(marketing)/page.tsx:215,344`). Ini harus dihormati untuk user lama (grandfathering) dan sebaiknya tetap benar untuk fitur inti — monetisasi diambil dari *power feature*, bukan dari mengunci hal dasar.

### Bug/celah yang ketemu sambil audit (perlu dibereskan sebelum jual premium)
- **`RESERVED_SLUGS` di [convex/links.ts:6](convex/links.ts#L6) bocor.** Belum memuat `bio`, `s`, `f`, `blog`, `sitemap.xml`, `robots.txt`. Kalau ada user bikin shortcode `bio` atau `blog`, route statis Next.js yang menang → link-nya jadi mati permanen tapi tetap tersimpan di DB.
- **Slug uniqueness rawan race** (cek lalu insert tanpa transaksi/unique index). Rendah risikonya sekarang, tapi wajib dibenahi kalau slug jadi barang berbayar.
- **`serverKey` Midtrans user disimpan plaintext** di tabel `shop_settings`. Ini kredensial produksi milik orang lain — sebaiknya dienkripsi, dan jangan pernah ikut terkirim ke client query.
- **Setiap redirect = 1 write ke Convex** (`getLinkAndIncrement`). Kalau ada satu link viral, ini jadi titik panas. Model event + agregasi lebih tahan beban dan sekaligus membuka fitur analitik premium.
- **Admin hardcode email.** Ganti ke role di Clerk `publicMetadata` atau kolom `role` di tabel `users`.

---

## 2. Fitur Subdomain — 3 Tingkat, 3 Harga

Ini yang Anda tanyakan, dan memang ini fitur premium paling klasik di industri (Bitly, Dub, Short.io semuanya menaruh custom domain di paket berbayar). Tapi "subdomain" ada tiga makna yang beda jauh secara teknis dan harga:

### Tingkat 1 — Path branded (sekarang) — **Gratis**
`singkat.in/namasaya` — sudah jalan.

### Tingkat 2 — Subdomain platform: `namasaya.singkat.in` — **Pro**
User dapat subdomain sendiri di bawah domain Anda. Link jadi `namasaya.singkat.in/promo`, bio jadi `namasaya.singkat.in` langsung tanpa `/bio/`.

**Yang dibutuhkan:**
- DNS wildcard `*.singkat.in` → Vercel, plus sertifikat wildcard (Vercel menyediakan otomatis untuk wildcard domain, perlu verifikasi DNS via `_acme-challenge`).
- `middleware.ts` di-upgrade: parse hostname → kalau bukan `singkat.in`/`app.singkat.in`, ambil label pertama sebagai `tenant`, lalu `NextResponse.rewrite` ke `/_sites/[tenant]/...`. Sekarang middleware baru mengenali dua hostname secara hardcode (`middleware.ts:16-17`).
- Tabel baru `subdomains` (atau kolom di `users`): `{ userId, subdomain, type, verifiedAt }` + index `by_subdomain`.
- **Reserved list yang jauh lebih ketat** dari sekarang: `app`, `www`, `api`, `admin`, `mail`, `cdn`, `static`, `blog`, `docs`, `status`, `help`, `support`, `id`, `go`, plus nama merek besar (bank, e-commerce, instansi) untuk cegah phishing.
- Skema shortcode berubah: unik **per subdomain**, bukan global. Index jadi `by_subdomain_shortCode`.
- **Clerk**: subdomain baru harus di-set sebagai satellite domain / cookie domain `.singkat.in`, kalau tidak sesi login pecah antar subdomain.
- Reputasi domain: subdomain gratis = magnet phishing. **Wajib berbayar atau minimal terverifikasi** — kalau `*.singkat.in` masuk blacklist Google Safe Browsing, semua link Anda ikut mati. Ini alasan bisnis paling kuat kenapa fitur ini tidak boleh gratis.

### Tingkat 3 — Custom domain milik user: `link.tokosaya.com` — **Bisnis**
User pakai domain sendiri. Ini yang orang rela bayar mahal.

**Yang dibutuhkan:**
- Tabel `domains`: `{ userId, domain, status: pending|active|failed, verificationToken, sslStatus, createdAt }`.
- Integrasi **Vercel Domains API** (`POST /v10/projects/{id}/domains`) untuk menambahkan domain + provisioning SSL otomatis. Butuh `VERCEL_API_TOKEN` + `VERCEL_PROJECT_ID` di env. Ini dijalankan dari Convex action (`"use node"`) atau Next.js route handler.
- Alur verifikasi: user tambah domain → sistem kasih instruksi CNAME (`cname.vercel-dns.com`) atau A record → polling status tiap 30 detik → aktif.
- Middleware sama seperti Tingkat 2, tapi lookup by full hostname.
- Cache lookup hostname→tenant (Convex query per request akan menambah latensi di jalur redirect; pertimbangkan cache di edge/memory).

**Rekomendasi urutan:** Tingkat 2 dulu (murni internal, tanpa dependensi API eksternal), Tingkat 3 setelah billing jalan.

---

## 3. Katalog Kandidat Fitur Premium (per modul)

Legenda effort: 🟢 ringan (1–2 hari) · 🟡 sedang (3–7 hari) · 🔴 berat (1–3 minggu)

### A. Shortener — nilai jual tertinggi per effort
| Fitur | Kenapa orang bayar | Effort | Paket |
|---|---|---|---|
| **Lewati halaman iklan (direct redirect)** | Ini pengungkit terbesar Anda. Halaman interstitial 5 detik itu friksi nyata; menghapusnya = manfaat instan yang dirasakan tiap klik | 🟢 | Pro |
| **Edit tujuan setelah link dibuat** (dynamic link) | QR sudah dicetak di banner tapi URL berubah — tanpa ini, cetak ulang | 🟢 sudah ada `updateLink`, tinggal digating | Pro |
| Kedaluwarsa link (tanggal / jumlah klik) | Promo terbatas, dokumen sensitif | 🟢 | Pro |
| Password / gerbang email pada link | Bagi materi berbayar, capture lead | 🟢 | Pro |
| UTM builder + preset | Marketer bikin puluhan link/hari | 🟢 | Pro |
| Bulk import CSV/XLSX + bulk QR | `xlsx` sudah jadi dependency | 🟡 | Pro |
| Targeting geo / device / bahasa | Satu link → App Store untuk iOS, Play Store untuk Android | 🟡 | Bisnis |
| A/B rotator (1 link → banyak tujuan) | Uji kreatif iklan | 🟡 | Bisnis |
| Retargeting pixel (Meta/GA/TikTok) di halaman antara | Agensi bayar mahal untuk ini; Anda sudah punya halaman antara-nya | 🟡 | Bisnis |
| Deep link ke aplikasi | Konten kreator | 🔴 | Bisnis |

### B. Analytics — butuh fondasi baru, tapi ini yang dicari pengguna serius
| Fitur | Effort | Paket |
|---|---|---|
| Retensi data: 7 hari (Free) → 12 bulan (Pro) → tanpa batas (Bisnis) | 🟡 | pembeda paket |
| Rincian geo / kota / device / browser / referrer | 🟡 | Pro |
| Grafik time-series per jam/hari | 🟡 | Pro |
| Export PDF & Excel berlabel merek sendiri (`jspdf`+`xlsx` sudah ada) | 🟢 | Pro |
| Laporan terjadwal via email mingguan (Resend sudah ada) | 🟢 | Bisnis |
| Dashboard publik yang bisa dibagikan ke klien | 🟡 | Bisnis |
| Scan QR dihitung terpisah dari klik biasa | 🟢 | Pro |

### C. QR Code — margin tinggi, effort rendah (library sudah terpasang)
| Fitur | Effort | Paket |
|---|---|---|
| QR dinamis (tujuan bisa diubah tanpa cetak ulang) | 🟢 | Pro |
| Logo di tengah + warna kustom + bentuk mata QR | 🟢 `react-qrcode-logo` sudah ada | Pro |
| Unduh SVG/PDF vektor (untuk cetak besar) | 🟢 | Pro |
| Template kartu QR siap cetak (meja resto, standee) | 🟡 | Pro |
| Bulk QR dari CSV → ZIP | 🟡 | Bisnis |

### D. Bio / Microsite
| Fitur | Effort | Paket |
|---|---|---|
| Free: 1 halaman → Pro: 5 → Bisnis: tanpa batas | 🟢 | pembeda |
| Hapus badge "Powered by singkat.in" | 🟢 | Pro |
| Tema premium, font kustom, CSS kustom | 🟡 | Pro |
| Domain/subdomain sendiri (lihat §2) | 🔴 | Pro/Bisnis |
| Jadwal tampil link (mulai/berakhir) | 🟢 | Pro |
| Embed YouTube/Spotify/TikTok | 🟡 | Pro |
| Form penangkap lead + ekspor kontak | 🟡 | Bisnis |
| Pixel & analytics per tombol | 🟡 | Bisnis |
| Badge terverifikasi | 🟢 | Pro |

### E. Formulir + Sertifikat — **ini diferensiasi Anda yang tidak dimiliki Bitly**
Pasar kampus/event/pelatihan di Indonesia sangat besar dan sudah familiar dengan "e-sertifikat otomatis". Ini bisa jadi mesin uang terbesar, terlebih Anda ada di lingkungan kampus.

| Fitur | Effort | Paket |
|---|---|---|
| Free: 3 form, 100 respons/form → Pro: 20 form, 2.000 respons → Bisnis: tanpa batas | 🟢 | pembeda |
| **Generator sertifikat otomatis** (sudah jadi!) — Free: 25 sertifikat percobaan, sisanya berbayar | 🟢 tinggal dihitung & digating | Pro/Event |
| Kirim email sertifikat massal + resend | sudah ada | Pro |
| Verifikasi sertifikat publik (`singkat.in/v/<kode>` + QR di sertifikat) | 🟡 | Pro — nilai jual besar untuk institusi |
| Logika percabangan pertanyaan | 🔴 | Bisnis |
| Upload berkas oleh responden | 🟡 | Bisnis |
| Batas waktu & kuota pendaftaran (auto-close) | 🟢 | Pro |
| Kolaborator/tim per form | 🟡 | Bisnis |
| Hapus branding di form publik | 🟢 | Pro |

### F. Toko digital
| Fitur | Effort | Paket |
|---|---|---|
| Free: 3 produk → Pro: 50 → Bisnis: tanpa batas | 🟢 | pembeda |
| Kupon/diskon | 🟡 | Pro |
| Halaman toko custom domain | 🔴 | Bisnis |
| Pengiriman file otomatis + link kedaluwarsa (anti-share) | 🟡 | Pro |
| Laporan penjualan + export | 🟢 | Pro |

> Catatan model bisnis: karena Midtrans-nya *direct-to-merchant*, Anda **tidak bisa** memotong komisi transaksi tanpa mengubah arsitektur ke akun platform. Jadi untuk toko, monetisasi lewat langganan/batas produk, bukan fee — dan itu justru jadi keunggulan pemasaran: **"0% biaya transaksi, uang langsung masuk rekening Anda"**.

### G. Platform
| Fitur | Effort | Paket |
|---|---|---|
| API key + REST API untuk create/read link | 🟡 | Bisnis |
| Webhook (klik, order, submit form) | 🟡 | Bisnis |
| Workspace/tim + peran (owner/editor/viewer) | 🔴 | Bisnis |
| Audit log | 🟡 | Bisnis |
| White label penuh (logo & warna Anda di halaman antara) | 🟡 | Bisnis |
| Dukungan prioritas / WhatsApp | 🟢 | Pro+ |

---

## 4. Rekomendasi Paket & Harga

Prinsip: **fitur inti tetap gratis dan tanpa batas** (menjaga janji landing page + pertumbuhan), yang dijual adalah *kontrol, identitas merek, kedalaman data, dan otomatisasi*.

| | **Free** | **Pro** — Rp 29.000/bln<br>(Rp 249.000/thn, hemat 28%) | **Bisnis** — Rp 99.000/bln<br>(Rp 990.000/thn) |
|---|---|---|---|
| Jumlah link pendek | Tanpa batas | Tanpa batas | Tanpa batas |
| Halaman iklan antara | Ada (5 detik) | **Tidak ada** | Tidak ada |
| Slug kustom | ✅ | ✅ | ✅ |
| Subdomain `nama.singkat.in` | — | ✅ 1 | ✅ 3 |
| Domain sendiri | — | — | ✅ 3 domain |
| Retensi analitik | 7 hari | 12 bulan | Tanpa batas |
| Geo/device/referrer | — | ✅ | ✅ + export & laporan terjadwal |
| QR dinamis + logo + SVG | — | ✅ | ✅ + bulk |
| Kedaluwarsa/password link | — | ✅ | ✅ |
| Targeting & A/B & pixel | — | — | ✅ |
| Halaman bio | 1 | 5 | Tanpa batas |
| Formulir | 3 form, 100 respons | 20 form, 2.000 respons | Tanpa batas |
| Sertifikat otomatis | 25 (percobaan) | 500/bln | Tanpa batas + verifikasi publik |
| Produk toko | 3 | 50 | Tanpa batas |
| Hapus branding | — | ✅ | ✅ + white label |
| API & webhook | — | — | ✅ |
| Anggota tim | — | — | 5 |

**Add-on sekali bayar (penting untuk pasar kampus/EO Indonesia yang tidak suka langganan):**
- Paket Event: **Rp 149.000** — 1.000 sertifikat + form tanpa batas + halaman acara, aktif 30 hari.
- Domain tambahan: Rp 25.000/bln. Kursi tim tambahan: Rp 20.000/bln.
- Lisensi Kampus/Instansi: mulai Rp 3.500.000/tahun (banyak akun + subdomain institusi + dukungan).

**Alasan angka:** Bitly Pro ~USD 35/bln (≈Rp 570rb) dan Dub Pro USD 24/bln — terlalu mahal untuk pasar ini. Titik harga Rp 25rb–35rb/bln adalah zona nyaman SaaS lokal (setara langganan streaming), dan tahunan Rp 249rb terasa seperti "sekali beli". Paket Bisnis Rp 99rb tetap 5× lebih murah dari kompetitor global, jadi custom domain terasa sangat murah.

**Grandfathering:** semua user yang mendaftar sebelum peluncuran paket dapat flag `legacy_free` — kuota inti (link, klik, slug) tetap tanpa batas selamanya, hanya fitur baru yang berbayar. Umumkan terbuka; ini murah dan membeli banyak goodwill.

---

## 5. Fondasi Teknis yang Harus Dibangun Duluan

Jangan mulai dari fitur. Mulai dari lima hal ini, kalau tidak setiap fitur premium akan ditempel manual dan berantakan.

**F1. Tabel identitas & langganan**
```
users:          { clerkId, email, name, role, plan, planExpiresAt, legacyFree, createdAt }  @index by_clerkId
subscriptions:  { userId, plan, status, startedAt, expiresAt, provider, providerOrderId, amount }
usage_counters: { userId, period /* "2026-08" */, certificatesSent, formResponses, apiCalls }
```
Isi via **Clerk webhook** (`user.created`/`updated`) ke Convex HTTP router — `convex/http.ts` sudah ada, tinggal tambah route. Sekaligus ini menghapus admin hardcode email.

**F2. Lapisan entitlement terpusat**
Satu file `convex/entitlements.ts`:
```
getPlan(ctx) -> "free" | "pro" | "business"
can(ctx, "custom_domain") -> boolean
assertQuota(ctx, "forms", currentCount)  // lempar error yang ramah + ajakan upgrade
```
**Wajib dipanggil di dalam mutation Convex, bukan cuma disembunyikan di UI.** Gating di React saja bisa dilewati siapa pun yang memanggil API Convex langsung.

**F3. Analytics berbasis event**
```
click_events:   { linkId, ts, country, city, device, os, browser, referrer, isQr }  @index by_linkId_ts
click_daily:    { linkId, date, count, byCountry, byDevice }   // agregat, untuk grafik cepat
```
Retensi Free 7 hari dijalankan lewat cron Convex yang menghapus event lama — sekaligus menekan biaya penyimpanan. Data geo diambil dari header Vercel (`x-vercel-ip-country`), jadi tidak perlu layanan GeoIP berbayar.

**F4. Billing Midtrans tingkat platform**
- Akun Midtrans **milik singkat.in**, key di env server (`MIDTRANS_SERVER_KEY_PLATFORM`) — jangan campur dengan key milik penjual.
- Alur: pilih paket → Snap token → bayar (QRIS/VA/e-wallet) → webhook di `convex/http.ts` (endpoint terpisah dari `/midtrans-webhook` toko) → set `planExpiresAt`.
- **Recurring otomatis di Midtrans hanya andal untuk kartu kredit**, sementara mayoritas pengguna Indonesia pakai QRIS/VA. Rekomendasi: model **prabayar berjangka** (30/365 hari) + cron pengingat H-7 dan H-1 lewat Resend + penurunan otomatis ke Free saat lewat tanggal. Lebih sederhana dan sesuai kebiasaan pasar.
- Siapkan juga pembuatan invoice/kuitansi PDF (jspdf sudah ada) — instansi selalu minta ini.

**F5. Anti-abuse (prasyarat sebelum subdomain dibuka)**
Rate limit pembuatan link per user/IP, blokir domain phishing (Google Safe Browsing API gratis), tombol lapor di halaman antara, dan halaman peringatan untuk link yang ditandai. Satu kasus phishing di `*.singkat.in` bisa membunuh reputasi seluruh domain.

---

## 6. Roadmap Bertahap

| Fase | Isi | Estimasi | Hasil |
|---|---|---|---|
| **0. Bersih-bersih** | Perbaiki `RESERVED_SLUGS`, enkripsi serverKey, role admin dari Clerk, rate limit dasar | 2–3 hari | Aman untuk dikomersialkan |
| **1. Fondasi** | F1 tabel users/subscriptions + F2 entitlements + Clerk webhook + flag `legacyFree` | 4–6 hari | Bisa menandai siapa Pro |
| **2. Monetisasi tercepat** | Halaman harga, checkout Midtrans platform, webhook, cron kedaluwarsa + rilis 3 fitur ringan: **bebas iklan**, QR dinamis+logo, hapus branding | 1–2 minggu | **Rupiah pertama masuk** |
| **3. Analitik** | F3 event + agregasi + dashboard geo/device + retensi bertingkat + export | 1,5–2 minggu | Alasan kuat naik ke Pro |
| **4. Subdomain** | `nama.singkat.in`: wildcard DNS, middleware multi-tenant, tabel subdomains, Clerk satellite | 1,5 minggu | Fitur yang Anda minta |
| **5. Custom domain** | Vercel Domains API, verifikasi, SSL, UI status | 1,5 minggu | Paket Bisnis punya isi |
| **6. Lini kampus/event** | Kuota sertifikat, verifikasi sertifikat publik + QR, Paket Event sekali bayar | 1,5 minggu | Segmen dengan margin terbaik |
| **7. Platform** | API key, webhook, workspace tim | 3+ minggu | Kontrak instansi |

Kalau ingin uang masuk secepatnya: **Fase 0 → 1 → 2 saja sudah cukup** (±3 minggu), lalu ukur konversi sebelum lanjut.

---

## 7. Ide "Improve" di Luar Daftar Standar

Beberapa hal yang cocok dengan posisi Anda tapi jarang dimiliki kompetitor:

1. **Halaman antara jadi produk, bukan gangguan.** Alih-alih hanya "hapus iklan untuk Pro", tawarkan *"halaman antara milikmu sendiri"*: user Bisnis pakai logo, warna, dan pesannya sendiri di 5 detik itu — jadi kanal branding, bukan pajak. Ini membalik fitur yang biasanya dibenci menjadi alasan berlangganan.
2. **Bagi hasil iklan untuk link populer.** Link yang menghasilkan >10rb klik/bln dapat bagian dari pendapatan iklan halaman antara. Ini mengikat kreator ke platform Anda dan membedakan dari semua kompetitor.
3. **Verifikasi sertifikat publik + QR.** `singkat.in/v/<kode>` menampilkan keaslian sertifikat. Untuk kampus dan lembaga pelatihan ini bukan fitur tambahan — ini alasan utama mereka membeli.
4. **Paket Event sekali bayar.** Pasar EO/panitia kampus di Indonesia menolak langganan bulanan tapi mudah menyetujui anggaran sekali jalan per acara.
5. **Bundling lintas modul sebagai "Kit Acara"**: form pendaftaran + link pendek + QR pendaftaran + microsite acara + sertifikat + laporan peserta. Tidak ada kompetitor lokal yang punya keenamnya sekaligus — dan Anda sudah punya semuanya, tinggal dibungkus jadi satu alur.
6. **Mode "kedaluwarsa aman"** untuk institusi: link yang otomatis mati setelah acara selesai, supaya tidak ada arsip formulir yang bocor bertahun kemudian.

---

## 8. Keputusan yang Sudah Diambil (16 Agustus 2026)

1. ✅ **Urutan kerja: Fase 0 → 1 → 2 lebih dulu.** Bersih-bersih keamanan, lalu fondasi user/entitlement, lalu billing + 3 fitur premium ringan. Target ±3 minggu sampai bisa menerima pembayaran. Subdomain dibangun di atas fondasi ini (Fase 4), bukan sebelumnya.
2. ✅ **Subdomain `nama.singkat.in` masuk paket Pro**, jatah 1 subdomain. Bisnis dapat 3 subdomain + custom domain sendiri (`link.brand.com`).
3. ✅ **Bebas halaman iklan jadi fitur Pro**, dan paket Bisnis mendapat **halaman antara white-label** (logo, warna, pesan sendiri) — jadi 5 detik itu berubah dari friksi menjadi kanal branding, bukan sekadar dihapus.
4. Model harga: langganan bulanan/tahunan **plus** Paket Event sekali bayar untuk segmen kampus/EO.
5. Grandfathering: user lama diberi flag `legacyFree` — fitur inti tetap tanpa batas selamanya.

### Konsekuensi teknis dari keputusan di atas
- Tabel `ads` dan `app/[shortCode]/page.tsx` perlu tambahan konsep **pemilik halaman antara**: kalau link milik user Bisnis, tampilkan branding user; kalau Pro, langsung redirect; kalau Free, tampilkan iklan platform. Artinya query redirect harus ikut membawa plan pemilik link — pertimbangkan denormalisasi `ownerPlan` di tabel `links` agar tidak menambah round-trip di jalur redirect.
- Karena subdomain masuk Pro (bukan Bisnis), volume pemakaiannya akan jauh lebih tinggi → anti-abuse (Fase 0) bukan opsional. Minimal: Safe Browsing check, rate limit, dan reserved list ketat sebelum Fase 4 dirilis.

### Langkah berikutnya
Mulai **Fase 0 (bersih-bersih)**: perbaiki `RESERVED_SLUGS`, enkripsi `serverKey` Midtrans, pindahkan role admin ke Clerk, tambah rate limit dasar pembuatan link.
