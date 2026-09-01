import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink, FolderGit2, Github, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { parseProjectTechnologies, type ProjectRecord } from "@/lib/project-utils";
import { ProjectDescription } from "@/components/project-description";

type ProjectCardProps = {
  project: ProjectRecord;
  variant?: "hero" | "featured" | "default" | "list";
  priority?: boolean;
  index?: number;
};

function TechPills({ techs, limit = 4 }: { techs: string[]; limit?: number }) {
  if (techs.length === 0) return null;
  const visible = techs.slice(0, limit);
  const rest = techs.length - visible.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((t) => (
        <Badge key={t} variant="secondary" className="bg-primary/10 font-mono text-[11px] text-primary">
          {t}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge variant="outline" className="font-mono text-[11px] text-muted-foreground">
          +{rest}
        </Badge>
      )}
    </div>
  );
}

function ProjectLinks({
  demoUrl,
  repoUrl,
  size = "sm",
}: {
  demoUrl: string | null;
  repoUrl: string | null;
  size?: "sm" | "md";
}) {
  if (!demoUrl && !repoUrl) return null;
  const btnClass = size === "md" ? "h-9 gap-2 rounded-xl" : "h-8 gap-1.5 rounded-lg";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {demoUrl && (
        <Button asChild size="sm" className={cn(btnClass)}>
          <a href={demoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            دمو
          </a>
        </Button>
      )}
      {repoUrl && (
        <Button asChild size="sm" variant="outline" className={cn(btnClass)}>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer">
            <Github className="h-3.5 w-3.5" />
            کد
          </a>
        </Button>
      )}
    </div>
  );
}

export function ProjectCard({ project, variant = "default", priority = false, index }: ProjectCardProps) {
  const href = `/projects/${project.slug}`;
  const techs = parseProjectTechnologies(project.technologies);

  if (variant === "hero") {
    return (
      <article className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-primary/35 dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <Link href={href} className="relative block min-h-[240px] flex-1 overflow-hidden lg:min-h-[320px]" aria-label={project.title}>
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/40">
              <FolderGit2 className="h-14 w-14 text-muted-foreground/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            {project.featured && (
              <Badge className="mb-3 gap-1 bg-primary/90 text-primary-foreground">
                <Sparkles className="h-3 w-3" />
                منتخب
              </Badge>
            )}
            <h3 className="text-balance text-2xl font-extrabold leading-9 text-white sm:text-3xl">{project.title}</h3>
            <ProjectDescription content={project.description} inverted clamp={2} className="mt-3 max-w-2xl text-sm sm:text-base" />
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 p-5 sm:p-6">
          <TechPills techs={techs} limit={5} />
          <ProjectLinks demoUrl={project.demoUrl} repoUrl={project.repoUrl} />
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="group relative overflow-hidden rounded-[1.25rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-md">
        <div className="grid gap-0 sm:grid-cols-[minmax(180px,34%),1fr]">
          <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted sm:aspect-auto sm:min-h-[190px]" aria-label={project.title}>
            {project.coverImage ? (
              <Image
                src={project.coverImage}
                alt={project.title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            ) : (
              <div className="flex h-full min-h-[140px] items-center justify-center">
                <FolderGit2 className="h-10 w-10 text-muted-foreground/50" />
              </div>
            )}
          </Link>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {index != null && (
                <span className="font-mono text-sm font-bold text-primary/35">{String(index).padStart(2, "0")}</span>
              )}
              {project.featured && (
                <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                  <Sparkles className="h-3 w-3" />
                  منتخب
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-bold leading-8 tracking-tight sm:text-xl">
              <Link href={href} className="transition-colors hover:text-primary">{project.title}</Link>
            </h3>
            <ProjectDescription content={project.description} clamp={2} className="mt-2 text-sm" />
            <div className="mt-4 space-y-3">
              <TechPills techs={techs} />
              <ProjectLinks demoUrl={project.demoUrl} repoUrl={project.repoUrl} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-lg">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden" aria-label={project.title}>
          {project.coverImage ? (
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <FolderGit2 className="h-10 w-10 text-muted-foreground/50" />
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-5">
          {project.featured && (
            <Badge variant="secondary" className="mb-2.5 w-fit gap-1 bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3" />
              منتخب
            </Badge>
          )}
          <h3 className="text-lg font-bold leading-8 tracking-tight">
            <Link href={href} className="transition-colors hover:text-primary">{project.title}</Link>
          </h3>
          <ProjectDescription content={project.description} clamp={2} className="mt-2 text-sm" />
          <div className="mt-auto space-y-3 pt-4">
            <TechPills techs={techs} />
            <ProjectLinks demoUrl={project.demoUrl} repoUrl={project.repoUrl} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-lg">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={project.title}>
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FolderGit2 className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-8 tracking-tight text-balance">
          <Link href={href} className="transition-colors hover:text-primary">{project.title}</Link>
        </h3>
        <ProjectDescription content={project.description} clamp={3} className="mt-2 text-sm" />
        <div className="mt-auto space-y-3 pt-4">
          <TechPills techs={techs} />
          <div className="flex items-center justify-between gap-3">
            <ProjectLinks demoUrl={project.demoUrl} repoUrl={project.repoUrl} />
            <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
              جزئیات
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
