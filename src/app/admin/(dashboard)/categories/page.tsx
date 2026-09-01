import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const metadata: Metadata = { title: "دسته‌بندی‌ها", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
  const items = categories.map((c) => ({
    id: c.id, name: c.name, slug: c.slug, description: c.description,
    color: c.color, seoTitle: c.seoTitle, metaDescription: c.metaDescription,
    postsCount: c._count.posts,
  }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">دسته‌بندی‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} دسته در مجموع</p>
      </div>
      <CategoriesManager initial={items} />
    </div>
  );
}
