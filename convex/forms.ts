import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const questionValidator = v.object({
  id: v.string(),
  type: v.string(),
  label: v.string(),
  description: v.optional(v.string()),
  required: v.boolean(),
  options: v.optional(v.array(v.string())),
  scaleMin: v.optional(v.number()),
  scaleMax: v.optional(v.number()),
  scaleMinLabel: v.optional(v.string()),
  scaleMaxLabel: v.optional(v.string()),
});

const sectionValidator = v.object({
  id: v.string(),
  title: v.optional(v.string()),
  description: v.optional(v.string()),
  questions: v.array(questionValidator),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

export const createForm = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const base = slugify(args.title) || "form";
    let slug = base;
    let attempt = 0;

    // Pastikan slug unik
    while (
      await ctx.db.query("forms").withIndex("by_slug", (q) => q.eq("slug", slug)).first()
    ) {
      attempt += 1;
      slug = `${base}-${Math.random().toString(36).substring(2, 6)}`;
      if (attempt > 20) throw new Error("Gagal membuat slug unik.");
    }

    const formId = await ctx.db.insert("forms", {
      userId: identity.subject,
      slug,
      title: args.title || "Formulir Tanpa Judul",
      description: "",
      status: "draft",
      acceptingResponses: true,
      confirmationMessage: "Terima kasih! Jawaban Anda telah tercatat.",
      theme: "default-purple",
      sections: [{ id: `section-${Date.now()}`, title: undefined, description: undefined, questions: [] }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return formId;
  },
});

export const getMyForms = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("forms")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const getFormById = query({
  args: { id: v.id("forms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const form = await ctx.db.get(args.id);
    if (!form || form.userId !== identity.subject) return null;

    return form;
  },
});

export const updateForm = mutation({
  args: {
    id: v.id("forms"),
    title: v.string(),
    description: v.optional(v.string()),
    slug: v.string(),
    status: v.string(),
    acceptingResponses: v.boolean(),
    confirmationMessage: v.optional(v.string()),
    theme: v.optional(v.string()),
    sections: v.array(sectionValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Formulir tidak ditemukan atau bukan milik Anda.");
    }

    const newSlug = slugify(args.slug) || existing.slug;
    if (newSlug !== existing.slug) {
      const isTaken = await ctx.db
        .query("forms")
        .withIndex("by_slug", (q) => q.eq("slug", newSlug))
        .first();
      if (isTaken) throw new Error("Slug ini sudah dipakai formulir lain.");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      slug: newSlug,
      status: args.status,
      acceptingResponses: args.acceptingResponses,
      confirmationMessage: args.confirmationMessage,
      theme: args.theme,
      sections: args.sections,
      updatedAt: Date.now(),
    });
  },
});

export const deleteForm = mutation({
  args: { id: v.id("forms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const form = await ctx.db.get(args.id);
    if (!form || form.userId !== identity.subject) {
      throw new Error("Tidak diizinkan");
    }

    const responses = await ctx.db
      .query("form_responses")
      .withIndex("by_formId", (q) => q.eq("formId", args.id))
      .collect();

    for (const res of responses) {
      await ctx.db.delete(res._id);
    }

    await ctx.db.delete(args.id);
  },
});

// --- PUBLIC (untuk halaman pengisian formulir) ---

export const getFormBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const form = await ctx.db
      .query("forms")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!form || form.status !== "published") return null;

    return form;
  },
});

export const submitResponse = mutation({
  args: {
    formId: v.id("forms"),
    answers: v.array(
      v.object({
        questionId: v.string(),
        value: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.formId);
    if (!form || form.status !== "published" || !form.acceptingResponses) {
      throw new Error("Formulir ini tidak lagi menerima jawaban.");
    }

    // Validasi pertanyaan wajib di semua bagian
    const allQuestions = form.sections.flatMap((section) => section.questions);
    for (const question of allQuestions) {
      if (!question.required) continue;
      const answer = args.answers.find((a) => a.questionId === question.id);
      const hasValue = answer?.value.some((v) => v.trim() !== "");
      if (!hasValue) {
        throw new Error(`Pertanyaan "${question.label}" wajib diisi.`);
      }
    }

    await ctx.db.insert("form_responses", {
      formId: args.formId,
      answers: args.answers,
      submittedAt: Date.now(),
    });
  },
});

// --- RESPONSES (pemilik formulir) ---

export const getResponses = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const form = await ctx.db.get(args.formId);
    if (!form || form.userId !== identity.subject) return [];

    return await ctx.db
      .query("form_responses")
      .withIndex("by_formId", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();
  },
});

export const deleteResponse = mutation({
  args: { id: v.id("form_responses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const response = await ctx.db.get(args.id);
    if (!response) throw new Error("Respons tidak ditemukan.");

    const form = await ctx.db.get(response.formId);
    if (!form || form.userId !== identity.subject) {
      throw new Error("Tidak diizinkan");
    }

    await ctx.db.delete(args.id);
  },
});
