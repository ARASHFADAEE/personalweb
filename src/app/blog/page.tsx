import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Flame, Layers, Sparkles, TrendingUp } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { listCategoriesWithCount, getFeaturedPosts, listPublishedPosts } from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BlogExplorer } from "@/components/blog-explorer";
import { ArticleCard } from "@/components/article-card";
import { formatCount } from "@/lib/slug";
import { Badge } from "@/components/ui/badge";

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
    getFeaturedPosts(4),
    listPublishedPosts({ perPage: 1 }),
  ]);

  const totalPosts = allPosts.total;
  const topCategories = [...categories].sort((a, b) => b.postsCount - a.postsCount).slice(0, 5);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        {/* Editorial hero */}
        <section className="blog-hero relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-primary/15 blur-[100px]" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-primary/8 blur-[80px]" />
            <div
              className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          </div>

          <div className="container mx-auto px-4 py-14 lg:px-6 lg:py-20">
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-3xl">
                <Badge variant="outline" className="mb-5 gap-1.5 bg-background/70 py-1 text-xs font-medium backdrop-blur-sm">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {settings.siteName} · وبلاگ
                </Badge>
                <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                  دنیای نوشته‌ها
                  <span className="mt-2 block bg-gradient-to-l from-primary via-primary to-primary/55 bg-clip-text text-transparent">
                    برای توسعه‌دهندگان کنجکاو
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-balance text-base leading-8 text-muted-foreground text-pretty sm:text-lg">
                  تجربه‌های واقعی، آموزش‌های عمیق و درگیری‌های فنی — از Next.js و React تا DevOps و AI.
                  موضوع دلخواهت را پیدا کن و شروع کن.
                </p>

                {topCategories.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {topCategories.map((c) => (
                      <Link
                        key={c.id}
                        href={`/categories/${c.slug}`}
                        className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3.5 py-1.5 text-sm transition-all hover:border-primary/40 hover:bg-primary/5"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="font-mono text-xs text-muted-foreground group-hover:text-primary">
                          {formatCount(c.postsCount)}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="blog-hero-panel relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-gradient-to-br from-card via-card to-secondary/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
                <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-primary">آمار وبلاگ</p>
                <div className="relative mt-6 grid grid-cols-2 gap-4">
                  <StatTile icon={<Layers className="h-4 w-4" />} label="مقاله" value={formatCount(totalPosts)} />
                  <StatTile icon={<Sparkles className="h-4 w-4" />} label="دسته‌بندی" value={formatCount(categories.length)} />
                  <StatTile icon={<Flame className="h-4 w-4" />} label="منتخب" value={formatCount(featured.length)} accent />
                  <StatTile icon={<TrendingUp className="h-4 w-4" />} label="موضوع فعال" value={formatCount(topCategories.length)} />
                </div>
                <p className="relative mt-6 text-xs leading-6 text-muted-foreground">
                  هر هفته محتوای تازه — جستجو، فیلتر و مرتب‌سازی برای پیدا کردن دقیق همان چیزی که می‌خواهی.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
          {/* Featured bento */}
          {featured.length > 0 && (
            <section className="mb-16 lg:mb-20">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    منتخب سردبیر
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">پیشنهاد ویژه برای شروع</h2>
                </div>
                <Link
                  href="#articles"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  رفتن به همه‌ی مقالات
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:gap-5 lg:grid-cols-12 lg:grid-rows-2">
                <div className="blog-bento-item lg:col-span-7 lg:row-span-2">
                  <ArticleCard post={featured[0]} variant="bento-hero" priority />
                </div>
                {featured.slice(1, 3).map((p, i) => (
                  <div key={p.id} className="blog-bento-item lg:col-span-5" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                    <ArticleCard post={p} variant="bento" priority={i === 0} />
                  </div>
                ))}
                {featured[3] && (
                  <div className="blog-bento-item lg:col-span-12">
                    <ArticleCard post={featured[3]} variant="editorial" />
                  </div>
                )}
              </div>
            </section>
          )}

          <section id="articles">
            <Suspense fallback={<BlogLoadingSkeleton />}>
              <BlogExplorer categories={categories} totalPosts={totalPosts} />
            </Suspense>
          </section>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        accent
          ? "border-primary/30 bg-primary/10"
          : "border-border/70 bg-background/60"
      }`}
    >
      <div className={`mb-2 ${accent ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      <p className="font-mono text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function BlogLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-14 animate-pulse rounded-2xl bg-muted/60" />
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
            <div className="grid gap-4 p-4 sm:grid-cols-[220px,1fr]">
              <div className="aspect-[16/10] rounded-xl bg-muted sm:aspect-auto sm:min-h-[160px]" />
              <div className="space-y-3 py-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-7 w-full rounded bg-muted" />
                <div className="h-4 w-3/4 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
