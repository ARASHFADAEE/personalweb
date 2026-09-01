import Link from "next/link";
import type { Metadata } from "next";
import { Github, Linkedin, Mail, ArrowLeft, Code2, Sparkles, Target } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { listCategoriesWithCount } from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "درباره‌ی من",
  description: "آشنایی با من، تخصص‌ها و مسیر حرفه‌ای.",
  alternates: { canonical: "/about" },
};

export const revalidate = 3600;

export default async function AboutPage() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    listCategoriesWithCount(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.authorName,
    description: settings.authorBio,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "/",
    sameAs: [
      settings.socialGithub,
      settings.socialLinkedin,
      settings.socialX,
    ].filter(Boolean),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-5 gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                درباره‌ی من
              </Badge>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {settings.authorName}
              </h1>
              <p className="mt-6 text-balance text-lg leading-8 text-muted-foreground text-pretty">
                {settings.authorBio}
              </p>
              <div className="mt-8 flex items-center justify-center gap-2">
                {settings.socialGithub && (
                  <a href={settings.socialGithub} target="_blank" rel="noopener noreferrer" aria-label="گیت‌هاب"
                     className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {settings.socialLinkedin && (
                  <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="لینکدین"
                     className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {settings.socialEmail && (
                  <a href={`mailto:${settings.socialEmail}`} aria-label="ایمیل"
                     className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground">
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-10">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">تخصص‌ها</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <div>
                      <h3 className="font-semibold">{c.name}</h3>
                      {c.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{c.description}</p>}
                    </div>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">علاقه‌مندی‌ها</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Next.js", "TypeScript", "System Design", "DX", "Open Source", "RTL", "Accessibility", "Performance"].map((t) => (
                  <Badge key={t} variant="secondary" className="bg-muted font-mono text-sm py-1.5 px-3">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-6 lg:p-8">
              <h2 className="text-xl font-bold tracking-tight">بیایید صحبت کنیم</h2>
              <p className="mt-2 text-muted-foreground text-pretty">
                برای همکاری، سوال یا فقط سلام، می‌توانید از راه‌های زیر با من در ارتباط باشید.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button asChild className="gap-2">
                  <a href={`mailto:${settings.socialEmail}`}>
                    <Mail className="h-4 w-4" /> ارسال ایمیل
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/blog">
                    <ArrowLeft className="h-4 w-4" /> خواندن مقالات
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
