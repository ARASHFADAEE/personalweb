import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Home } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "مقاله یافت نشد",
  robots: { index: false, follow: true },
};

export default async function ArticleNotFound() {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-mono text-6xl font-bold text-primary sm:text-7xl">۴۰۴</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">مقاله‌ای با این آدرس پیدا نشد</h1>
        <p className="mt-2 max-w-md text-balance text-muted-foreground text-pretty">
          شاید حذف شده، منتقل شده، یا هنوز منتشر نشده باشد.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4" />
              بازگشت به وبلاگ
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              صفحه اصلی
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
