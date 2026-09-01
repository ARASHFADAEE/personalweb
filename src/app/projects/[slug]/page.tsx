import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft, Github, ExternalLink, ArrowLeft, FolderGit2 } from "lucide-react";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await db.project.findFirst({ where: { slug } });
  if (!project) return { title: "پروژه یافت نشد", robots: { index: false } };
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export const revalidate = 600;

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [project, settings] = await Promise.all([
    db.project.findFirst({ where: { slug, status: "PUBLISHED" } }),
    getSettings(),
  ]);
  if (!project) notFound();

  const techs: string[] = project.technologies
    ? (() => { try { return JSON.parse(project.technologies) as string[] } catch { return [] } })()
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.title,
    description: project.description,
    applicationCategory: "DeveloperApplication",
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
    ...(project.demoUrl ? { url: project.demoUrl } : {}),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-8 lg:px-6 lg:py-12">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="مسیر">
            <Link href="/" className="hover:text-foreground">خانه</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <Link href="/projects" className="hover:text-foreground">پروژه‌ها</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="truncate text-foreground/70">{project.title}</span>
          </nav>

          <header className="mx-auto max-w-3xl">
            <h1 className="text-balance text-3xl font-extrabold leading-[1.25] tracking-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-4 text-balance text-lg leading-8 text-muted-foreground text-pretty">
              {project.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.demoUrl && (
                <Button asChild size="sm" className="gap-2">
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> دیدن دمو
                  </a>
                </Button>
              )}
              {project.repoUrl && (
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" /> مخزن کد
                  </a>
                </Button>
              )}
            </div>
          </header>

          {project.coverImage && (
            <div className="relative mx-auto mt-10 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl border border-border">
              <Image src={project.coverImage} alt={project.title} fill priority sizes="(max-width: 1024px) 100vw, 896px" className="object-cover" />
            </div>
          )}

          {techs.length > 0 && (
            <div className="mx-auto mt-8 max-w-3xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">تکنولوژی‌ها</p>
              <div className="flex flex-wrap gap-2">
                {techs.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-muted font-mono text-xs">{t}</Badge>
                ))}
              </div>
            </div>
          )}

          {project.content && (
            <div className="mx-auto mt-10 max-w-3xl">
              <MarkdownRenderer content={project.content} />
            </div>
          )}

          <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-6">
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" /> بازگشت به پروژه‌ها
              </Link>
            </Button>
          </div>
        </article>
      </main>
      <SiteFooter settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
