import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getFormOwned = internalQuery({
  args: { formId: v.id("forms"), userId: v.string() },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form || form.userId !== args.userId) return null;
    return form;
  },
});

export const markSentInternal = internalMutation({
  args: { responseId: v.id("form_responses") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.responseId, { certificateSentAt: Date.now() });
  },
});
