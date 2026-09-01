import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { Settings } from "@/lib/data/settings";
import { listCategoriesWithCount } from "@/lib/data/posts";

export async function SiteFooter({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const categories = (await listCategoriesWithCount()).filter((c) => c.postsCount > 0);

  return (
    <footer className="mt-auto border-t border-border/70 bg-muted/30">
      <div className="container mx-auto px-4 py-10 lg:px-6">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold">
                {"</>"}
              </span>
              <span className="font-mono text-lg font-semibold tracking-tight">
                {settings.logoText}
              </span>
              <span className="sr-only">{settings.siteName}</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground text-pretty">
              <span className="font-medium text-foreground">{settings.siteName}</span>
              {" — "}
              {settings.siteDescription}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {settings.socialGithub && (
                <a
                  href={settings.socialGithub}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="گیت‌هاب"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {settings.socialLinkedin && (
                <a
                  href={settings.socialLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="لینکدین"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {settings.socialX && (
                <a
                  href={settings.socialX}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ایکس"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {settings.socialEmail && (
                <a
                  href={`mailto:${settings.socialEmail}`}
                  aria-label="ایمیل"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-3 text-sm font-semibold">دسترسی سریع</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/" className="transition-colors hover:text-foreground">خانه</Link></li>
              <li><Link href="/blog" className="transition-colors hover:text-foreground">وبلاگ</Link></li>
              <li><Link href="/projects" className="transition-colors hover:text-foreground">پروژه‌ها</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-foreground">درباره‌ی من</Link></li>
              <li><Link href="/rss.xml" className="transition-colors hover:text-foreground">RSS Feed</Link></li>
              <li><Link href="/sitemap.xml" className="transition-colors hover:text-foreground">نقشه سایت</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="mb-3 text-sm font-semibold">دسته‌بندی‌ها</h3>
            {categories.length > 0 ? (
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/categories/${category.slug}`}
                      className="transition-colors hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                هنوز دسته‌بندی‌ای ثبت نشده.{" "}
                <Link href="/blog" className="text-foreground underline-offset-4 hover:underline">
                  مشاهده‌ی مقالات
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {settings.authorName} — تمام حقوق محفوظ است.</p>
          <p className="font-mono text-xs">{settings.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
