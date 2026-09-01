import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Eye, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatJalali, formatJalaliShort } from "@/lib/jalali";
import { formatCount, toPersianDigits } from "@/lib/slug";

type ArticleHeroProps = {
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category?: { name: string; slug: string } | null;
  author: { name: string; avatarUrl?: string | null };
  publishedAt: Date | null;
  updatedAt: Date;
  readingTime: number;
  viewsCount: number;
};

export function ArticleHero({
  title,
  excerpt,
  coverImage,
  category,
  author,
  publishedAt,
  updatedAt,
  readingTime,
  viewsCount,
}: ArticleHeroProps) {
  const showUpdated = publishedAt ? updatedAt > publishedAt : false;
  const initials = author.name.slice(0, 2);

  return (
    <header className="article-hero mx-auto max-w-[720px]">
      {category && (
        <Link href={`/categories/${category.slug}`} className="mb-4 inline-block">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/15">
            {category.name}
          </Badge>
        </Link>
      )}

      <h1
        className="text-balance text-[1.875rem] font-extrabold leading-[1.2] tracking-tight sm:text-4xl lg:text-[2.75rem]"
        itemProp="headline"
      >
        {title}
      </h1>

      {excerpt && (
        <p
          className="mt-4 text-balance text-base leading-[2] text-muted-foreground text-pretty sm:mt-5 sm:text-lg sm:leading-[2.05]"
          itemProp="description"
        >
          {excerpt}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm text-muted-foreground sm:mt-7">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9">
            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.name} />}
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground" itemProp="author">
            {author.name}
          </span>
        </div>

        {publishedAt && (
          <time dateTime={publishedAt.toISOString()} className="inline-flex items-center gap-1.5" itemProp="datePublished">
            <Calendar className="h-3.5 w-3.5" aria-hidden />
            <span>انتشار: {formatJalali(publishedAt)}</span>
          </time>
        )}

        {showUpdated && (
          <time dateTime={updatedAt.toISOString()} className="inline-flex items-center gap-1.5" itemProp="dateModified">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            <span>به‌روزرسانی: {formatJalaliShort(updatedAt)}</span>
          </time>
        )}

        {readingTime > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            <span>{toPersianDigits(readingTime)} دقیقه مطالعه</span>
          </span>
        )}

        {viewsCount > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            <span>{formatCount(viewsCount)} بازدید</span>
          </span>
        )}
      </div>

      {coverImage && (
        <figure className="article-hero-figure mt-8 sm:mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/80 bg-muted">
            <Image
              src={coverImage}
              alt={title}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
            />
          </div>
        </figure>
      )}
    </header>
  );
}
