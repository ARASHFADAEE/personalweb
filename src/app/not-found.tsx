import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function NotFound() {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="font-mono text-7xl font-bold text-primary sm:text-8xl">۴۰۴</p>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">صفحه‌ای که می‌خواستید پیدا نشد</h1>
        <p className="mt-2 max-w-md text-balance text-muted-foreground text-pretty">
          شاید آدرس را اشتباه وارد کرده‌اید یا صفحه منتقل شده. می‌توانید به خانه برگردید یا بگردید.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="gap-2">
            <Link href="/"><Home className="h-4 w-4" /> بازگشت به خانه</Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/blog"><Search className="h-4 w-4" /> مرور مقالات</Link>
          </Button>
        </div>
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
