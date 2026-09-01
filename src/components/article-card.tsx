import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Eye } from "lucide-react";
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
  variant?: "default" | "featured" | "hero" | "compact" | "list" | "bento-hero" | "bento" | "editorial";
  priority?: boolean;
  index?: number;
};

function MetaRow({ post, published, light }: { post: ArticleCardProps["post"]; published: string; light?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs", light ? "text-white/75" : "text-muted-foreground")}>
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

function CategoryBadge({ category, light }: { category: NonNullable<ArticleCardProps["post"]["category"]>; light?: boolean }) {
  return (
    <Link href={`/categories/${category.slug}`} className="inline-block w-fit">
      <Badge
        variant="secondary"
        className={cn(
          light
            ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/20"
            : "bg-primary/10 text-primary hover:bg-primary/15"
        )}
      >
        {category.name}
      </Badge>
    </Link>
  );
}

export function ArticleCard({ post, variant = "default", priority = false, index }: ArticleCardProps) {
  const href = `/blog/${post.slug}`;
  const published = post.publishedAt ? formatJalali(new Date(post.publishedAt)) : "";

  if (variant === "bento-hero") {
    return (
      <article className="group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-primary/35 hover:shadow-[0_28px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <Link href={href} className="relative block h-full min-h-[320px] flex-1 overflow-hidden lg:min-h-[420px]" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/40 text-muted-foreground">بدون تصویر</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            {post.category && <div className="mb-3"><CategoryBadge category={post.category} light /></div>}
            <h3 className="text-balance text-2xl font-extrabold leading-9 text-white sm:text-3xl lg:text-4xl">{post.title}</h3>
            {post.excerpt && (
              <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{post.excerpt}</p>
            )}
            <div className="mt-5 flex items-center justify-between gap-4">
              <MetaRow post={post} published={published} light />
              <span className="hidden items-center gap-1 text-sm font-medium text-white/90 transition-transform group-hover:-translate-x-1 sm:inline-flex">
                مطالعه
                <ArrowLeft className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "bento") {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-[1.25rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-lg">
        <Link href={href} className="relative block aspect-[16/10] overflow-hidden" aria-label={post.title}>
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-sm">بدون تصویر</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
        <div className="flex flex-1 flex-col p-5">
          {post.category && <div className="mb-2.5"><CategoryBadge category={post.category} /></div>}
          <h3 className="text-lg font-bold leading-8 tracking-tight text-balance">
            <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
          </h3>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground text-pretty">{post.excerpt}</p>
          )}
          <div className="mt-auto pt-4">
            <MetaRow post={post} published={published} />
          </div>
        </div>
      </article>
    );
  }

  if (variant === "editorial") {
    return (
      <article className="group relative overflow-hidden rounded-[1.5rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-lg">
        <div className="absolute inset-y-0 end-0 w-1 bg-gradient-to-b from-primary via-primary/70 to-transparent opacity-80" />
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              {index != null && (
                <span className="font-mono text-3xl font-bold text-primary/20">{toPersianDigits(index).padStart(2, "۰")}</span>
              )}
              {post.category && <CategoryBadge category={post.category} />}
            </div>
            <h3 className="text-balance text-2xl font-extrabold leading-9 tracking-tight sm:text-3xl">
              <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
            </h3>
            {post.excerpt && (
              <p className="mt-4 line-clamp-3 text-base leading-8 text-muted-foreground text-pretty">{post.excerpt}</p>
            )}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <MetaRow post={post} published={published} />
              <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-transform hover:-translate-x-0.5">
                ادامه مطلب
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <Link href={href} className="relative block min-h-[220px] overflow-hidden bg-muted lg:min-h-full" aria-label={post.title}>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority={priority}
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center text-muted-foreground">بدون تصویر</div>
            )}
          </Link>
        </div>
      </article>
    );
  }

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
          {post.category && <div className="mb-2.5"><CategoryBadge category={post.category} /></div>}
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
      <article className="group relative overflow-hidden rounded-[1.25rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/30 hover:bg-card/95 hover:shadow-md">
        <div className="grid gap-0 sm:grid-cols-[minmax(180px,34%),1fr]">
          <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted sm:aspect-auto sm:min-h-[190px]" aria-label={post.title}>
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
            ) : (
              <div className="flex h-full min-h-[140px] items-center justify-center text-muted-foreground text-xs">بدون تصویر</div>
            )}
          </Link>
          <div className="flex min-w-0 flex-col justify-center p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              {index != null && (
                <span className="font-mono text-sm font-bold text-primary/35">{toPersianDigits(index).padStart(2, "۰")}</span>
              )}
              {post.category && <CategoryBadge category={post.category} />}
            </div>
            <h3 className="text-lg font-bold leading-8 tracking-tight text-balance sm:text-xl">
              <Link href={href} className="transition-colors hover:text-primary">{post.title}</Link>
            </h3>
            {post.excerpt && (
              <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground text-pretty">{post.excerpt}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <MetaRow post={post} published={published} />
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all group-hover:opacity-100">
                بخوان
                <ArrowLeft className="h-3.5 w-3.5" />
              </span>
            </div>
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
    <article className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-border/80 bg-card transition-all duration-300 hover:border-primary/35 hover:shadow-lg">
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={post.title}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">بدون تصویر</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.category && <div className="mb-2.5"><CategoryBadge category={post.category} /></div>}
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
