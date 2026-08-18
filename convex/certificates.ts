import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { can, consumeMonthlyQuota } from "./entitlements";

const fieldValidator = v.object({
  id: v.string(),
  variable: v.string(),
  x: v.number(),
  y: v.number(),
  fontSize: v.number(),
  color: v.string(),
  fontFamily: v.string(),
  bold: v.boolean(),
  align: v.string(),
});

export const getTemplate = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const form = await ctx.db.get(args.formId);
    if (!form || form.userId !== identity.subject) return null;

    return await ctx.db
      .query("certificate_templates")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .first();
  },
});

export const saveTemplate = mutation({
  args: {
    formId: v.id("forms"),
    backgroundImageUrl: v.string(),
    width: v.number(),
    height: v.number(),
    fields: v.array(fieldValidator),
    driveFolderId: v.optional(v.string()),
    driveFolderName: v.optional(v.string()),
    emailQuestionId: v.optional(v.string()),
    nameQuestionId: v.optional(v.string()),
    emailSubject: v.optional(v.string()),
    emailBody: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const form = await ctx.db.get(args.formId);
    if (!form || form.userId !== identity.subject) {
      throw new Error("Formulir tidak ditemukan atau bukan milik Anda.");
    }

    const existing = await ctx.db
      .query("certificate_templates")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .first();

    const patch = {
      formId: args.formId,
      userId: identity.subject,
      backgroundImageUrl: args.backgroundImageUrl,
      width: args.width,
      height: args.height,
      fields: args.fields,
      driveFolderId: args.driveFolderId,
      driveFolderName: args.driveFolderName,
      emailQuestionId: args.emailQuestionId,
      emailSubject: args.emailSubject,
      emailBody: args.emailBody,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("certificate_templates", { ...patch, createdAt: Date.now() });
  },
});


/**
 * Alfabet kode verifikasi.
 *
 * Tanpa 0/O/1/I/L: kode ini dicetak di sertifikat dan sering diketik ulang
 * orang dari kertas, dan pasangan karakter itulah sumber salah ketik paling
 * sering.
 */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return `${out.slice(0, 5)}-${out.slice(5)}`;
}

/**
 * Menyiapkan penerbitan satu sertifikat: memotong kuota dan menerbitkan kode
 * verifikasi, lalu mengembalikan kodenya untuk dicetak ke gambar.
 *
 * Dipisah dari markCertificateGenerated karena urutannya penting — kode harus
 * sudah ada SEBELUM gambarnya dirender, kalau tidak kode itu tidak akan pernah
 * muncul di sertifikat yang diterima peserta.
 *
 * Aman dipanggil ulang: sertifikat yang sudah punya kode tidak memotong kuota
 * lagi, sehingga membuat ulang gambar karena salah ketik nama tidak menagih
 * peserta dua kali.
 */
export const prepareCertificate = mutation({
  args: { responseId: v.id("form_responses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const response = await ctx.db.get(args.responseId);
    if (!response) throw new Error("Respons tidak ditemukan.");

    const form = await ctx.db.get(response.formId);
    if (!form || form.userId !== identity.subject) throw new Error("Tidak diizinkan");

    if (response.certificateCode) {
      return { code: response.certificateCode, reissued: true };
    }

    await consumeMonthlyQuota(ctx, "certificatesPerMonth", "certificatesSent");

    // Verifikasi publik hanya untuk paket yang memilikinya; sertifikat tetap
    // bisa dibuat tanpa kode di paket gratis.
    const canVerify = await can(ctx, "certificate_verification");
    if (!canVerify) {
      await ctx.db.patch(args.responseId, { certificateIssuedAt: Date.now() });
      return { code: null, reissued: false };
    }

    let code = generateCode();
    for (let attempt = 0; attempt < 10; attempt++) {
      const clash = await ctx.db
        .query("form_responses")
        .withIndex("by_certificateCode", (q) => q.eq("certificateCode", code))
        .first();
      if (!clash) break;
      code = generateCode();
    }

    await ctx.db.patch(args.responseId, {
      certificateCode: code,
      certificateIssuedAt: Date.now(),
    });

    return { code, reissued: false };
  },
});

export const markCertificateGenerated = mutation({
  args: {
    responseId: v.id("form_responses"),
    certificateUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const response = await ctx.db.get(args.responseId);
    if (!response) throw new Error("Respons tidak ditemukan.");

    const form = await ctx.db.get(response.formId);
    if (!form || form.userId !== identity.subject) throw new Error("Tidak diizinkan");

    // Kuota sudah dipotong di prepareCertificate, sebelum gambarnya dibuat.
    // Di sini tinggal mencatat di mana berkasnya berada.
    await ctx.db.patch(args.responseId, { certificateUrl: args.certificateUrl });
  },
});

export const markCertificateSent = mutation({
  args: { responseId: v.id("form_responses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const response = await ctx.db.get(args.responseId);
    if (!response) throw new Error("Respons tidak ditemukan.");

    const form = await ctx.db.get(response.formId);
    if (!form || form.userId !== identity.subject) throw new Error("Tidak diizinkan");

    await ctx.db.patch(args.responseId, { certificateSentAt: Date.now() });
  },
});
