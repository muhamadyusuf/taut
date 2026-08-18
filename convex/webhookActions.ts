"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHmac } from "crypto";

/**
 * Mengirim satu kejadian ke semua endpoint yang berlangganan.
 *
 * Dipanggil terjadwal dari mutation, tidak ditunggu: endpoint pelanggan yang
 * lambat atau mati tidak boleh memperlambat — apalagi menggagalkan — tindakan
 * yang memicunya. Pengguna yang membuat tautan tidak peduli pada Zapier mereka
 * yang sedang bermasalah.
 */
export const dispatch = internalAction({
  args: {
    userId: v.string(),
    event: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const targets = await ctx.runQuery(internal.webhooks.getTargets, {
      userId: args.userId,
      event: args.event,
    });

    if (targets.length === 0) return { sent: 0 };

    const body = JSON.stringify({
      event: args.event,
      created_at: new Date().toISOString(),
      data: args.payload,
    });

    let sent = 0;

    for (const target of targets) {
      const signature = createHmac("sha256", target.secret)
        .update(body)
        .digest("hex");

      try {
        const response = await fetch(target.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Singkat-Event": args.event,
            "X-Singkat-Signature": `sha256=${signature}`,
          },
          body,
          // Endpoint yang menggantung tidak boleh menahan action ini selamanya.
          signal: AbortSignal.timeout(10_000),
        });

        await ctx.runMutation(internal.webhooks.recordDelivery, {
          webhookId: target.id,
          userId: args.userId,
          event: args.event,
          status: response.ok ? "success" : "failed",
          statusCode: response.status,
        });

        if (response.ok) sent += 1;
      } catch (error) {
        await ctx.runMutation(internal.webhooks.recordDelivery, {
          webhookId: target.id,
          userId: args.userId,
          event: args.event,
          status: "failed",
          error: error instanceof Error ? error.message : "Gagal terhubung",
        });
      }
    }

    return { sent };
  },
});
