import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Eye,
  ChevronLeft,
  PenLine,
  RotateCcw,
} from "lucide-react";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/data/posts";
import { getSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/table-of-contents";
import { ShareButtons } from "@/components/share-buttons";
import { ArticleComments } from "@/components/article-comments";
import { ViewTracker } from "@/components/view-tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatJalali, formatJalaliShort } from "@/lib/jalali";
import { toPersianDigits, formatCount } from "@/lib/slug";
import { extractHeadings } from "@/lib/headings";
import { cn } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  const settings = await getSettings();
  if (!post) {
    return { title: "مقاله یافت نشد", robots: { index: false, follow: true } };
  }
  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt || settings.defaultSeoDescription;
  const ogImage = post.ogImage || post.coverImage || settings.defaultOgImage;
  const canonical = post.canonicalUrl || `/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      url: canonical,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.ogTitle || title,
      description: post.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
    robots: {
      index: !post.robotsNoindex,
      follow: !post.robotsNofollow,
    },
  };
}

export const revalidate = 600;

export default async function ArticlePage({ params }: { params: Params }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getPublishedPostBySlug(slug),
    getSettings(),
  ]);
  if (!post) notFound();

  const headings = extractHeadings(post.content || "");
  const [related, adjacent] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId, 3),
    post.publishedAt ? getAdjacentPosts(post.publishedAt) : Promise.resolve({ prev: null, next: null }),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.author.name },
    publisher: { "@type": "Person", name: settings.authorName },
    image: post.ogImage || post.coverImage || undefined,
    keywords: post.tags.map((t) => t.tag.name).join(", "),
    articleSection: post.category?.name,
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <ViewTracker slug={post.slug} />

      <main className="flex-1">
        {/* Cover hero — full width */}
        {post.coverImage && (
          <div className="relative w-full border-b border-border/60">
            <div className="relative mx-auto aspect-[21/9] max-h-[520px] min-h-[220px] w-full max-w-6xl overflow-hidden sm:aspect-[2.2/1] lg:rounded-b-2xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            </div>
          </div>
        )}

        <article className="container mx-auto px-4 py-8 lg:px-6 lg:py-12">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="مسیر">
            <Link href="/" className="hover:text-foreground">خانه</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-foreground">وبلاگ</Link>
            {post.category && (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                <Link href={`/categories/${post.category.slug}`} className="hover:text-foreground">
                  {post.category.name}
                </Link>
              </>
            )}
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="truncate text-foreground/70">{post.title}</span>
          </nav>

          {/* Header */}
          <header className="mx-auto max-w-3xl text-center">
            {post.category && (
              <Link href={`/categories/${post.category.slug}`} className="mb-4 inline-block">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
                  {post.category.name}
                </Badge>
              </Link>
            )}
            <h1 className="text-balance text-3xl font-extrabold leading-[1.25] tracking-tight sm:text-4xl lg:text-[2.75rem]">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-5 text-balance text-lg leading-8 text-muted-foreground text-pretty">
                {post.excerpt}
              </p>
            )}

            {/* Author + meta */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {post.author.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{post.author.name}</span>
              </div>
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatJalali(post.publishedAt)}
                </span>
              )}
              {post.readingTime > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {toPersianDigits(post.readingTime)} دقیقه مطالعه
                </span>
              )}
              {post.viewsCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  {formatCount(post.viewsCount)} بازدید
                </span>
              )}
            </div>

            {post.publishedAt && post.updatedAt > post.publishedAt && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <RotateCcw className="h-3 w-3" />
                آخرین به‌روزرسانی: {formatJalaliShort(post.updatedAt)}
              </p>
            )}
          </header>

          {/* Body + TOC */}
          <div className={cn("grid gap-10 lg:grid-cols-[1fr,240px]", post.coverImage ? "mt-8" : "mt-10")}>
            <div className="min-w-0">
              {headings.length > 0 && (
                <div className="mb-8 lg:hidden">
                  <TableOfContents headings={headings} variant="card" />
                </div>
              )}
              <MarkdownRenderer
                key={post.slug}
                content={post.content || ""}
                headings={headings}
              />

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                  {post.tags.map((t) => (
                    <Link key={t.tag.id} href={`/tags/${t.tag.slug}`}>
                      <Badge variant="outline" className="gap-1 font-mono text-xs hover:bg-muted">
                        <span className="text-muted-foreground">#</span>
                        {t.tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}

              {/* Share */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <ShareButtons title={post.title} slug={post.slug} />
                <Button asChild variant="ghost" size="sm" className="gap-1.5">
                  <Link href="/blog">
                    بازگشت به وبلاگ
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Prev / Next */}
              {(adjacent.prev || adjacent.next) && (
                <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="پیمایش مقاله">
                  {adjacent.prev ? (
                    <Link
                      href={`/blog/${adjacent.prev.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">مقاله‌ی جدیدتر</p>
                        <p className="truncate text-sm font-medium">{adjacent.prev.title}</p>
                      </div>
                    </Link>
                  ) : <div className="hidden sm:block" />}
                  {adjacent.next ? (
                    <Link
                      href={`/blog/${adjacent.next.slug}`}
                      className="group flex items-center justify-end gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">مقاله‌ی قدیمی‌تر</p>
                        <p className="truncate text-sm font-medium">{adjacent.next.title}</p>
                      </div>
                      <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ) : <div className="hidden sm:block" />}
                </nav>
              )}

              {/* Author box */}
              <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
                      {post.author.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">نوشته‌ی</p>
                    <h3 className="text-lg font-bold">{post.author.name}</h3>
                    {post.author.bio && (
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground text-pretty">
                        {post.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <ArticleComments slug={post.slug} />
            </div>

            {/* TOC sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <div className="mb-5 flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">مقالات مرتبط</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {related.map((p) => (
                  <ArticleCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter settings={settings} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
