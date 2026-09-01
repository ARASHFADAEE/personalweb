import type { Metadata } from "next";
import { Suspense } from "react";
import { getSettings } from "@/lib/data/settings";
import { listCategoriesWithCount, getFeaturedPosts } from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlogExplorer } from "@/components/blog-explorer";
import { ArticleCard } from "@/components/article-card";

export const metadata: Metadata = {
  title: "وبلاگ",
  description: "همه‌ی مقالات تخصصی درباره‌ی Next.js، React، DevOps، هوش مصنوعی و معماری نرم‌افزار.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 600;

export default async function BlogPage() {
  const [settings, categories, featured] = await Promise.all([
    getSettings(),
    listCategoriesWithCount(),
    getFeaturedPosts(3),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <div className="border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-medium text-primary">وبلاگ</p>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                مقالات و نوشته‌های من
              </h1>
              <p className="mt-4 text-balance text-base leading-7 text-muted-foreground text-pretty">
                تجربه‌های واقعی، آموزش‌ها و درگیری‌های فنی با دنیای توسعه‌ی وب.
                فیلتر کن، جستجو کن، یا فقط بگرد و بخوان.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 lg:px-6 lg:py-12">
          {featured.length > 0 && (
            <div className="mb-12">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                منتخب سردبیر
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                {featured.map((p, i) => (
                  <ArticleCard key={p.id} post={p} variant="featured" priority={i === 0} />
                ))}
              </div>
            </div>
          )}

          <Suspense fallback={<div className="py-20 text-center text-muted-foreground">در حال بارگذاری…</div>}>
            <BlogExplorer categories={categories} />
          </Suspense>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
