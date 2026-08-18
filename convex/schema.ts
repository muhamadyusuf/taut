import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ---------------------------------------------------------
  // 0. IDENTITAS USER & LANGGANAN
  // ---------------------------------------------------------

  /**
   * Cermin data Clerk + status paket.
   *
   * Sebelum tabel ini ada, identitas user hanya berupa string `identity.subject`
   * yang tersebar di setiap tabel, sehingga tidak ada satu tempat pun untuk
   * menyimpan "user ini Pro sampai tanggal X". Baris dibuat malas (lazy) lewat
   * users.ensureCurrent saat user pertama kali membuka dasbor.
   */
  users: defineTable({
    clerkId: v.string(), // sama dengan identity.subject
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),

    role: v.string(), // "user" | "admin"

    // Paket yang dibeli. Kebenaran yang dipakai aplikasi adalah hasil
    // resolvePlan() di convex/plans.ts — langganan lewat tanggal otomatis
    // dihitung sebagai "free" walau kolom ini masih berisi "pro".
    plan: v.string(), // "free" | "pro" | "business"
    planExpiresAt: v.optional(v.number()),

    // Akun yang terdaftar sebelum peluncuran paket berbayar: kuota inti tetap
    // tanpa batas, sesuai janji "gratis selamanya" di landing page.
    legacyFree: v.boolean(),

    createdAt: v.number(),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_plan", ["plan"]),

  /** Riwayat pembelian paket (Midtrans akun platform, bukan akun penjual). */
  subscriptions: defineTable({
    userId: v.string(), // clerkId pembeli
    plan: v.string(),
    billingCycle: v.string(), // "monthly" | "yearly" | "event"
    status: v.string(), // "pending" | "active" | "expired" | "failed"

    amount: v.number(),
    provider: v.string(), // "midtrans"
    providerOrderId: v.string(), // SUB-<timestamp>-<acak>
    snapToken: v.optional(v.string()),

    startedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_providerOrderId", ["providerOrderId"]),

  /**
   * Paket acara: kuota sertifikat sekali bayar, tanpa langganan.
   *
   * Panitia acara dan kepanitiaan kampus di Indonesia menolak langganan
   * bulanan tapi mudah menyetujui anggaran sekali jalan per kegiatan. Kuota
   * di sini dijumlahkan DI ATAS jatah paket, bukan menggantikannya, dan habis
   * dengan sendirinya setelah masa berlakunya lewat.
   */
  event_passes: defineTable({
    userId: v.string(),
    label: v.optional(v.string()), // nama acara, untuk pengenal di dasbor
    quota: v.number(),
    used: v.number(),
    expiresAt: v.number(),
    providerOrderId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  /**
   * Pemakaian kuota yang dihitung per bulan (bukan total sepanjang masa).
   * `period` berformat "YYYY-MM" mengikuti zona Asia/Jakarta.
   */
  usage_counters: defineTable({
    userId: v.string(),
    period: v.string(),
    certificatesSent: v.number(),
    apiCalls: v.number(),
  }).index("by_userId_period", ["userId", "period"]),

  /**
   * Identitas merek pemilik tautan, dipakai di halaman antara paket Bisnis.
   *
   * Halaman antara tidak dihapus untuk paket tertinggi melainkan diserahkan:
   * lima detik itu jadi kanal branding pemilik tautan, bukan pajak yang harus
   * ditebus. Lihat docs/premium-strategy.md §8.
   */
  brand_settings: defineTable({
    userId: v.string(),
    enabled: v.boolean(), // matikan untuk kembali melompat langsung
    displayName: v.string(),
    logoUrl: v.optional(v.string()),
    primaryColor: v.optional(v.string()), // hex, mis. "#0193ff"
    tagline: v.optional(v.string()),
    ctaLabel: v.optional(v.string()),
    ctaUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  /**
   * Gaya QR milik satu akun, dipakai untuk semua kode QR-nya.
   *
   * Disimpan per akun, bukan per tautan: yang dijual adalah konsistensi merek
   * di seluruh materi cetak, dan mengatur ulang warna di tiap tautan justru
   * melawan tujuan itu.
   */
  qr_settings: defineTable({
    userId: v.string(),
    fgColor: v.string(), // warna modul QR
    bgColor: v.string(),
    logoUrl: v.optional(v.string()), // kosong = tanpa logo
    logoSizeRatio: v.number(), // 0.15–0.3 dari lebar QR
    dotStyle: v.string(), // "squares" | "dots" | "fluid"
    quietZone: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // ---------------------------------------------------------
  // 1. URL SHORTENER
  // ---------------------------------------------------------
  links: defineTable({
    originalUrl: v.string(),
    shortCode: v.string(),
    userId: v.string(),
    clicks: v.number(),
    title: v.optional(v.string()),
    createdAt: v.number(),

    // Opsional supaya seluruh baris lama tetap sah tanpa migrasi. Kosong
    // diperlakukan sama dengan "active".
    //   "active"  — normal
    //   "flagged" — dicurigai, pengunjung diberi peringatan tapi boleh lanjut
    //   "blocked" — diteruskan tidak lagi mungkin
    status: v.optional(v.string()),
    flagReason: v.optional(v.string()),
    checkedAt: v.optional(v.number()), // terakhir diperiksa Safe Browsing

    // --- Fitur paket berbayar, semuanya opsional agar baris lama tetap sah ---

    // Tautan berhenti bekerja setelah tanggal ini, atau setelah sekian klik.
    // Keduanya bisa dipakai bersamaan; yang lebih dulu tercapai yang berlaku.
    expiresAt: v.optional(v.number()),
    maxClicks: v.optional(v.number()),

    // Sandi disimpan sebagai sidik jari, bukan teks asli. Pemilik tautan pun
    // tidak bisa membacanya kembali dari basis data — sama seperti kata sandi
    // akun, dan alasannya sama.
    passwordHash: v.optional(v.string()),

    // Ruang nama tempat tautan ini hidup. Kosong berarti domain utama.
    //
    // Isinya salah satu dari dua bentuk, dan keduanya tidak mungkin bentrok
    // karena label subdomain divalidasi tanpa titik:
    //   "tokosaya"        -> tokosaya.singkat.in
    //   "link.brand.com"  -> domain milik pengguna sendiri
    //
    // Namanya tetap `subdomain` karena mengganti nama kolom menuntut migrasi
    // seluruh baris tanpa memberi manfaat perilaku apa pun.
    subdomain: v.optional(v.string()),
  })
  .index("by_shortCode", ["shortCode"]) // Untuk redirect cepat
  .index("by_userId", ["userId"])       // Untuk dashboard user
  .index("by_status", ["status"])       // Untuk tinjauan admin
  // Kode pendek hanya wajib unik DI DALAM satu subdomain: dua penyewa berbeda
  // boleh sama-sama punya /promo tanpa bertabrakan.
  .index("by_subdomain_shortCode", ["subdomain", "shortCode"]),

  /**
   * Kunci API untuk akses program.
   *
   * Yang disimpan hanya sidik jari kuncinya, bukan kuncinya sendiri — sama
   * seperti kata sandi. Basis data yang bocor tidak boleh langsung menjadi
   * akses penuh ke akun setiap pelanggan.
   */
  api_keys: defineTable({
    userId: v.string(),
    name: v.string(), // label dari pengguna, mis. "Zapier"
    prefix: v.string(), // delapan karakter awal, untuk dikenali di daftar
    hash: v.string(), // SHA-256 dari kunci lengkap
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_hash", ["hash"]),

  /**
   * Endpoint yang ingin diberi tahu saat sesuatu terjadi.
   *
   * Pengiriman dicatat di webhook_deliveries supaya kegagalan bisa dilihat
   * pengguna sendiri — webhook yang diam-diam gagal adalah keluhan dukungan
   * paling umum pada fitur semacam ini.
   */
  webhooks: defineTable({
    userId: v.string(),
    url: v.string(),
    events: v.array(v.string()), // "link.created" | "link.clicked"
    secret: v.string(), // untuk tanda tangan HMAC
    active: v.boolean(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),

  webhook_deliveries: defineTable({
    webhookId: v.id("webhooks"),
    userId: v.string(),
    event: v.string(),
    status: v.string(), // "success" | "failed"
    statusCode: v.optional(v.number()),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_webhookId", ["webhookId"])
    .index("by_userId", ["userId"]),

  /**
   * Domain milik pengguna sendiri: link.brandanda.com
   *
   * Status mengikuti kenyataan di Vercel, bukan niat pengguna:
   *   "pending"  — sudah didaftarkan, DNS belum menunjuk ke sini
   *   "active"   — DNS benar dan sertifikat terbit
   *   "error"    — Vercel menolak, alasannya disimpan di `note`
   */
  domains: defineTable({
    userId: v.string(),
    domain: v.string(), // huruf kecil, tanpa protokol, tanpa garis miring
    status: v.string(),
    note: v.optional(v.string()),

    // Petunjuk DNS dari Vercel, ditampilkan apa adanya ke pengguna.
    verification: v.optional(
      v.array(
        v.object({
          type: v.string(), // "TXT" | "CNAME" | "A"
          domain: v.string(),
          value: v.string(),
        })
      )
    ),

    createdAt: v.number(),
    verifiedAt: v.optional(v.number()),
    lastCheckedAt: v.optional(v.number()),
  })
    .index("by_domain", ["domain"])
    .index("by_userId", ["userId"]),

  /**
   * Subdomain yang diklaim pengguna: <nama>.singkat.in
   *
   * Dipisah dari tabel users karena satu akun paket Bisnis boleh memegang
   * beberapa, dan karena pencarian saat redirect harus lewat index nama —
   * bukan memindai akun.
   */
  subdomains: defineTable({
    userId: v.string(),
    subdomain: v.string(), // huruf kecil, sudah dinormalkan
    createdAt: v.number(),
  })
    .index("by_subdomain", ["subdomain"])
    .index("by_userId", ["userId"]),

  // ---------------------------------------------------------
  // 1b. ANTI-PENYALAHGUNAAN
  // ---------------------------------------------------------

  /**
   * Laporan dari pengunjung lewat halaman antara.
   *
   * Terbuka untuk publik tanpa login: orang yang menerima tautan phishing
   * justru hampir tidak pernah punya akun di sini, dan memaksa mereka mendaftar
   * lebih dulu berarti laporan itu tidak akan pernah masuk.
   */
  link_reports: defineTable({
    linkId: v.id("links"),
    shortCode: v.string(),
    reason: v.string(), // "phishing" | "malware" | "spam" | "konten" | "lainnya"
    note: v.optional(v.string()),
    status: v.string(), // "open" | "reviewed" | "dismissed"
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_linkId", ["linkId"]),

  /**
   * Penghitung laju berjendela.
   *
   * Dipisah dari tabel links, bukan dihitung dengan memindai tautan yang sudah
   * ada: akun dengan puluhan ribu tautan akan membuat pemeriksaan batas justru
   * lebih mahal daripada pembuatan tautannya sendiri.
   */
  rate_limits: defineTable({
    key: v.string(), // "<aksi>:<pemilik>"
    windowStart: v.number(),
    count: v.number(),
  }).index("by_key", ["key"]),

  // ---------------------------------------------------------
  // 2. KATEGORI & TAGS (Opsional/Fitur Tambahan)
  // ---------------------------------------------------------
  categories: defineTable({
    name: v.string(),
    userId: v.string(),
    createdAt: v.number(),
  })
  .index("by_userId", ["userId"]),

  link_categories: defineTable({
    linkId: v.id("links"),
    categoryId: v.id("categories"),
  })
  .index("by_linkId", ["linkId"])
  .index("by_categoryId", ["categoryId"]),

  // ---------------------------------------------------------
  // 2b. STATISTIK KLIK
  // ---------------------------------------------------------

  /**
   * Satu baris per klik.
   *
   * Sebelum tabel ini ada, statistik hanya berupa satu angka `links.clicks`,
   * sehingga tidak mungkin menjawab "dari negara mana", "lewat perangkat apa",
   * atau "naik-turunnya kapan" — padahal itu justru yang dicari pengguna serius.
   *
   * `userId` disalin dari pemilik tautan supaya penghapusan berkala dan query
   * per akun tidak perlu menengok tabel links satu per satu.
   */
  click_events: defineTable({
    linkId: v.id("links"),
    userId: v.string(),
    ts: v.number(),

    country: v.optional(v.string()),
    city: v.optional(v.string()),
    device: v.optional(v.string()), // "mobile" | "tablet" | "desktop"
    os: v.optional(v.string()),
    browser: v.optional(v.string()),
    referrerHost: v.optional(v.string()), // "langsung" bila tanpa perujuk
  })
    .index("by_linkId_ts", ["linkId", "ts"])
    .index("by_userId_ts", ["userId", "ts"]),

  /**
   * Ringkasan harian, ditulis berbarengan dengan setiap klik.
   *
   * Grafik membaca tabel ini, bukan click_events. Tautan yang viral bisa
   * mengumpulkan ratusan ribu baris peristiwa dalam sehari, dan memindai
   * semuanya setiap kali dasbor dibuka akan menabrak batas ukuran query jauh
   * sebelum menjadi lambat.
   */
  click_daily: defineTable({
    userId: v.string(),
    linkId: v.id("links"),
    date: v.string(), // "YYYY-MM-DD" menurut WIB

    count: v.number(),
    byCountry: v.record(v.string(), v.number()),
    byDevice: v.record(v.string(), v.number()),
    byReferrer: v.record(v.string(), v.number()),
  })
    .index("by_userId_date", ["userId", "date"])
    .index("by_linkId_date", ["linkId", "date"]),

  // ---------------------------------------------------------
  // 3. MICROSITES (BIO LINK)
  // ---------------------------------------------------------
  microsites: defineTable({
    userId: v.string(),
    slug: v.string(), // e.g: "singkat.in/bio/namasaya"
    title: v.string(),
    bio: v.optional(v.string()),
    
    // Tampilan Visual
    theme: v.string(), // "simple-blue", "dark-mode", dll
    buttonStyle: v.optional(v.string()), // "rounded", "sharp", "outline"
    
    // Gambar (URL String External / Cloudinary / Google Drive)
    imageUrl: v.optional(v.string()), 
    backgroundUrl: v.optional(v.string()), 

    // Statistik Sederhana
    visitorCount: v.optional(v.number()),

    // Social Media Links (Objek Terpisah agar mudah diakses)
    socials: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        tiktok: v.optional(v.string()),
        whatsapp: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        youtube: v.optional(v.string()),
        email: v.optional(v.string()),
      })
    ),

    // Array Link/Konten Tombol
    links: v.array(
      v.object({
        id: v.string(),
        type: v.string(), // "link" | "header"
        label: v.string(),
        url: v.optional(v.string()),
        active: v.boolean(),
        thumbnail: v.optional(v.string()), // Gambar kecil di dalam tombol
        icon: v.optional(v.string()),      // Class icon / nama icon
      })
    ),
  })
  .index("by_userId", ["userId"])
  .index("by_slug", ["slug"]),

  // ---------------------------------------------------------
  // 4. TOKO ONLINE (SHOP & MIDTRANS)
  // ---------------------------------------------------------
  
  // A. Pengaturan API Key User (Direct-to-Merchant)
  shop_settings: defineTable({
    userId: v.string(),
    merchantId: v.optional(v.string()),
    
    // Identitas Toko
    slug: v.optional(v.string()), // e.g: "tokoberkah" -> singkat.in/s/tokoberkah
    shopName: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()), // Deskripsi toko (tampil di header halaman publik)
    theme: v.optional(v.string()), // Template tampilan: "classic" | "dark" | "minimal"
    primaryColor: v.optional(v.string()), // Warna primer kustom (hex, e.g. "#3B82F6")

    // Midtrans Keys
    clientKey: v.string(),
    serverKey: v.string(),
    isProduction: v.boolean(),
  })
  .index("by_userId", ["userId"])
  .index("by_slug", ["slug"]), // Index baru untuk pencarian toko publik

  // B. Produk Digital
  products: defineTable({
    userId: v.string(),
    micrositeId: v.optional(v.id("microsites")), // Jika ingin menempelkan produk ke bio tertentu
    title: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    imageUrl: v.optional(v.string()), // Link gambar produk (opsional)
    fileUrl: v.optional(v.string()), // Link file download (Google Drive/Lainnya) setelah bayar
    isActive: v.boolean(),
  })
  .index("by_userId", ["userId"]),

  // C. Riwayat Transaksi (Orders)
  orders: defineTable({
    productId: v.id("products"),
    sellerId: v.string(), // ID User penjual (untuk query dashboard penjual)
    
    // Semua item keranjang — dibutuhkan untuk restore stok saat expire/gagal
    items: v.optional(v.array(v.object({
      productId: v.id("products"),
      quantity: v.number(),
    }))),

    // Data Pembeli
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    
    amount: v.number(),
    status: v.string(), // "pending", "paid", "failed", "challenge"
    
    // Data Midtrans
    snapToken: v.optional(v.string()),
    midtransOrderId: v.string(), // ID Order unik (ORDER-TIMESTAMP-XXX)
    
    createdAt: v.number(),
  })
  .index("by_midtransOrderId", ["midtransOrderId"]) // Wajib untuk Webhook mencari order
  .index("by_sellerId", ["sellerId"]), // Agar penjual bisa lihat history penjualannya

  // ---------------------------------------------------------
  // 5. ADS (Iklan pada halaman redirect)
  // ---------------------------------------------------------
  ads: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    linkUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }),

  // ---------------------------------------------------------
  // 6. ARTIKEL / BLOG (diposting oleh admin)
  // ---------------------------------------------------------
  articles: defineTable({
    title: v.string(),
    slug: v.string(), // permalink: singkat.in/blog/<slug>
    excerpt: v.optional(v.string()), // ringkasan (kutipan)
    content: v.string(), // HTML dari editor

    coverImage: v.optional(v.string()), // featured image (URL)
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // "draft" = konsep, "published" = terbit
    status: v.string(),

    authorId: v.string(), // Clerk user id penulis (admin)
    authorName: v.optional(v.string()),

    publishedAt: v.optional(v.number()), // tanggal post (bisa dijadwalkan ke depan)
    createdAt: v.number(),
    updatedAt: v.number(),

    views: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),

  // ---------------------------------------------------------
  // 7. FORMULIR (GOOGLE FORMS-LIKE)
  // ---------------------------------------------------------
  forms: defineTable({
    userId: v.string(),
    slug: v.string(), // permalink: singkat.in/f/<slug>
    title: v.string(),
    description: v.optional(v.string()),

    // "draft" = belum siap dipublikasikan, "published" = bisa diisi publik
    status: v.string(),
    acceptingResponses: v.boolean(), // saklar terima jawaban baru
    confirmationMessage: v.optional(v.string()), // pesan setelah submit
    theme: v.optional(v.string()), // key preset dari lib/formThemeConfig.ts
    headerImageUrl: v.optional(v.string()), // gambar banner di atas judul formulir

    // Formulir dibagi jadi beberapa bagian (step/page), seperti "Section" di Google Form
    sections: v.array(
      v.object({
        id: v.string(),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        questions: v.array(
          v.object({
            id: v.string(),
            // "short_answer" | "paragraph" | "multiple_choice" | "checkboxes" | "dropdown" | "linear_scale"
            type: v.string(),
            label: v.string(),
            description: v.optional(v.string()),
            required: v.boolean(),
            options: v.optional(v.array(v.string())), // untuk multiple_choice/checkboxes/dropdown
            scaleMin: v.optional(v.number()), // untuk linear_scale
            scaleMax: v.optional(v.number()),
            scaleMinLabel: v.optional(v.string()),
            scaleMaxLabel: v.optional(v.string()),
          })
        ),
      })
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })

    .index("by_userId", ["userId"])
    .index("by_slug", ["slug"]),

  form_responses: defineTable({
    formId: v.id("forms"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.array(v.string()), // single jawaban = 1 elemen, checkbox bisa banyak
      })
    ),
    submittedAt: v.number(),
    certificateUrl: v.optional(v.string()), // link Google Drive setelah sertifikat digenerate
    certificateSentAt: v.optional(v.number()), // waktu terakhir email sertifikat terkirim

    // Kode verifikasi publik, dicetak di sertifikat dan dapat diperiksa siapa
    // pun di singkat.in/v/<kode>. Diterbitkan sekali dan tidak pernah berubah:
    // sertifikat yang sudah dicetak tidak bisa ditarik kembali.
    certificateCode: v.optional(v.string()),
    certificateIssuedAt: v.optional(v.number()),
  })
    .index("by_formId", ["formId"])
    .index("by_certificateCode", ["certificateCode"]),

  // ---------------------------------------------------------
  // 8. TEMPLATE SERTIFIKAT (per formulir)
  // ---------------------------------------------------------
  certificate_templates: defineTable({
    formId: v.id("forms"),
    userId: v.string(),
    backgroundImageUrl: v.string(), // gambar template dari Google Drive
    width: v.number(), // ukuran asli gambar (px), dasar perhitungan posisi field
    height: v.number(),
    fields: v.array(
      v.object({
        id: v.string(),
        variable: v.string(), // id pertanyaan, atau variabel khusus "_no" | "_date" | "_formTitle"
        x: v.number(), // posisi dalam persen (0-100) dari lebar gambar
        y: v.number(), // posisi dalam persen (0-100) dari tinggi gambar
        fontSize: v.number(),
        color: v.string(),
        fontFamily: v.string(),
        bold: v.boolean(),
        align: v.string(), // "left" | "center" | "right"
      })
    ),
    driveFolderId: v.optional(v.string()), // folder tujuan upload hasil sertifikat
    driveFolderName: v.optional(v.string()),
    emailQuestionId: v.optional(v.string()), // pertanyaan yang berisi alamat email penerima
    // Pertanyaan yang berisi nama penerima, ditampilkan di halaman verifikasi
    // publik. Tanpa ini halaman verifikasi hanya bisa membuktikan bahwa
    // sertifikatnya asli, tanpa bisa menyebut atas nama siapa.
    nameQuestionId: v.optional(v.string()),
    emailSubject: v.optional(v.string()),
    emailBody: v.optional(v.string()), // mendukung variabel {{label_pertanyaan}}
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_formId", ["formId"]),
});