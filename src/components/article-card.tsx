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
    publishedAt: Date | string | null;
    readingTime: number;
    viewsCount: number;
    featured?: boolean;
    category?: { name: string; slug: string; color?: string | null } | null;
    tags?: { tag: { name: string; slug: string } }[];
    author?: { name: string } | null;
  };
  variant?: "default" | "featured" | "hero" | "compact" | "list";
  priority?: boolean;
};

function MetaRow({ post, published }: { post: ArticleCardProps["post"]; published: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
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
  );
}

export function ArticleCard({ post, variant = "default", priority = false }: ArticleCardProps) {
  const href = `/blog/${post.slug}`;
  const published = post.publishedAt ? formatJalali(new Date(post.publishedAt)) : "";

  if (variant === "hero") {
    return (
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden sm:aspect-[16/9]" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">بدون تصویر</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
            {post.category && (
              <Badge className="mb-3 bg-primary/90 text-primary-foreground hover:bg-primary">{post.category.name}</Badge>
            )}
            <h3 className="text-balance text-xl font-bold leading-8 text-white sm:text-2xl">{post.title}</h3>
            {post.excerpt && (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">{post.excerpt}</p>
            )}
          </div>
        </Link>
        <div className="border-t border-border/60 p-4 sm:p-5">
          <MetaRow post={post} published={published} />
        </div>
      </article>
    );
  }

  if (variant === "featured") {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-sm">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-sm">بدون تصویر</div>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-5">
          {post.category && (
            <Link href={`/categories/${post.category.slug}`} className="mb-2.5 inline-block w-fit">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">{post.category.name}</Badge>
            </Link>
          )}
          <h3 className="text-lg font-bold leading-7 tracking-tight text-balance">
            <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground text-pretty">{post.excerpt}</p>
          )}
          <div className="mt-auto pt-4">
            <MetaRow post={post} published={published} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "list") {
    return (
      <article className="group grid gap-5 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/40 sm:grid-cols-[minmax(140px,38%),1fr] sm:p-5">
        <Link href={href} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted sm:aspect-auto sm:min-h-[180px]" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center text-muted-foreground text-xs">بدون تصویر</div>
          )}
        </Link>
        <div className="flex min-w-0 flex-col justify-center">
          {post.category && (
            <Link href={`/categories/${post.category.slug}`} className="mb-2 inline-block w-fit">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">{post.category.name}</Badge>
            </Link>
          )}
          <h3 className="text-lg font-bold leading-8 tracking-tight text-balance">
            <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground text-pretty">{post.excerpt}</p>
          )}
          <div className="mt-4">
            <MetaRow post={post} published={published} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={href} className="group block py-3">
        {post.category && <span className="mb-1 block text-xs font-medium text-primary">{post.category.name}</span>}
        <h4 className="text-sm font-semibold leading-6 text-balance transition-colors group-hover:text-primary">{post.title}</h4>
        {post.excerpt && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{post.excerpt}</p>}
      </Link>
    );
  }

  /* default grid card */
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md")}>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={post.title}>
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
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">بدون تصویر</div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.category && (
          <Link href={`/categories/${post.category.slug}`} className="mb-2.5 inline-block w-fit">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">{post.category.name}</Badge>
          </Link>
        )}
        <h3 className="text-lg font-bold leading-8 tracking-tight text-balance">
          <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground text-pretty">{post.excerpt}</p>
        )}
        <div className="mt-auto pt-4">
          <MetaRow post={post} published={published} />
        </div>
      </div>
    </article>
  );
}
