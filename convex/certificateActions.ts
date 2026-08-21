"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";

/**
 * Nama host yang menunjuk balik ke jaringan internal.
 *
 * Disalin dari convex/abuse.ts alih-alih diimpor karena berkas ini berjalan di
 * runtime Node ("use node") dan menarik modul mutation ke dalamnya akan
 * menyeret seluruh lapisan basis data ke bundel action.
 */
const PRIVATE_EXACT = new Set(["localhost", "::1", "[::1]", "0.0.0.0"]);

const PRIVATE_PREFIXES = [
  "127.",
  "10.",
  "192.168.",
  "169.254.", // link-local, termasuk endpoint metadata cloud
  "0.",
  "fc",
  "fd",
  "fe80",
];

function isPrivateHost(host: string): boolean {
  if (PRIVATE_EXACT.has(host)) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (PRIVATE_PREFIXES.some((prefix) => host.startsWith(prefix))) return true;

  const match = host.match(/^172\.(\d{1,3})\./);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }

  return false;
}

// Proxy fetch gambar template (menghindari CORS/taint saat digambar di <canvas>)
export const fetchImageAsBase64 = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<{ base64: string; mimeType: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Action ini mengambil URL apa pun dari sisi server lalu mengembalikan
    // isinya ke pemanggil. Tanpa penyaringan host, siapa pun yang sudah login
    // bisa memakainya sebagai teropong ke jaringan internal Convex — termasuk
    // endpoint metadata cloud. Karena itu hanya host publik yang dilayani.
    let parsed: URL;
    try {
      parsed = new URL(args.url);
    } catch {
      throw new Error("URL gambar tidak valid.");
    }

    if (parsed.protocol !== "https:") {
      throw new Error("URL gambar harus memakai https.");
    }
    if (isPrivateHost(parsed.hostname.toLowerCase())) {
      throw new Error("Alamat jaringan lokal tidak bisa diambil.");
    }

    // redirect: "manual" supaya host publik tidak bisa dipakai sebagai batu
    // loncatan: pengalihan ke 169.254.169.254 akan lolos pemeriksaan di atas
    // kalau fetch mengikutinya sendiri.
    const res = await fetch(parsed.toString(), { redirect: "manual" });
    if (!res.ok) throw new Error("Gagal mengambil gambar template.");

    const mimeType = res.headers.get("content-type") || "image/png";

    // Gambar template yang wajar berukuran ratusan kilobyte. Batas ini menahan
    // berkas raksasa yang hanya akan menghabiskan memori action.
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > 10 * 1024 * 1024) {
      throw new Error("Gambar template terlalu besar (maksimal 10 MB).");
    }

    return { base64: buffer.toString("base64"), mimeType };
  },
});

export const sendCertificateEmail = action({
  args: {
    formId: v.id("forms"),
    responseId: v.id("form_responses"),
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    attachmentBase64: v.string(),
    attachmentFilename: v.string(),
  },
  handler: async (ctx, args): Promise<{ sent: boolean }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const form = await ctx.runQuery(internal.certificatesInternal.getFormOwned, {
      formId: args.formId,
      userId: identity.subject,
    });
    if (!form) throw new Error("Formulir tidak ditemukan atau bukan milik Anda.");

    // Kepemilikan formulir saja tidak cukup: responseId dipakai untuk menandai
    // "sertifikat terkirim", dan tanpa pemeriksaan ini sebuah respons milik
    // formulir orang lain bisa ikut ditandai lewat argumen.
    const response = await ctx.runQuery(
      internal.certificatesInternal.getResponseInForm,
      { responseId: args.responseId, formId: args.formId }
    );
    if (!response) {
      throw new Error("Respons tidak ditemukan pada formulir ini.");
    }

    // Dipotong sebelum email dikirim, bukan sesudah: yang perlu ditahan adalah
    // permintaannya, bukan laporannya.
    await ctx.runMutation(internal.certificatesInternal.consumeEmailQuota, {
      userId: identity.subject,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY belum diatur di Convex. Tambahkan environment variable ini untuk mengaktifkan pengiriman email."
      );
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.CERTIFICATE_FROM_EMAIL || "Sertifikat <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from: fromAddress,
      to: args.to,
      subject: args.subject,
      html: args.html,
      attachments: [
        {
          filename: args.attachmentFilename,
          content: args.attachmentBase64,
        },
      ],
    });

    if (error) throw new Error(error.message || "Gagal mengirim email.");

    await ctx.runMutation(internal.certificatesInternal.markSentInternal, {
      responseId: args.responseId,
    });

    return { sent: true };
  },
});
