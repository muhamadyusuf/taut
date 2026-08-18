"use node";

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import Midtrans from "midtrans-client";
import { CYCLE_DAYS, priceOf } from "./billing";
import { EVENT_PASS, PLANS, isPlanId } from "./plans";

/**
 * Kunci Midtrans milik PLATFORM (singkat.in), bukan milik penjual.
 *
 * Disimpan sebagai environment variable di dashboard Convex — bukan di
 * .env.local — karena action ini berjalan di server Convex, bukan di Next.js:
 *   MIDTRANS_PLATFORM_SERVER_KEY
 *   MIDTRANS_PLATFORM_CLIENT_KEY
 *   MIDTRANS_PLATFORM_IS_PRODUCTION   ("true" untuk produksi)
 */
function platformKeys() {
  const serverKey = process.env.MIDTRANS_PLATFORM_SERVER_KEY;
  const clientKey = process.env.MIDTRANS_PLATFORM_CLIENT_KEY;

  if (!serverKey || !clientKey) {
    throw new Error(
      "Pembayaran langganan belum dikonfigurasi. Set MIDTRANS_PLATFORM_SERVER_KEY dan MIDTRANS_PLATFORM_CLIENT_KEY di environment variable Convex."
    );
  }

  return {
    serverKey,
    clientKey,
    isProduction: process.env.MIDTRANS_PLATFORM_IS_PRODUCTION === "true",
  };
}

/**
 * Menyiapkan pembayaran paket dan mengembalikan token Snap.
 *
 * Harga TIDAK diambil dari argumen klien — selalu dihitung ulang dari katalog
 * di convex/plans.ts. Kalau harga ikut dikirim dari browser, siapa pun bisa
 * membeli paket Bisnis seharga seribu rupiah.
 */
export const createSubscriptionCheckout = action({
  args: {
    plan: v.string(),
    billingCycle: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    token: string;
    clientKey: string;
    isProduction: boolean;
    orderId: string;
    amount: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    if (!isPlanId(args.plan) || args.plan === "free") {
      throw new Error("Paket yang dipilih tidak bisa dibeli.");
    }
    if (!(args.billingCycle in CYCLE_DAYS)) {
      throw new Error("Siklus pembayaran tidak dikenal.");
    }

    const amount = priceOf(args.plan, args.billingCycle);
    if (amount <= 0) throw new Error("Harga paket tidak valid.");

    const profile = await ctx.runQuery(internal.billing.getBillingProfile, {
      userId: identity.subject,
    });

    const keys = platformKeys();
    const snap = new Midtrans.Snap({
      isProduction: keys.isProduction,
      serverKey: keys.serverKey,
      clientKey: keys.clientKey,
    });

    const orderId = `SUB-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const planName = PLANS[args.plan].name;
    const cycleName = args.billingCycle === "yearly" ? "1 Tahun" : "1 Bulan";

    // Webhook langganan sengaja beda endpoint dari webhook toko: tanda tangannya
    // diverifikasi dengan server key yang berbeda, dan mencampurnya berarti
    // notifikasi toko akan ditolak (atau sebaliknya) tanpa jejak yang jelas.
    const convexSiteUrl = process.env.CONVEX_SITE_URL;

    // Ditulis sebagai variabel lebih dulu, bukan langsung sebagai argumen:
    // tipe bawaan @types/midtrans-client belum mengenal item_details, dan
    // pengecekan properti berlebih hanya berlaku untuk objek literal.
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id: `${args.plan}-${args.billingCycle}`,
          price: amount,
          quantity: 1,
          name: `Paket ${planName} — ${cycleName}`.substring(0, 49),
        },
      ],
      customer_details: {
        first_name: profile?.name ?? identity.name ?? "Pengguna singkat.in",
        email: profile?.email ?? identity.email ?? undefined,
      },
      ...(convexSiteUrl
        ? { notification_url: `${convexSiteUrl}/midtrans-subscription-webhook` }
        : {}),
    };

    const transaction: { token: string } = await snap.createTransaction(parameter);

    await ctx.runMutation(internal.billing.createPendingSubscription, {
      userId: identity.subject,
      plan: args.plan,
      billingCycle: args.billingCycle,
      amount,
      providerOrderId: orderId,
      snapToken: transaction.token,
    });

    return {
      token: transaction.token,
      clientKey: keys.clientKey,
      isProduction: keys.isProduction,
      orderId,
      amount,
    };
  },
});


/**
 * Menyiapkan pembayaran Paket Acara (sekali bayar, bukan langganan).
 *
 * Memakai jalur Snap dan webhook yang sama, dibedakan lewat awalan order id.
 * Menyatukannya lebih aman daripada membuat jalur kedua: satu tempat verifikasi
 * tanda tangan berarti satu tempat yang bisa salah.
 */
export const createEventPassCheckout = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    token: string;
    clientKey: string;
    isProduction: boolean;
    orderId: string;
    amount: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const profile = await ctx.runQuery(internal.billing.getBillingProfile, {
      userId: identity.subject,
    });

    const keys = platformKeys();
    const snap = new Midtrans.Snap({
      isProduction: keys.isProduction,
      serverKey: keys.serverKey,
      clientKey: keys.clientKey,
    });

    const orderId = `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const convexSiteUrl = process.env.CONVEX_SITE_URL;

    const parameter = {
      transaction_details: { order_id: orderId, gross_amount: EVENT_PASS.price },
      item_details: [
        {
          id: EVENT_PASS.id,
          price: EVENT_PASS.price,
          quantity: 1,
          name: `${EVENT_PASS.name} — ${EVENT_PASS.quota} sertifikat`.substring(0, 49),
        },
      ],
      customer_details: {
        first_name: profile?.name ?? identity.name ?? "Pengguna singkat.in",
        email: profile?.email ?? identity.email ?? undefined,
      },
      ...(convexSiteUrl
        ? { notification_url: `${convexSiteUrl}/midtrans-subscription-webhook` }
        : {}),
    };

    const transaction: { token: string } = await snap.createTransaction(parameter);

    await ctx.runMutation(internal.billing.createPendingSubscription, {
      userId: identity.subject,
      plan: "free", // paket acara tidak menaikkan langganan
      billingCycle: "event",
      amount: EVENT_PASS.price,
      providerOrderId: orderId,
      snapToken: transaction.token,
    });

    return {
      token: transaction.token,
      clientKey: keys.clientKey,
      isProduction: keys.isProduction,
      orderId,
      amount: EVENT_PASS.price,
    };
  },
});

