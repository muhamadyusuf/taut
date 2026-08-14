import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
