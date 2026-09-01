import type { Metadata } from "next";
import { Suspense } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { listCategoriesWithCount, getFeaturedPosts, listPublishedPosts } from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlogExplorer } from "@/components/blog-explorer";
import { ArticleCard } from "@/components/article-card";
import { formatCount } from "@/lib/slug";

export const metadata: Metadata = {
  title: "وبلاگ",
  description: "همه‌ی مقالات تخصصی درباره‌ی Next.js، React، DevOps، هوش مصنوعی و معماری نرم‌افزار.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 600;

export default async function BlogPage() {
  const [settings, categories, featured, allPosts] = await Promise.all([
    getSettings(),
    listCategoriesWithCount(),
    getFeaturedPosts(3),
    listPublishedPosts({ perPage: 1 }),
  ]);

  const totalPosts = allPosts.total;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-primary/5 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 py-14 lg:px-6 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-[1fr,auto] lg:items-end">
              <div className="max-w-2xl">
                <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  <BookOpen className="h-4 w-4" />
                  وبلاگ
                </p>
                <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  مقالات و نوشته‌های من
                </h1>
                <p className="mt-4 text-balance text-base leading-8 text-muted-foreground text-pretty">
                  تجربه‌های واقعی، آموزش‌ها و درگیری‌های فنی با دنیای توسعه‌ی وب.
                  جستجو کن، فیلتر کن، بخوان.
                </p>
              </div>
              <div className="flex gap-6 rounded-2xl border border-border bg-card/60 px-6 py-4 backdrop-blur-sm">
                <div>
                  <p className="font-mono text-2xl font-bold text-primary">{formatCount(totalPosts)}</p>
                  <p className="text-xs text-muted-foreground">مقاله</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="font-mono text-2xl font-bold text-primary">{formatCount(categories.length)}</p>
                  <p className="text-xs text-muted-foreground">دسته‌بندی</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-10 lg:px-6 lg:py-14">
          {/* Featured — hero + 2 cards */}
          {featured.length > 0 && (
            <section className="mb-14">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-bold tracking-tight">منتخب سردبیر</h2>
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  <ArticleCard post={featured[0]} variant="hero" priority />
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                  {featured.slice(1).map((p) => (
                    <ArticleCard key={p.id} post={p} variant="featured" />
                  ))}
                </div>
              </div>
            </section>
          )}

          <Suspense fallback={<BlogLoadingSkeleton />}>
            <BlogExplorer categories={categories} />
          </Suspense>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}

function BlogLoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
          <div className="aspect-[16/10] bg-muted" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-6 w-full rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
