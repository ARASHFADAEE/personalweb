import type { Metadata } from "next";
import { listAllTags, listCategories } from "@/lib/data/posts";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "مقاله‌ی جدید", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const [categories, tags] = await Promise.all([listCategories(), listAllTags()]);
  return <PostEditor initial={null} categories={categories} tags={tags} />;
}
