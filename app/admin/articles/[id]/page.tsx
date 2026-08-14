import { Id } from "@/convex/_generated/dataModel";
import ArticleEditor from "../_components/ArticleEditor";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ArticleEditor articleId={id as Id<"articles">} />;
}
