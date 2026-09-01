import type { Metadata } from "next";
import { db } from "@/lib/db";
import { TagsManager } from "@/components/admin/tags-manager";

export const metadata: Metadata = { title: "تگ‌ها", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const tags = await db.tag.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  const items = tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, postsCount: t._count.posts }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تگ‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} تگ در مجموع</p>
      </div>
      <TagsManager initial={items} />
    </div>
  );
}
