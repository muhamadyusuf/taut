"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Resend } from "resend";

// Proxy fetch gambar template (menghindari CORS/taint saat digambar di <canvas>)
export const fetchImageAsBase64 = action({
  args: { url: v.string() },
  handler: async (ctx, args): Promise<{ base64: string; mimeType: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    if (!/^https:\/\//.test(args.url)) {
      throw new Error("URL gambar tidak valid.");
    }

    const res = await fetch(args.url);
    if (!res.ok) throw new Error("Gagal mengambil gambar template.");

    const mimeType = res.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await res.arrayBuffer());

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
