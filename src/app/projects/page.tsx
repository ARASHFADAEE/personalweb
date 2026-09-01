import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Github, ExternalLink, FolderGit2 } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { listPublishedProjects } from "@/lib/data/posts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "پروژه‌ها",
  description: "مجموعه‌ای از پروژه‌های متن‌باز و کارهای فول‌استک که ساخته‌ام.",
  alternates: { canonical: "/projects" },
};

export const revalidate = 600;

export default async function ProjectsPage() {
  const [settings, projects] = await Promise.all([
    getSettings(),
    listPublishedProjects(false),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <div className="border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-medium text-primary">پروژه‌ها</p>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                چیزهایی که ساخته‌ام
              </h1>
              <p className="mt-4 text-balance text-base leading-7 text-muted-foreground text-pretty">
                پروژه‌های متن‌باز، ابزارها و محصولات — همگی ساخته‌شده با عشق به کد تمیز و تجربه‌ی کاربری.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10 lg:px-6 lg:py-12">
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
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
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <FolderGit2 className="h-10 w-10" />
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-bold leading-7 tracking-tight">
                        <Link href={`/projects/${proj.slug}`} className="transition-colors hover:text-primary">{proj.title}</Link>
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground text-pretty">{proj.description}</p>
                      {techs.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {techs.map((t) => (
                            <Badge key={t} variant="secondary" className="bg-muted font-mono text-xs">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        {proj.demoUrl && (
                          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5">
                            <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" /> دمو
                            </a>
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
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <FolderGit2 className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">پروژه‌ای ثبت نشده</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">به‌زودی پروژه‌ها اضافه می‌شوند.</p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
