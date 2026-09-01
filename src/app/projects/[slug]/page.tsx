import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink, FolderGit2, Github, Sparkles } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { getPublishedProjectBySlug, listPublishedProjects } from "@/lib/data/posts";
import { parseProjectTechnologies } from "@/lib/project-utils";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArticleBreadcrumbs } from "@/components/article-breadcrumbs";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { ProjectCard } from "@/components/project-card";
import { ShareButtons } from "@/components/share-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getPublishedProjectBySlug(slug);
  if (!project) return { title: "پروژه یافت نشد", robots: { index: false } };

  const settings = await getSettings();
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      locale: "fa_IR",
      siteName: settings.siteName,
      title: project.title,
      description: project.description,
      url: `/projects/${project.slug}`,
      images: project.coverImage ? [{ url: project.coverImage, width: 1200, height: 630, alt: project.title }] : undefined,
    },
    twitter: {
      card: project.coverImage ? "summary_large_image" : "summary",
      title: project.title,
      description: project.description,
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, settings, allProjects] = await Promise.all([
    getPublishedProjectBySlug(slug),
    getSettings(),
    listPublishedProjects(false),
  ]);
  if (!project) notFound();

  const techs = parseProjectTechnologies(project.technologies);
  const related = allProjects.filter((p) => p.id !== project.id).slice(0, 3);

  const breadcrumbs = [
    { name: "خانه", href: "/" },
    { name: "پروژه‌ها", href: "/projects" },
    { name: project.title },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    applicationCategory: "DeveloperApplication",
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
    ...(project.demoUrl ? { url: project.demoUrl } : {}),
    ...(project.coverImage ? { image: project.coverImage } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        {/* Cover hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-primary/10 blur-[90px]" />
          </div>

          <div className="container mx-auto px-4 py-6 sm:py-8 lg:px-6 lg:py-10">
            <ArticleBreadcrumbs items={breadcrumbs} />

            <div className="mx-auto max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {project.featured && (
                  <Badge className="gap-1 bg-primary/90 text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    پروژه منتخب
                  </Badge>
                )}
                <Badge variant="outline" className="gap-1 bg-background/70">
                  <FolderGit2 className="h-3 w-3 text-primary" />
                  پروژه
                </Badge>
              </div>

              <h1 className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem]">
                {project.title}
              </h1>
              <p className="mt-4 max-w-3xl text-balance text-base leading-8 text-muted-foreground text-pretty sm:text-lg">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {project.demoUrl && (
                  <Button asChild className="h-10 gap-2 rounded-xl">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      دیدن دمو
                    </a>
                  </Button>
                )}
                {project.repoUrl && (
                  <Button asChild variant="outline" className="h-10 gap-2 rounded-xl">
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      مخزن کد
                    </a>
                  </Button>
                )}
                <ShareButtons title={project.title} />
              </div>

              {techs.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2">
                  {techs.map((t) => (
                    <Badge key={t} variant="secondary" className="bg-primary/10 font-mono text-xs text-primary">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {project.coverImage && (
              <div className="relative mx-auto mt-10 aspect-[16/9] max-w-5xl overflow-hidden rounded-[1.5rem] border border-border/80 shadow-[0_24px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                <Image
                  src={project.coverImage}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto px-4 py-10 lg:px-6 lg:py-14">
          {project.content ? (
            <div className="prose prose-neutral dark:prose-invert mx-auto max-w-[720px] prose-headings:scroll-mt-24">
              <MarkdownRenderer content={project.content} />
            </div>
          ) : (
            <div className="mx-auto max-w-[720px] rounded-[1.25rem] border border-dashed border-border bg-muted/15 px-6 py-12 text-center">
              <FolderGit2 className="mx-auto h-8 w-8 text-primary/70" />
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                جزئیات بیشتر این پروژه به‌زودی منتشر می‌شود.
              </p>
            </div>
          )}

          <div className="mx-auto mt-12 flex max-w-[720px] flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
            <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-xl">
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
                بازگشت به پروژه‌ها
              </Link>
            </Button>
            {(project.demoUrl || project.repoUrl) && (
              <div className="flex flex-wrap gap-2">
                {project.demoUrl && (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-xl">
                    <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      دمو
                    </a>
                  </Button>
                )}
                {project.repoUrl && (
                  <Button asChild size="sm" variant="outline" className="gap-1.5 rounded-xl">
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="h-3.5 w-3.5" />
                      کد
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="border-t border-border/60 bg-muted/15">
            <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">پروژه‌های دیگر</p>
                  <h2 className="text-2xl font-bold tracking-tight">شاید این‌ها هم جالب باشند</h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="gap-1.5 rounded-xl">
                  <Link href="/projects">
                    همه پروژه‌ها
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {related.map((p, i) => (
                  <div key={p.id} className="blog-bento-item" style={{ animationDelay: `${i * 60}ms` }}>
                    <ProjectCard project={p} variant="default" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
