import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArticleBreadcrumbItem = {
  name: string;
  href?: string;
};

export function ArticleBreadcrumbs({
  items,
  className,
}: {
  items: ArticleBreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="مسیر" className={cn("mb-6", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.name}-${index}`} className="inline-flex min-w-0 items-center gap-1.5">
              {index > 0 && <ChevronLeft className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
              {item.href && !isLast ? (
                <Link href={item.href} className="truncate transition-colors hover:text-foreground">
                  {item.name}
                </Link>
              ) : (
                <span
                  className={cn("truncate", isLast ? "text-foreground/70" : undefined)}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
