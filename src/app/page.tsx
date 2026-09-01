import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft, Github, Linkedin, Mail, Sparkles, BookOpen, FolderGit2, PenLine } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import {
  getFeaturedPosts,
  getLatestPosts,
  listCategoriesWithCount,
  listPublishedProjects,
} from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleCard } from "@/components/article-card";
import { NewsletterSection } from "@/components/newsletter-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatJalali } from "@/lib/jalali";
import { formatCount } from "@/lib/slug";

export const revalidate = 3600; // revalidate homepage every hour

export default async function HomePage() {
  const settings = await getSettings();
  const [featuredPosts, latestPosts, categories, projects] = await Promise.all([
    getFeaturedPosts(3),
    getLatestPosts(6, []),
    listCategoriesWithCount(),
    listPublishedProjects(true),
  ]);

  const stats = [
    { label: "مقالات", value: formatCount(latestPosts.length) },
    { label: "دسته‌بندی", value: formatCount(categories.length) },
    { label: "پروژه", value: formatCount(projects.length) },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />

      <main className="flex-1">
        {/* ----------------------------------------------------------------- HERO */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-20 left-1/4 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="outline" className="mb-5 gap-1.5 bg-background/60 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                توسعه‌دهنده فول‌استک · کانال تخصصی
              </Badge>
              <h1 className="text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                {settings.authorName}
                <span className="block bg-gradient-to-l from-primary to-primary/70 bg-clip-text text-transparent">
                  درباره‌ی کد و معماری می‌نویسم
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-muted-foreground text-pretty">
                {settings.authorBio}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="h-11 gap-2">
                  <Link href="/blog">
                    <BookOpen className="h-4 w-4" />
                    خواندن مقالات
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 gap-2">
                  <Link href="/projects">
                    <FolderGit2 className="h-4 w-4" />
                    دیدن پروژه‌ها
                  </Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2">
                {settings.socialGithub && (
                  <a href={settings.socialGithub} target="_blank" rel="noopener noreferrer" aria-label="گیت‌هاب"
                     className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Github className="h-4.5 w-4.5" />
                  </a>
                )}
                {settings.socialLinkedin && (
                  <a href={settings.socialLinkedin} target="_blank" rel="noopener noreferrer" aria-label="لینکدین"
                     className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Linkedin className="h-4.5 w-4.5" />
                  </a>
                )}
                {settings.socialEmail && (
                  <a href={`mailto:${settings.socialEmail}`} aria-label="ایمیل"
                     className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Mail className="h-4.5 w-4.5" />
                  </a>
                )}
              </div>

              <dl className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/70 bg-card/60 p-4 text-center">
                    <dt className="text-xs text-muted-foreground">{s.label}</dt>
                    <dd className="mt-1 font-mono text-2xl font-bold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- FEATURED */}
        {featuredPosts.length > 0 && (
          <section className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
            <SectionHeader
              eyebrow="منتخب سردبیر"
              title="مقالات برتر"
              icon={<PenLine className="h-4 w-4" />}
              action={<Link href="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">همه‌ی مقالات <ArrowLeft className="h-3.5 w-3.5" /></Link>}
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredPosts.map((p, i) => (
                <ArticleCard key={p.id} post={p} variant="featured" priority={i === 0} />
              ))}
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- LATEST + TOPICS */}
        <section className="border-t border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
            <div className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <SectionHeader
                  eyebrow="جدیدترین‌ها"
                  title="آخرین مقالات"
                  icon={<BookOpen className="h-4 w-4" />}
                />
                <div className="mt-6">
                  {latestPosts.map((p) => (
                    <ArticleCard key={p.id} post={p} variant="list" />
                  ))}
                </div>
                <div className="mt-6 text-left">
                  <Button asChild variant="ghost" className="gap-2">
                    <Link href="/blog">
                      دیدن همه‌ی مقالات
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <aside className="lg:col-span-4">
                <SectionHeader
                  eyebrow="مرور سریع"
                  title="موضوعات"
                  icon={<Sparkles className="h-4 w-4" />}
                />
                <div className="mt-6 space-y-2">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/categories/${c.slug}`}
                      className="group flex items-center justify-between rounded-xl border border-border/70 bg-card p-4 transition-colors hover:border-primary/40 hover:bg-card/80"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{c.name}</h3>
                        {c.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{c.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary" className="shrink-0 font-mono">
                        {formatCount(c.postsCount)}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- PROJECTS */}
        {projects.length > 0 && (
          <section className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
            <SectionHeader
              eyebrow="کارهای من"
              title="پروژه‌های منتخب"
              icon={<FolderGit2 className="h-4 w-4" />}
              action={<Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">همه‌ی پروژه‌ها <ArrowLeft className="h-3.5 w-3.5" /></Link>}
            />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {projects.map((proj) => {
                const techs: string[] = proj.technologies
                  ? (() => { try { return JSON.parse(proj.technologies) as string[] } catch { return [] } })()
                  : [];
                return (
                  <article key={proj.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm">
                    <Link href={`/projects/${proj.slug}`} className="block aspect-[16/9] overflow-hidden bg-muted">
                      {proj.coverImage ? (
                        <Image src={proj.coverImage} alt={proj.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                          <FolderGit2 className="h-8 w-8" />
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-bold leading-7 tracking-tight">
                        <Link href={`/projects/${proj.slug}`} className="transition-colors hover:text-primary">{proj.title}</Link>
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground">{proj.description}</p>
                      {techs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {techs.map((t) => (
                            <Badge key={t} variant="secondary" className="bg-muted font-mono text-xs">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        {proj.demoUrl && (
                          <Button asChild size="sm" variant="outline" className="h-8">
                            <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer">دمو</a>
                          </Button>
                        )}
                        {proj.repoUrl && (
                          <Button asChild size="sm" variant="ghost" className="h-8 gap-1.5">
                            <a href={proj.repoUrl} target="_blank" rel="noopener noreferrer">
                              <Github className="h-3.5 w-3.5" /> کد
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* --------------------------------------------------------- ABOUT + NEWSLETTER */}
        <section className="border-t border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-16 lg:px-6 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <SectionHeader eyebrow="آشنایی" title="درباره‌ی من" icon={<PenLine className="h-4 w-4" />} />
                <div className="mt-6 max-w-2xl space-y-4 text-base leading-8 text-muted-foreground text-pretty">
                  <p>{settings.authorBio}</p>
                  <p>
                    من علاقه‌مند به ساخت محصول‌های سریع، قابل‌نگهداری و با تجربه‌ی کاربری خوبم.
                    در اینجا درباره‌ی چالش‌های واقعی و راه‌حل‌هایی که پیدا می‌کنم می‌نویسم — نه چیزهای تئوریک و بی‌کاربرد.
                  </p>
                  <Button asChild variant="outline" className="mt-3 gap-2">
                    <Link href="/about">
                      بیشتر بدانید
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              {settings.newsletterEnabled && (
                <div className="lg:col-span-5">
                  <NewsletterSection settings={settings} />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter settings={settings} />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  icon,
  action,
}: {
  eyebrow: string;
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          {icon}
          {eyebrow}
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
