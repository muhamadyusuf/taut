"use node"; // WAJIB ADA DI BARIS PERTAMA
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import Midtrans from "midtrans-client";

interface Product {
  _id: string;
  price: number;
  title: string;
  userId: string;
}

interface SellerSettings {
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export const createTransaction = action({
  args: {
    // UPDATE: Menerima Array Item (Keranjang)
    items: v.array(v.object({
        productId: v.id("products"),
        quantity: v.number()
    })),
    buyerName: v.string(),
    buyerEmail: v.string(),
    buyerPhone: v.string(),
    sellerId: v.string(), // ID Penjual (diperlukan untuk ambil API Key)
  },
  handler: async (ctx, args): Promise<{ token: string; clientKey: string; isProduction: boolean }> => {
    
    // 1. Ambil Key Penjual (Berdasarkan Seller ID dari halaman toko)
    const settings: SellerSettings | null = await ctx.runQuery(internal.shop.getSellerSettingsInternal, {
      userId: args.sellerId,
    });
    
    if (!settings || !settings.serverKey) {
      throw new Error("Toko ini belum mengatur metode pembayaran.");
    }

    // 2. Hitung Total, Validasi Harga & Stok dari Server
    let grossAmount = 0;
    const itemDetails = [];

    for (const item of args.items) {
        const product = await ctx.runQuery(internal.shop.getProductInternal, { id: item.productId });
        
        if (!product) {
            throw new Error(`Produk tidak ditemukan.`);
        }
        if (!product.isActive) {
            throw new Error(`Produk "${product.title}" sudah tidak tersedia.`);
        }
        if (product.stock < item.quantity) {
            throw new Error(`Stok produk "${product.title}" tidak mencukupi. Tersisa: ${product.stock}.`);
        }

        const subtotal = product.price * item.quantity;
        grossAmount += subtotal;
        
        itemDetails.push({
            id: product._id,
            price: product.price,
            quantity: item.quantity,
            name: product.title.substring(0, 49),
        });
    }

    if (grossAmount <= 0 || itemDetails.length === 0) {
        throw new Error("Keranjang kosong atau produk tidak valid.");
    }

    // 3. Setup Midtrans
    const snap = new Midtrans.Snap({
      isProduction: settings.isProduction,
      serverKey: settings.serverKey,
      clientKey: settings.clientKey,
    });

    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // GANTI URL INI DENGAN DOMAIN ANDA
    const DOMAIN_URL = process.env.NEXT_PUBLIC_APP_URL || "https://singkat.in"; 

    // 4. Request Token ke Midtrans
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: args.buyerName,
        email: args.buyerEmail,
        phone: args.buyerPhone,
      },
      notification_url: [`${DOMAIN_URL}/api/midtrans-webhook`], 
    };

    const transaction: { token: string } = await snap.createTransaction(parameter);

    // 5. Kurangi stok (reserve) untuk semua item
    await ctx.runMutation(internal.shop.reserveStockInternal, {
      items: args.items,
    });

    // 6. Catat Order ke Database (simpan semua items untuk keperluan restore stok)
    await ctx.runMutation(internal.shop.createOrderRecord, {
      productId: args.items[0].productId,
      items: args.items,
      sellerId: args.sellerId,
      buyerName: args.buyerName,
      buyerEmail: args.buyerEmail,
      buyerPhone: args.buyerPhone,
      amount: grossAmount,
      snapToken: transaction.token,
      midtransOrderId: orderId,
    });

    return {
      token: transaction.token,
      clientKey: settings.clientKey,
      isProduction: settings.isProduction
    };
  },
});