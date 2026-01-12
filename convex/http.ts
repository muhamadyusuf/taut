import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/midtrans-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    const orderId = body.order_id;
    const status = body.transaction_status;
    const fraud = body.fraud_status;

    let newStatus = "pending";
    if (status == 'capture' || status == 'settlement'){
        if (fraud == 'challenge'){
            newStatus = 'challenge';
        } else {
            newStatus = 'paid';
        }
    } else if (status == 'cancel' || status == 'deny' || status == 'expire'){
        newStatus = 'failed';
    }

    // Panggil Mutation Update Status
    await ctx.runMutation(api.shop.updateOrderStatusInternal, {
        midtransOrderId: orderId,
        status: newStatus
    });

    return new Response("OK", { status: 200 });
  }),
});

export default http;