import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
  })
  .index("by_shortCode", ["shortCode"]) // Untuk redirect cepat
  .index("by_userId", ["userId"]),      // Untuk dashboard user

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
  })
    .index("by_formId", ["formId"]),

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
    emailSubject: v.optional(v.string()),
    emailBody: v.optional(v.string()), // mendukung variabel {{label_pertanyaan}}
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_formId", ["formId"]),
});