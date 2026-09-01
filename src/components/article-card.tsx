import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Eye } from "lucide-react";
import { formatJalali } from "@/lib/jalali";
import { formatCount, toPersianDigits } from "@/lib/slug";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ArticleCardProps = {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    readingTime: number;
    viewsCount: number;
    featured?: boolean;
    category?: { name: string; slug: string; color?: string | null } | null;
    tags?: { tag: { name: string; slug: string } }[];
    author?: { name: string } | null;
  };
  variant?: "default" | "featured" | "compact" | "list";
  priority?: boolean;
};

export function ArticleCard({ post, variant = "default", priority = false }: ArticleCardProps) {
  const href = `/blog/${post.slug}`;
  const published = post.publishedAt ? formatJalali(post.publishedAt) : "";

  if (variant === "featured") {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm">
        <Link href={href} className="block overflow-hidden aspect-[16/9]" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-sm">
              بدون تصویر
            </div>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-5">
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="mb-2.5 inline-block w-fit"
            >
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
                {post.category.name}
              </Badge>
            </Link>
          )}
          <h3 className="text-xl font-bold leading-7 tracking-tight text-balance">
            <Link href={href} className="transition-colors hover:text-primary">
              {post.title}
            </Link>
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground text-pretty">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {published && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {published}
              </span>
            )}
            {post.readingTime > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {toPersianDigits(post.readingTime)} دقیقه
              </span>
            )}
            {post.viewsCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {formatCount(post.viewsCount)}
              </span>
            )}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="group grid grid-cols-[auto,1fr] gap-5 border-b border-border/60 py-5">
        <Link href={href} className="relative aspect-[4/3] w-32 overflow-hidden rounded-lg bg-muted sm:w-44" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="180px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground text-xs">بدون تصویر</div>
          )}
        </Link>
        <div className="flex min-w-0 flex-col">
          {post.category && (
            <Link href={`/categories/${post.category.slug}`} className="mb-1.5 inline-block w-fit">
              <span className="text-xs font-medium text-primary">{post.category.name}</span>
            </Link>
          )}
          <h3 className="text-base font-bold leading-7 tracking-tight text-balance">
            <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
          </h3>
          {post.excerpt && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground text-pretty">
              {post.excerpt}
            </p>
          )}
          <div className="mt-auto pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {published && <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{published}</span>}
            {post.readingTime > 0 && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{toPersianDigits(post.readingTime)} دقیقه</span>}
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group block py-3">
        {post.category && (
          <span className="mb-1 block text-xs font-medium text-primary">{post.category.name}</span>
        )}
        <h4 className="text-sm font-semibold leading-6 text-balance transition-colors group-hover:text-primary">
          {post.title}
        </h4>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{post.excerpt}</p>
        )}
      </Link>
    );
  }

  return (
    <article className={cn("group relative flex flex-col rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm")}>
      <Link href={href} className="block overflow-hidden aspect-[16/9] rounded-t-xl bg-muted" aria-label={post.title}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">بدون تصویر</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {post.category && (
          <Link href={`/categories/${post.category.slug}`} className="mb-2 inline-block w-fit">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
              {post.category.name}
            </Badge>
          </Link>
        )}
        <h3 className="text-base font-bold leading-7 tracking-tight text-balance">
          <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted-foreground text-pretty">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          {published && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{published}</span>}
          {post.readingTime > 0 && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{toPersianDigits(post.readingTime)} دقیقه</span>}
        </div>
      </div>
    </article>
  );
}
