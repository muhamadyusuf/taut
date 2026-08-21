import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { assertAttemptQuota, recordFailedAttempt } from "./abuse";

export const getFormOwned = internalQuery({
  args: { formId: v.id("forms"), userId: v.string() },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form || form.userId !== args.userId) return null;
    return form;
  },
});

/** Memastikan sebuah respons benar-benar milik formulir yang disebut. */
export const getResponseInForm = internalQuery({
  args: { responseId: v.id("form_responses"), formId: v.id("forms") },
  handler: async (ctx, args) => {
    const response = await ctx.db.get(args.responseId);
    if (!response || response.formId !== args.formId) return null;
    return response;
  },
});

/**
 * Memotong jatah pengiriman email sertifikat per jam.
 *
 * Alamat tujuan dan isi email ditentukan pemanggil, dan email itu keluar lewat
 * akun pengiriman platform. Tanpa jatah, satu akun gratis cukup membuat satu
 * formulir lalu memakai satu respons yang sama berulang-ulang untuk mengirim
 * email ke alamat mana pun — reputasi domain pengirimlah yang menanggungnya.
 *
 * Angkanya jauh di atas satu acara berisi ratusan peserta, jadi panitia yang
 * benar-benar mengirim sertifikat tidak akan menyentuhnya.
 */
export const consumeEmailQuota = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const key = `cert_email:${args.userId}`;
    await assertAttemptQuota(ctx, key, 500);
    await recordFailedAttempt(ctx, key);
  },
});

export const markSentInternal = internalMutation({
  args: { responseId: v.id("form_responses") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.responseId, { certificateSentAt: Date.now() });
  },
});
