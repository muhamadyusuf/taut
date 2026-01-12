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
        // Kita butuh tau siapa penjualnya untuk mendapatkan Server Key yang benar
        const order = await ctx.runQuery(internal.shop.getOrderByMidtransId, { 
            midtransOrderId 
        });

        if (!order) {
            return new Response("Order not found", { status: 404 });
        }

        // 2. AMBIL SERVER KEY PENJUAL
        const settings = await ctx.runQuery(internal.shop.getSellerSettingsInternal, { 
            userId: order.sellerId 
        });

        if (!settings || !settings.serverKey) {
             return new Response("Seller config not found", { status: 500 });
        }

        // 3. VERIFIKASI SIGNATURE DENGAN MIDTRANS CLIENT
        // Kita inisialisasi ulang CoreApi dengan Server Key penjual tersebut
        const apiClient = new Midtrans.CoreApi({
            isProduction: settings.isProduction,
            serverKey: settings.serverKey,
            clientKey: settings.clientKey
        });

        // Fungsi ini akan melempar error jika Signature PALSU
        // eslint-disable-next-line
        const statusResponse = await (apiClient as any).transaction.notification(body);

        // 4. JIKA LOLOS VERIFIKASI, BARU UPDATE STATUS
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

        // Panggil Mutation Update Status
        await ctx.runMutation(api.shop.updateOrderStatusInternal, {
            midtransOrderId: orderId,
            status: newStatus
        });

        return new Response("OK", { status: 200 });

    } catch (err) {
        console.error("Webhook Error:", err);
        // Jangan return status 500 sembarangan agar Midtrans tidak retry terus menerus jika errornya karena data tidak valid
        return new Response("Invalid Signature or Error", { status: 400 });
    }
  }),
});

export default http;