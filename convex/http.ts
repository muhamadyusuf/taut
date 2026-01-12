"use node";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import Midtrans from "midtrans-client";

const http = httpRouter();

http.route({
  path: "/midtrans-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
        const body = await request.json();
        const midtransOrderId = body.order_id;

        // 1. CARI DATA ORDER DI DB KITA
        const order = await ctx.runQuery(internal.shop.getOrderByMidtransId, { 
            midtransOrderId 
        });

        if (!order) {
            return new Response("Order not found", { status: 404 });
        }

        // 2. AMBIL SERVER KEY PENJUAL ASLI
        const settings = await ctx.runQuery(internal.shop.getSellerSettingsInternal, { 
            userId: order.sellerId 
        });

        if (!settings || !settings.serverKey) {
             return new Response("Seller config not found", { status: 500 });
        }

        // 3. VERIFIKASI SIGNATURE
        const apiClient = new Midtrans.CoreApi({
            isProduction: settings.isProduction,
            serverKey: settings.serverKey,
            clientKey: settings.clientKey
        });

        // Casting (as any) untuk menghindari error TypeScript
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusResponse = await (apiClient as any).transaction.notification(body);

        // 4. UPDATE STATUS
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        let newStatus = "pending";

        if (transactionStatus == 'capture'){
            if (fraudStatus == 'challenge'){
                newStatus = 'challenge';
            } else if (fraudStatus == 'accept'){
                newStatus = 'paid';
            }
        } else if (transactionStatus == 'settlement'){
            newStatus = 'paid';
        } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire'){
            newStatus = 'failed';
        } else if (transactionStatus == 'pending'){
            newStatus = 'pending';
        }

        await ctx.runMutation(api.shop.updateOrderStatusInternal, {
            midtransOrderId: orderId,
            status: newStatus
        });

        return new Response("OK", { status: 200 });

    } catch (err) {
        console.error("Webhook Error:", err);
        return new Response("Invalid Signature or Error", { status: 400 });
    }
  }),
});

export default http;