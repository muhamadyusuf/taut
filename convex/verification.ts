/**
 * VERIFIKASI SERTIFIKAT PUBLIK
 *
 * Halaman singkat.in/v/<kode> menjawab satu pertanyaan: apakah sertifikat ini
 * benar-benar diterbitkan lewat sistem ini, dan atas nama siapa.
 *
 * Terbuka tanpa login. Yang memeriksa keaslian sertifikat justru pihak ketiga
 * — perekrut, panitia beasiswa, bagian kepegawaian — dan mereka tidak punya
 * dan tidak akan membuat akun di sini.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { getEntitlementsForUser } from "./entitlements";

export const verifyCertificate = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    const code = args.code.trim().toUpperCase();
    if (!code) return { valid: false as const, reason: "Kode kosong." };

    const response = await ctx.db
      .query("form_responses")
      .withIndex("by_certificateCode", (q) => q.eq("certificateCode", code))
      .first();

    if (!response) {
      return {
        valid: false as const,
        reason: "Kode ini tidak terdaftar. Periksa kembali penulisannya.",
      };
    }

    const form = await ctx.db.get(response.formId);
    if (!form) {
      return {
        valid: false as const,
        reason: "Kegiatan penerbit sertifikat ini sudah dihapus.",
      };
    }

    const template = await ctx.db
      .query("certificate_templates")
      .withIndex("by_formId", (q) => q.eq("formId", response.formId))
      .first();

    // Hanya satu jawaban yang ditampilkan: nama penerima. Formulir bisa memuat
    // nomor telepon, alamat, atau data pribadi lain, dan halaman ini terbuka
    // untuk siapa saja — jadi tidak ada jawaban lain yang ikut dibuka.
    let recipientName: string | null = null;
    if (template?.nameQuestionId) {
      const answer = response.answers.find(
        (a) => a.questionId === template.nameQuestionId
      );
      recipientName = answer?.value.filter(Boolean).join(" ") || null;
    }

    const issuer = await getEntitlementsForUser(ctx, form.userId);
    const issuerName = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", form.userId))
      .first();

    return {
      valid: true as const,
      code,
      recipientName,
      eventTitle: form.title,
      issuedAt: response.certificateIssuedAt ?? response.submittedAt,
      submittedAt: response.submittedAt,
      issuerName: issuerName?.name ?? null,
      // Ditampilkan sebagai konteks, bukan jaminan: yang dijamin halaman ini
      // adalah sertifikatnya diterbitkan lewat sistem ini, bukan kredibilitas
      // penyelenggaranya.
      issuerPlan: issuer.plan,
    };
  },
});
