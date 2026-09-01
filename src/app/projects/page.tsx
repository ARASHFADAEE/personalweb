import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Code2,
  ExternalLink,
  FolderGit2,
  Github,
  Layers,
  Sparkles,
  Star,
} from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { listPublishedProjects } from "@/lib/data/posts";
import { collectProjectStats } from "@/lib/project-utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProjectCard } from "@/components/project-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/slug";

export const metadata: Metadata = {
  title: "پروژه‌ها",
  description: "مجموعه‌ای از پروژه‌های متن‌باز، ابزارها و محصولات فول‌استک — ساخته‌شده با تمرکز بر کد تمیز و UX.",
  alternates: { canonical: "/projects" },
};

export const revalidate = 600;

export default async function ProjectsPage() {
  const [settings, projects] = await Promise.all([
    getSettings(),
    listPublishedProjects(false),
  ]);

  const stats = collectProjectStats(projects);
  const featured = projects.filter((p) => p.featured);
  const spotlight = featured[0] ?? projects[0] ?? null;
  const secondaryFeatured = featured.slice(1, 3);
  const spotlightIds = new Set(
    [spotlight, ...secondaryFeatured].filter(Boolean).map((p) => p!.id)
  );
  const gridProjects = projects.filter((p) => !spotlightIds.has(p.id));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        {/* Hero */}
        <section className="blog-hero relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 left-0 h-[420px] w-[420px] rounded-full bg-primary/12 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/8 blur-[80px]" />
            <div
              className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-14 lg:px-6 lg:py-20">
            <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="max-w-3xl">
                <Badge variant="outline" className="mb-5 gap-1.5 bg-background/70 py-1 text-xs font-medium backdrop-blur-sm">
                  <FolderGit2 className="h-3.5 w-3.5 text-primary" />
                  {settings.siteName} · نمونه‌کار
                </Badge>
                <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                  کارهایی که ساخته‌ام
                  <span className="mt-2 block bg-gradient-to-l from-primary via-primary to-primary/55 bg-clip-text text-transparent">
                    از ایده تا محصول
                  </span>
                </h1>
                <p className="mt-5 max-w-2xl text-balance text-base leading-8 text-muted-foreground text-pretty sm:text-lg">
                  پروژه‌های متن‌باز، ابزارهای داخلی و محصولات واقعی — با تمرکز بر معماری تمیز،
                  تجربه‌ی کاربری و قابلیت نگهداری.
                </p>

                {stats.topTech.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-2">
                    {stats.topTech.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-full border border-border/80 bg-card/70 px-3.5 py-1.5 font-mono text-xs text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="blog-hero-panel relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-gradient-to-br from-card via-card to-secondary/40 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-primary">آمار پروژه‌ها</p>
                <div className="relative mt-6 grid grid-cols-2 gap-4">
                  <StatTile icon={<Layers className="h-4 w-4" />} label="پروژه" value={formatCount(stats.total)} />
                  <StatTile icon={<Star className="h-4 w-4" />} label="منتخب" value={formatCount(stats.featured)} accent />
                  <StatTile icon={<ExternalLink className="h-4 w-4" />} label="دارای دمو" value={formatCount(stats.withDemo)} />
                  <StatTile icon={<Github className="h-4 w-4" />} label="متن‌باز" value={formatCount(stats.withRepo)} />
                </div>
                <p className="relative mt-6 text-xs leading-6 text-muted-foreground">
                  {formatCount(stats.techCount)} تکنولوژی در این مجموعه — از وب و API تا DevOps و AI.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
          {projects.length === 0 ? (
            <EmptyProjects />
          ) : (
            <>
              {/* Spotlight */}
              {spotlight && (
                <section className="mb-16 lg:mb-20">
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        {featured.length > 0 ? "پروژه‌های منتخب" : "پروژه برجسته"}
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">شروع از اینجا</h2>
                    </div>
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-xl">
                      <Link href="/blog">
                        مقالات مرتبط
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-12">
                    <div className="blog-bento-item lg:col-span-7">
                      <ProjectCard project={spotlight} variant="hero" priority />
                    </div>
                    {secondaryFeatured.length > 0 && (
                      <div className="grid gap-5 lg:col-span-5">
                        {secondaryFeatured.map((p, i) => (
                          <div key={p.id} className="blog-bento-item" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                            <ProjectCard project={p} variant="featured" priority={i === 0} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* All projects */}
              {gridProjects.length > 0 && (
                <section id="all-projects">
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        <Code2 className="h-3.5 w-3.5" />
                        همه‌ی پروژه‌ها
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {formatCount(gridProjects.length)} پروژه دیگر
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {gridProjects.map((proj, i) => (
                      <div
                        key={proj.id}
                        className="blog-bento-item"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <ProjectCard project={proj} variant="default" priority={i < 2} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA */}
              <section className="mt-16 rounded-[1.5rem] border border-border/70 bg-muted/20 px-6 py-10 text-center sm:px-10">
                <FolderGit2 className="mx-auto h-5 w-5 text-primary" aria-hidden />
                <h2 className="mt-3 text-xl font-bold tracking-tight">درباره فرآیند ساخت بخوانید</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground text-pretty">
                  در وبلاگ درباره معماری، ابزارها و درس‌هایی که از این پروژه‌ها گرفته‌ام می‌نویسم.
                </p>
                <Button asChild className="mt-5 h-10 gap-2 rounded-xl">
                  <Link href="/blog">
                    رفتن به وبلاگ
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </section>
            </>
          )}
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
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        accent ? "border-primary/30 bg-primary/10" : "border-border/70 bg-background/60"
      }`}
    >
      <div className={`mb-2 ${accent ? "text-primary" : "text-muted-foreground"}`}>{icon}</div>
      <p className="font-mono text-2xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyProjects() {
  return (
    <div className="blog-empty flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-muted/15 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FolderGit2 className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-xl font-bold">پروژه‌ای ثبت نشده</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        به‌زودی پروژه‌های متن‌باز و محصولات اینجا منتشر می‌شوند.
      </p>
    </div>
  );
}