/**
 * Memproses notifikasi Midtrans untuk pembelian paket.
 *
 * Tanda tangan diverifikasi memakai server key platform. Jangan pernah
 * mempercayai isi body tanpa verifikasi: endpoint ini terbuka di internet dan
 * siapa pun bisa mengirim JSON yang mengaku "settlement".
 */
export const verifyAndProcessSubscriptionWebhook = internalAction({
  args: { body: v.any() },
  handler: async (ctx, args) => {
    try {
      const { body } = args;
      const orderId = body?.order_id;

      const isSubscription = typeof orderId === "string" && orderId.startsWith("SUB-");
      const isEventPass = typeof orderId === "string" && orderId.startsWith("EVT-");

      if (!isSubscription && !isEventPass) {
        return { success: false, status: 404, message: "Not a platform order" };
      }

      const sub = await ctx.runQuery(internal.billing.getSubscriptionByOrderId, {
        providerOrderId: orderId,
      });

      if (!sub) {
        return { success: false, status: 404, message: "Subscription not found" };
      }

      const keys = platformKeys();
      const apiClient = new Midtrans.CoreApi({
        isProduction: keys.isProduction,
        serverKey: keys.serverKey,
        clientKey: keys.clientKey,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusResponse = await (apiClient as any).transaction.notification(body);

      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      const isPaid =
        transactionStatus === "settlement" ||
        (transactionStatus === "capture" && fraudStatus === "accept");

      const isFailed =
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire";

      if (isPaid) {
        // Nominal yang benar-benar dibayar harus cocok dengan yang ditagihkan.
        // Kalau tidak, paket jangan diaktifkan — lebih baik ditinjau manual.
        const paidAmount = Number(statusResponse.gross_amount);
        if (Number.isFinite(paidAmount) && Math.round(paidAmount) !== sub.amount) {
          await ctx.runMutation(internal.billing.markSubscriptionFailed, {
            providerOrderId: orderId,
            status: "challenge",
          });
          return { success: false, status: 200, message: "Amount mismatch" };
        }

        // Dua jenis pembelian, dua akibat berbeda: langganan menaikkan paket,
        // paket acara hanya menambah kuota sertifikat.
        if (isEventPass) {
          await ctx.runMutation(internal.billing.activateEventPass, {
            providerOrderId: orderId,
          });
        } else {
          await ctx.runMutation(internal.billing.activateSubscription, {
            providerOrderId: orderId,
          });
        }
        return { success: true, status: 200, message: "OK" };
      }

      if (isFailed) {
        await ctx.runMutation(internal.billing.markSubscriptionFailed, {
          providerOrderId: orderId,
          status: "failed",
        });
      }

      return { success: true, status: 200, message: "OK" };
    } catch (err) {
      console.error("Midtrans subscription webhook error:", err);
      return { success: false, status: 400, message: "Invalid Signature" };
    }
  },
});
