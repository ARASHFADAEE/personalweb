import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { listAllTags, listCategories } from "@/lib/data/posts";
import { PostEditor } from "@/components/admin/post-editor";

export const metadata: Metadata = { title: "ویرایش مقاله", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    db.post.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    listCategories(),
    listAllTags(),
  ]);
  if (!post) notFound();

  const initial = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    content: post.content ?? "",
    coverImage: post.coverImage ?? "",
    status: post.status,
    featured: post.featured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    categoryId: post.categoryId,
    tagIds: post.tags.map((t) => t.tag.id),
    seoTitle: post.seoTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    ogTitle: post.ogTitle ?? "",
    ogDescription: post.ogDescription ?? "",
    ogImage: post.ogImage ?? "",
    focusKeyword: post.focusKeyword ?? "",
    robotsNoindex: post.robotsNoindex,
    robotsNofollow: post.robotsNofollow,
  };

  return <PostEditor initial={initial} categories={categories} tags={tags} />;
}
