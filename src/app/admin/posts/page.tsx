import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { listCategoriesWithCount, listAllTags } from "@/lib/data/posts";
import { PostManager } from "@/components/admin/post-manager";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "مدیریت مقالات", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const [posts, categories, tags] = await Promise.all([
    db.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true, slug: true } }, tags: { include: { tag: { select: { id: true, name: true } } } } },
    }),
    listCategoriesWithCount(),
    listAllTags(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">مقالات</h1>
          <p className="mt-1 text-sm text-muted-foreground">{posts.length} مقاله در مجموع</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4" />
            مقاله‌ی جدید
          </Link>
        </Button>
      </div>

      <PostManager initialPosts={posts} categories={categories} tags={tags} />
    </div>
  );
}
