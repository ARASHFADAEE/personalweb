import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, Hash } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data/settings";
import { listPublishedPosts } from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { Button } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const [tag, settings] = await Promise.all([
    db.tag.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!tag) return { title: "تگ یافت نشد", robots: { index: false } };
  const title = `#${tag.name}`;
  const description = `مقالات با تگ ${tag.name}`;
  return {
    title,
    description,
    alternates: { canonical: `/tags/${tag.slug}` },
    openGraph: {
      title,
      description,
      url: `/tags/${tag.slug}`,
      siteName: settings.siteName,
      locale: "fa_IR",
      type: "website",
    },
  };
}

export const revalidate = 600;

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [tag, settings] = await Promise.all([
    db.tag.findUnique({ where: { slug } }),
    getSettings(),
  ]);
  if (!tag) notFound();

  const result = await listPublishedPosts({ tagSlug: slug, perPage: 24 });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <div className="border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
            <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="مسیر">
              <Link href="/" className="hover:text-foreground">خانه</Link>
              <ChevronLeft className="h-3.5 w-3.5" />
              <Link href="/blog" className="hover:text-foreground">وبلاگ</Link>
              <ChevronLeft className="h-3.5 w-3.5" />
              <span className="font-mono text-foreground/70">#{tag.slug}</span>
            </nav>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-mono text-xl font-bold">
                #
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{tag.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{result.total} مقاله</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 lg:px-6 lg:py-12">
          {result.items.length > 0 ? (
            <div className="grid gap-x-6 gap-y-2">
              {result.items.map((p) => (
                <ArticleCard key={p.id} post={p} variant="list" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <Hash className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">مقاله‌ای با این تگ نیست</h3>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/blog">بازگشت به وبلاگ</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
