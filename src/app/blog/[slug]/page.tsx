import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, PenLine } from "lucide-react";
import {
  getPublishedPostBySlug,
  getRelatedPosts,
  getAdjacentPosts,
} from "@/lib/data/posts";
import { getSettings } from "@/lib/data/settings";
import { buildArticleJsonLd, buildArticleSeo } from "@/lib/article-seo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TableOfContents } from "@/components/table-of-contents";
import { ShareButtons } from "@/components/share-buttons";
import { ArticleComments } from "@/components/article-comments";
import { AdminEditPostLink } from "@/components/admin-quick-actions";
import { ViewTracker } from "@/components/view-tracker";
import { ReadingProgress } from "@/components/reading-progress";
import { ArticleBreadcrumbs } from "@/components/article-breadcrumbs";
import { ArticleHero } from "@/components/article-hero";
import { ArticleAuthorBox } from "@/components/article-author-box";
import { ArticleEndCta } from "@/components/article-end-cta";
import { ArticleLearnOutline } from "@/components/article-outline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const seo = buildArticleSeo({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    focusKeyword: post.focusKeyword,
  });

  return {
    title: seo.seoTitle,
    description: seo.metaDescription,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: {
      type: "article",
      locale: "fa_IR",
      siteName: settings.siteName,
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonicalUrl,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name],
      images: seo.ogImage ? [{ url: seo.ogImage, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: seo.ogImage ? [seo.ogImage] : undefined,
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
  const tagIds = post.tags.map((t) => t.tag.id);
  const [related, adjacent] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId, tagIds, 3),
    post.publishedAt ? getAdjacentPosts(post.publishedAt) : Promise.resolve({ prev: null, next: null }),
  ]);

  const breadcrumbs = [
    { name: "خانه", href: "/" },
    { name: "وبلاگ", href: "/blog" },
    ...(post.category ? [{ name: post.category.name, href: `/categories/${post.category.slug}` }] : []),
    { name: post.title },
  ];

  const jsonLd = buildArticleJsonLd({ post, settings, breadcrumbs });

  return (
    <div className="flex min-h-screen flex-col">
      <ReadingProgress targetId="article-content" />
      <SiteHeader settings={settings} />
      <ViewTracker slug={post.slug} />

      <main className="flex-1">
        <article
          className="container mx-auto px-4 py-6 sm:py-8 lg:px-6 lg:py-10"
          itemScope
          itemType="https://schema.org/TechArticle"
        >
          <ArticleBreadcrumbs items={breadcrumbs} />

          <ArticleHero
            title={post.title}
            excerpt={post.excerpt}
            coverImage={post.coverImage}
            category={post.category}
            author={post.author}
            publishedAt={post.publishedAt}
            updatedAt={post.updatedAt}
            readingTime={post.readingTime}
            viewsCount={post.viewsCount}
          />

          <div
            className={cn(
              "mt-8 lg:mt-10 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[17rem_minmax(0,1fr)]"
            )}
          >
            {headings.length > 0 && (
              <aside className="hidden lg:sticky lg:top-24 lg:col-start-1 lg:row-start-1 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
                <TableOfContents headings={headings} />
              </aside>
            )}

            <div
              id="article-content"
              className={cn("min-w-0", headings.length > 0 && "lg:col-start-2")}
            >
              {headings.length > 0 && (
                <div className="mb-6 lg:hidden">
                  <TableOfContents headings={headings} variant="card" />
                </div>
              )}

              <ArticleLearnOutline headings={headings} />

              <MarkdownRenderer
                key={post.slug}
                content={post.content || ""}
                headings={headings}
                coverImage={post.coverImage}
              />

              {post.tags.length > 0 && (
                <footer className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
                  {post.tags.map((t) => (
                    <Link key={t.tag.id} href={`/tags/${t.tag.slug}`}>
                      <Badge variant="outline" className="gap-1 font-mono text-xs hover:bg-muted">
                        <span className="text-muted-foreground">#</span>
                        {t.tag.name}
                      </Badge>
                    </Link>
                  ))}
                </footer>
              )}

              <section className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6" aria-label="اشتراک‌گذاری">
                <ShareButtons title={post.title} slug={post.slug} />
                <Button asChild variant="ghost" size="sm" className="h-9 gap-1.5 rounded-xl">
                  <Link href="/blog">
                    بازگشت به وبلاگ
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </section>

              {(adjacent.prev || adjacent.next) && (
                <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="پیمایش مقاله">
                  {adjacent.prev ? (
                    <Link
                      href={`/blog/${adjacent.prev.slug}`}
                      className="group flex min-h-11 items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">مقاله‌ی جدیدتر</p>
                        <p className="truncate text-sm font-medium">{adjacent.prev.title}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                  {adjacent.next ? (
                    <Link
                      href={`/blog/${adjacent.next.slug}`}
                      className="group flex min-h-11 items-center justify-end gap-3 rounded-xl border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/40"
                    >
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">مقاله‌ی قدیمی‌تر</p>
                        <p className="truncate text-sm font-medium">{adjacent.next.title}</p>
                      </div>
                      <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </nav>
              )}

              <ArticleAuthorBox
                name={post.author.name}
                bio={post.author.bio}
                avatarUrl={post.author.avatarUrl}
              />

              <ArticleEndCta />

              <ArticleComments slug={post.slug} />
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-10" aria-labelledby="related-articles">
              <div className="mb-6 flex items-center gap-2">
                <PenLine className="h-4 w-4 text-primary" aria-hidden />
                <h2 id="related-articles" className="text-xl font-bold tracking-tight sm:text-2xl">
                  مقالات مرتبط
                </h2>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {related.map((p) => (
                  <ArticleCard key={p.id} post={p} variant="bento" />
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <SiteFooter settings={settings} />
      <AdminEditPostLink postId={post.id} title={post.title} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
