import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashKey } from "./apiKeys";

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

/**
 * Webhook pembelian paket langganan.
 *
 * Sengaja terpisah dari /midtrans-webhook milik toko: keduanya memverifikasi
 * tanda tangan dengan server key yang berbeda (platform vs penjual), jadi
 * menyatukannya hanya akan membuat salah satu notifikasi ditolak diam-diam.
 */
http.route({
  path: "/midtrans-subscription-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    const result = await ctx.runAction(
      internal.billingActions.verifyAndProcessSubscriptionWebhook,
      { body }
    );

    return new Response(result.message, { status: result.status });
  }),
});


/**
 * API PUBLIK v1
 *
 * Autentikasi memakai header Authorization: Bearer <kunci>. Kunci ditukar
 * dengan sidik jarinya lebih dulu — yang tersimpan di basis data memang hanya
 * sidik jari, bukan kuncinya.
 */
const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

http.route({
  path: "/api/v1/links",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const auth = request.headers.get("authorization") ?? "";
    const raw = auth.replace(/^Bearer\s+/i, "").trim();
    if (!raw) return jsonResponse({ error: "Kunci API tidak disertakan." }, 401);

    const hash = await hashKey(raw);
    const owner = await ctx.runMutation(internal.apiKeys.resolveKey, { hash });
    if (!owner) return jsonResponse({ error: "Kunci API tidak dikenal." }, 401);

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");

    const links = await ctx.runQuery(internal.publicApi.listLinksForApi, {
      userId: owner.userId,
      limit: Number.isFinite(limit) ? limit : 50,
    });

    return jsonResponse({ data: links }, 200);
  }),
});

http.route({
  path: "/api/v1/links",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const auth = request.headers.get("authorization") ?? "";
    const raw = auth.replace(/^Bearer\s+/i, "").trim();
    if (!raw) return jsonResponse({ error: "Kunci API tidak disertakan." }, 401);

    const hash = await hashKey(raw);
    const owner = await ctx.runMutation(internal.apiKeys.resolveKey, { hash });
    if (!owner) return jsonResponse({ error: "Kunci API tidak dikenal." }, 401);

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "Body harus berupa JSON." }, 400);
    }

    const originalUrl = typeof body.url === "string" ? body.url : "";
    if (!originalUrl) {
      return jsonResponse({ error: "Field 'url' wajib diisi." }, 400);
    }

    const result = await ctx.runMutation(internal.publicApi.createLinkForApi, {
      userId: owner.userId,
      originalUrl,
      customSlug: typeof body.slug === "string" ? body.slug : undefined,
      title: typeof body.title === "string" ? body.title : undefined,
    });

    if ("error" in result && result.error) {
      return jsonResponse({ error: result.error }, 400);
    }

    return jsonResponse(result, 201);
  }),
});

export default http;