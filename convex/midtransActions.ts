"use node"; // WAJIB DI SINI
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Midtrans from "midtrans-client";

export const verifyAndProcessWebhook = internalAction({
  args: {
    body: v.any(), // Menerima JSON body mentah dari webhook
  },
  handler: async (ctx, args) => {
    try {
      const { body } = args;
      const midtransOrderId = body.order_id;

      // 1. CARI DATA ORDER DI DB
      const order = await ctx.runQuery(internal.shop.getOrderByMidtransId, {
        midtransOrderId,
      });

      if (!order) {
        return { success: false, status: 404, message: "Order not found" };
      }

      // 2. AMBIL SERVER KEY PENJUAL
      const settings = await ctx.runQuery(internal.shop.getSellerSettingsInternal, {
        userId: order.sellerId,
      });

      if (!settings || !settings.serverKey) {
        return { success: false, status: 500, message: "Seller config missing" };
      }

      // 3. VERIFIKASI SIGNATURE (Di Node.js Environment)
      const apiClient = new Midtrans.CoreApi({
        isProduction: settings.isProduction,
        serverKey: settings.serverKey,
        clientKey: settings.clientKey,
      });

      // Verifikasi Signature
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusResponse = await (apiClient as any).transaction.notification(body);

      // 4. TENTUKAN STATUS BARU
      const orderId = statusResponse.order_id;
      const transactionStatus = statusResponse.transaction_status;
      const fraudStatus = statusResponse.fraud_status;

      let newStatus = "pending";

      if (transactionStatus == "capture") {
        if (fraudStatus == "challenge") {
          newStatus = "challenge";
        } else if (fraudStatus == "accept") {
          newStatus = "paid";
        }
      } else if (transactionStatus == "settlement") {
        newStatus = "paid";
      } else if (
        transactionStatus == "cancel" ||
        transactionStatus == "deny" ||
        transactionStatus == "expire"
      ) {
        newStatus = "failed";
      } else if (transactionStatus == "pending") {
        newStatus = "pending";
      }

      // 5. UPDATE DB (Panggil Mutation)
      await ctx.runMutation(api.shop.updateOrderStatusInternal, {
        midtransOrderId: orderId,
        status: newStatus,
      });

      return { success: true, status: 200, message: "OK" };
    } catch (err) {
      console.error("Midtrans Error:", err);
      return { success: false, status: 400, message: "Invalid Signature" };
    }
  },
});