import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * PENAMPUNG JEBAKAN TINGKAT URL
 *
 * Middleware mengalihkan alamat-alamat umpan ke sini. Tugasnya dua:
 * mencatat siapa yang mengetuk beserta dari mana, lalu menjawab dengan 404
 * yang tidak membedakan dirinya dari 404 biasa.
 *
 * Kenapa 404 dan bukan "Anda terdeteksi": pemindai otomatis membaca kode
 * status, dan jawaban yang berbeda memberi tahu pelaku persis alamat mana yang
 * dipantau. Umpan yang mengumumkan dirinya hanya berguna sekali.
 */

/** Nama header yang dipakai Vercel untuk asal permintaan. */
function clientIp(h: Headers): string | undefined {
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? undefined;
}

function decodeHeader(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Alamat endpoint HTTP Convex.
 *
 * Fungsi HTTP dilayani di domain *.convex.site, sedangkan klien biasa memakai
 * *.convex.cloud. Diturunkan dari satu variabel yang sudah ada supaya tidak ada
 * alamat kedua yang harus diingat saat berpindah deployment.
 */
function convexSiteUrl(): string | null {
  const cloud = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!cloud) return null;
  return cloud.replace(/\.convex\.cloud\/?$/, ".convex.site");
}

async function handle(request: Request): Promise<Response> {
  const h = await headers();
  const url = new URL(request.url);

  // Path aslinya dititipkan middleware lewat header. Kalau header itu hilang
  // (mis. seseorang membuka /trap/... langsung, tanpa lewat rewrite), awalan
  // "/trap" dibuang sendiri di sini — tanpa itu yang tercatat adalah alamat
  // internal hasil rewrite, bukan alamat yang benar-benar diketuk orang.
  const target =
    h.get("x-trap-target") ?? url.pathname.replace(/^\/trap(?=\/|$)/, "") ?? "/";

  // Identitas hanya terisi bila pengetuknya kebetulan sedang login. Banyak yang
  // tidak — dan itu justru bagian dari jawabannya: pelaku yang login jauh lebih
  // mudah ditindak daripada satu alamat IP yang berganti tiap jam.
  let userId: string | undefined;
  try {
    userId = (await auth()).userId ?? undefined;
  } catch {
    userId = undefined;
  }

  const payload = {
    kind: "honeypot_path",
    target,
    method: request.method,
    ip: clientIp(h),
    country: h.get("x-vercel-ip-country") ?? undefined,
    city: decodeHeader(h.get("x-vercel-ip-city")),
    region: decodeHeader(h.get("x-vercel-ip-country-region")),
    userAgent: h.get("user-agent") ?? undefined,
    referer: h.get("referer") ?? undefined,
    userId,
    detail: url.search ? `query: ${url.search.slice(0, 200)}` : undefined,
  };

  const site = convexSiteUrl();
  const secret = process.env.TRAP_INGEST_SECRET;

  if (site && secret) {
    try {
      const res = await fetch(`${site}/trap-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-trap-secret": secret,
        },
        body: JSON.stringify(payload),
        // Pencatatan tidak boleh menahan respons lebih lama daripada 404 biasa:
        // waktu jawab yang menyimpang justru menandai alamat ini sebagai umpan.
        signal: AbortSignal.timeout(3000),
      });

      // Jawaban non-OK ikut dilaporkan. Tanpa ini, rahasia yang salah atau
      // fungsi Convex yang belum ter-deploy membuat SETIAP jebakan gagal
      // dicatat tanpa satu pun jejak — jebakan yang diam-diam mati adalah
      // keadaan terburuk: kelihatannya terpasang, padahal tidak menangkap apa pun.
      if (!res.ok) {
        console.error(
          `Laporan jebakan ditolak Convex (${res.status}). Periksa TRAP_INGEST_SECRET di kedua sisi, dan pastikan convex/http.ts sudah ter-deploy.`
        );
      }
    } catch (error) {
      console.error("Gagal mengirim laporan jebakan:", error);
    }
  } else {
    console.warn(
      "Jebakan aktif tapi belum tersambung: set TRAP_INGEST_SECRET di Next.js dan di Convex."
    );
  }

  return new NextResponse("Not Found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
