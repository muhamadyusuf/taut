import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/midtrans-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // 1. Parse Body
    const body = await request.json();

    // 2. Panggil Internal Action (yang jalan di Node.js)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await ctx.runAction((internal as any).midtransActions.verifyAndProcessWebhook, {
      body: body,
    });

    // 3. Kembalikan Response ke Midtrans
    return new Response(result.message, { status: result.status });
  }),
});

export default http;