import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import FormFillClient from "./FormFillClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const form = await fetchQuery(api.forms.getFormBySlug, { slug });

  if (!form) return { title: "Formulir Tidak Ditemukan" };

  return {
    title: `${form.title} | Singkat.in`,
    description: form.description || "Isi formulir ini.",
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;
  const form = await fetchQuery(api.forms.getFormBySlug, { slug });

  if (!form) return notFound();

  return <FormFillClient form={form} />;
}
