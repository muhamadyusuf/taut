import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { hashKey } from "./apiKeys";

const http = httpRouter();

/**
 * PENERIMA NOTIFIKASI MIDTRANS
 *
 * Satu penangan untuk dua jenis pembelian, dipilah dari awalan order id:
 *   SUB- / EVT-  -> pembelian paket & paket acara (kunci Midtrans platform)
 *   selain itu   -> pesanan toko penjual (kunci Midtrans milik penjual)
 *
 * Kenapa disatukan: Midtrans tidak selalu menghormati `notification_url` yang
 * dikirim per transaksi — pada banyak konfigurasi akun, URL yang disetel di
 * dashboard Midtrans-lah yang dipakai. Akibatnya notifikasi pembelian paket
 * bisa mendarat di endpoint toko, yang mencarinya di tabel `orders`, tidak
 * menemukannya, lalu menjawab 404. Dengan pemilahan di sini, notifikasi tetap
 * diproses dengan benar ke mana pun Midtrans mengirimkannya.
 */
async function handleMidtransNotification(
  ctx: Parameters<Parameters<typeof httpAction>[0]>[0],
  request: Request
): Promise<Response> {
  let body: { order_id?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response("Body bukan JSON yang sah", { status: 400 });
  }

  const orderId = typeof body?.order_id === "string" ? body.order_id : "";
  const isPlatformOrder = orderId.startsWith("SUB-") || orderId.startsWith("EVT-");

  const result = isPlatformOrder
    ? await ctx.runAction(
        internal.billingActions.verifyAndProcessSubscriptionWebhook,
        { body }
      )
    : await ctx.runAction(internal.midtransActions.verifyAndProcessWebhook, {
        body,
      });

  return new Response(result.message, { status: result.status });
}

/**
 * Ketiga jalur ini menerima notifikasi yang sama.
 *
 * Alamat lama dipertahankan karena sudah tercatat di dashboard Midtrans dan di
 * transaksi-transaksi yang terlanjur dibuat; mencabutnya berarti membuang
 * notifikasi untuk pembayaran yang sedang berjalan. Jalur "/api/..." ikut
 * didaftarkan karena bentuk itulah yang tertulis di convex/shopActions.ts dan
 * mudah tersalin ke pengaturan dashboard.
 */
for (const path of [
  "/midtrans-webhook",
  "/midtrans-subscription-webhook",
  "/api/midtrans-webhook",
]) {
  http.route({
    path,
    method: "POST",
    handler: httpAction(handleMidtransNotification),
  });
}


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

    // null berarti kuncinya sah tapi paketnya tidak lagi mencakup akses API.
    // 403, bukan 401: kuncinya benar, haknya yang hilang — dan membedakan
    // keduanya menghemat waktu pelanggan yang sedang mencari sebabnya.
    if (links === null) {
      return jsonResponse(
        { error: "Paket Anda tidak lagi mencakup akses API." },
        403
      );
    }

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