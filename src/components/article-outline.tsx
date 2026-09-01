import { CheckCircle2 } from "lucide-react";
import type { Heading } from "@/lib/headings";

export function ArticleLearnOutline({ headings }: { headings: Heading[] }) {
  const h2Items = headings.filter((h) => h.level === 2).slice(0, 6);
  const items = h2Items.length >= 3 ? h2Items : headings.filter((h) => h.level === 3).slice(0, 6);
  if (items.length < 3) return null;

  return (
    <section className="article-learn-outline mb-8 rounded-2xl border border-border/70 bg-muted/15 p-5 sm:p-6" aria-label="آنچه در این راهنما می‌خوانید">
      <h2 className="text-base font-bold tracking-tight sm:text-lg">در این راهنما می‌خوانید</h2>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 text-sm leading-7 text-muted-foreground">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <a href={`#${item.id}`} className="transition-colors hover:text-foreground">
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ArticleQuickAnswer({ excerpt }: { excerpt: string | null }) {
  if (!excerpt?.trim()) return null;

  return (
    <section className="article-quick-answer mb-8 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:p-6" aria-label="پاسخ سریع">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-primary">پاسخ سریع</h2>
      <p className="mt-3 text-sm leading-8 text-foreground/90 text-pretty sm:text-base sm:leading-[2]">
        {excerpt}
      </p>
    </section>
  );
}
