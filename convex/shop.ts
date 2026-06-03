import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";

// ------------------------------------------------------------------
// BAGIAN 1: PENGATURAN TOKO (Identity & Keys)
// ------------------------------------------------------------------

// Simpan Pengaturan (API Key, Nama Toko, Slug, Logo)
export const saveShopSettings = mutation({
  args: {
    clientKey: v.string(),
    serverKey: v.string(),
    isProduction: v.boolean(),
    // Identitas Toko
    slug: v.string(),
    shopName: v.string(),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    theme: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 1. Validasi Slug Unik
    // Bersihkan slug (hanya huruf kecil, angka, strip)
    const cleanSlug = args.slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
    
    // Cek apakah slug sudah dipakai orang lain
    const existingSlug = await ctx.db.query("shop_settings")
        .withIndex("by_slug", q => q.eq("slug", cleanSlug))
        .first();

    // Ambil settingan saya saat ini (jika ada)
    const mySettings = await ctx.db.query("shop_settings")
        .withIndex("by_userId", q => q.eq("userId", identity.subject))
        .first();

    // Jika slug ada, DAN bukan punya saya -> Error
    if (existingSlug && existingSlug.userId !== identity.subject) {
        throw new Error("URL Toko ini sudah dipakai orang lain. Silakan pilih yang lain.");
    }

    const dataToSave = {
        userId: identity.subject,
        clientKey: args.clientKey,
        serverKey: args.serverKey,
        isProduction: args.isProduction,
        slug: cleanSlug,
        shopName: args.shopName,
        logoUrl: args.logoUrl,
        description: args.description,
        theme: args.theme,
        primaryColor: args.primaryColor,
    };

    if (mySettings) {
      await ctx.db.patch(mySettings._id, dataToSave);
    } else {
      await ctx.db.insert("shop_settings", dataToSave);
    }
  },
});

// Ambil Pengaturan Saya (Untuk Dashboard)
export const getMySettings = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("shop_settings")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

// PUBLIC: Ambil Toko Berdasarkan Slug (Untuk Halaman Toko Pembeli)
export const getShopBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shop_settings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// ------------------------------------------------------------------
// BAGIAN 2: MANAJEMEN PRODUK (CRUD + STOK)
// ------------------------------------------------------------------

// 1. CREATE (Tambah Produk)
export const createProduct = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(), // Input Stok
    imageUrl: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await ctx.db.insert("products", {
      userId: identity.subject,
      title: args.title,
      description: args.description,
      price: args.price,
      stock: args.stock,
      imageUrl: args.imageUrl,
      fileUrl: args.fileUrl,
      isActive: true,
    });
  },
});

// 2. UPDATE (Edit Produk)
export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    stock: v.number(),
    imageUrl: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const product = await ctx.db.get(args.id);
    
    // Validasi Kepemilikan
    if (!product || product.userId !== identity.subject) {
        throw new Error("Anda tidak memiliki izin mengedit produk ini.");
    }

    await ctx.db.patch(args.id, {
        title: args.title,
        description: args.description,
        price: args.price,
        stock: args.stock,
        imageUrl: args.imageUrl,
        fileUrl: args.fileUrl,
    });
  },
});

// 3. DELETE (Hapus Produk)
export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== identity.subject) {
        throw new Error("Anda tidak memiliki izin menghapus produk ini.");
    }

    await ctx.db.delete(args.id);
  },
});

// Toggle Status Aktif/Nonaktif Produk
export const toggleProductStatus = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const product = await ctx.db.get(args.id);
    if (!product || product.userId !== identity.subject) {
        throw new Error("Anda tidak memiliki izin mengubah produk ini.");
    }

    await ctx.db.patch(args.id, { isActive: !product.isActive });
  },
});

// Ambil Semua Produk Saya (Dashboard)
export const getMyProducts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    return await ctx.db
      .query("products")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Ambil 1 Produk by ID (Untuk Form Edit)
export const getProductById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// PUBLIC: Ambil Produk Toko (Untuk Halaman Pembeli)
export const getProductsBySeller = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter(q => q.eq(q.field("isActive"), true)) // Hanya yang aktif
      .collect();
  },
});

// ------------------------------------------------------------------
// BAGIAN 3: MANAJEMEN ORDER
// ------------------------------------------------------------------

// Ambil Riwayat Pesanan (Dashboard Penjual)
export const getMyOrders = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    
    return await ctx.db
      .query("orders")
      .withIndex("by_sellerId", (q) => q.eq("sellerId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Update Status Order + Logika Stok (Dipanggil Webhook & updateOrderStatusInternal)
export const updateOrderStatusInternal = mutation({
    args: { midtransOrderId: v.string(), status: v.string() },
    handler: async (ctx, args) => {
        const order = await ctx.db.query("orders")
            .withIndex("by_midtransOrderId", q => q.eq("midtransOrderId", args.midtransOrderId))
            .first();
        
        if (!order) return;

        // Jangan proses ulang jika status sudah final
        if (order.status === "paid" || order.status === "failed") return;

        await ctx.db.patch(order._id, { status: args.status });

        // Jika gagal/expire/cancel → kembalikan stok
        if (args.status === "failed" || args.status === "expire" || args.status === "cancel") {
            const itemsToRestore = order.items ?? [{ productId: order.productId, quantity: 1 }];
            for (const item of itemsToRestore) {
                const product = await ctx.db.get(item.productId);
                if (product) {
                    await ctx.db.patch(item.productId, {
                        stock: product.stock + item.quantity,
                    });
                }
            }
        }
    }
});

// ------------------------------------------------------------------
// BAGIAN 4: INTERNAL HELPERS (Dipanggil oleh shopActions.ts)
// ------------------------------------------------------------------

// Helper: Ambil Setting Penjual (API Key) secara aman di server side
export const getSellerSettingsInternal = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shop_settings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Helper: Ambil Produk untuk validasi harga di server side
export const getProductInternal = internalQuery({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Helper: Catat Order Baru — menyimpan semua item untuk keperluan restore stok
export const createOrderRecord = internalMutation({
  args: {
    productId: v.id("products"),
    items: v.array(v.object({ productId: v.id("products"), quantity: v.number() })),
    sellerId: v.string(),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    amount: v.number(),
    snapToken: v.string(),
    midtransOrderId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Helper: Kurangi stok semua item (dipanggil saat transaksi dibuat)
export const reserveStockInternal = internalMutation({
  args: {
    items: v.array(v.object({ productId: v.id("products"), quantity: v.number() })),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);
      if (!product) throw new Error(`Produk tidak ditemukan: ${item.productId}`);
      if (product.stock < item.quantity) {
        throw new Error(`Stok produk "${product.title}" tidak mencukupi (tersisa ${product.stock}).`);
      }
      await ctx.db.patch(item.productId, { stock: product.stock - item.quantity });
    }
  },
});

export const getOrderByMidtransId = internalQuery({
  args: { midtransOrderId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_midtransOrderId", (q) => q.eq("midtransOrderId", args.midtransOrderId))
      .first();
  },
});