import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArticleEndCta() {
  return (
    <section className="article-end-cta mt-10 rounded-2xl border border-border/70 bg-muted/20 px-6 py-8 text-center sm:px-8">
      <BookOpen className="mx-auto h-5 w-5 text-primary" aria-hidden />
      <h2 className="mt-3 text-lg font-bold tracking-tight sm:text-xl">از این مقاله لذت بردید؟</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground text-pretty">
        مقالات بیشتری درباره توسعه وب، هوش مصنوعی، WordPress و فناوری‌های مدرن را در وبلاگ بخوانید.
      </p>
      <Button asChild className="mt-5 h-10 gap-2 rounded-xl">
        <Link href="/blog">
          مرور مقالات
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
    </section>
  );
}
