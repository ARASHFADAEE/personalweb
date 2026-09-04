import Link from "next/link";
import type { Metadata } from "next";
import {
  Github,
  Linkedin,
  Mail,
  ArrowLeft,
  Code2,
  Sparkles,
  BookOpen,
  Layers,
} from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AboutGallery, aboutGalleryAbsoluteUrls } from "@/components/about-gallery";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata } from "@/lib/page-seo";
import { getSiteUrl } from "@/lib/site-url";

const BIO_ARTICLE_HREF = "/blog/who-is-arash-fadaee";

const SPECIALTIES = [
  {
    title: "Laravel و Livewire",
    description: "توسعه فول‌استک بک‌اند و رابط کاربری تعاملی با اکوسیستم لاراول.",
  },
  {
    title: "WordPress",
    description: "ساخت قالب، پلاگین و محصولات وردپرسی برای پروژه‌های واقعی.",
  },
  {
    title: "Vue.js",
    description: "فرانت‌اند مدرن و کامپوننت‌محور برای اپلیکیشن‌های سریع و قابل نگهداری.",
  },
  {
    title: "Next.js",
    description: "وب‌اپ و تجربه کاربری مدرن با React و معماری App Router.",
  },
] as const;

const STACK_TAGS = [
  "PHP",
  "Laravel",
  "Livewire",
  "WordPress",
  "Vue.js",
  "Next.js",
  "Full Stack",
  "Product Building",
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const images = aboutGalleryAbsoluteUrls();
  const meta = buildPageMetadata({
    title: settings.aboutSeoTitle,
    description: settings.aboutSeoDescription,
    path: "/about",
    settings,
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      images: images.map((url) => ({
        url,
        alt: settings.authorName || "آرش فدایی",
      })),
    },
  };
}

export const revalidate = 3600;

export default async function AboutPage() {
  const settings = await getSettings();
  const authorName = settings.authorName?.trim() || "آرش فدایی";
  const galleryUrls = aboutGalleryAbsoluteUrls();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: authorName,
        alternateName: ["حسین فدایی", "آرش فدایی"],
        description:
          "برنامه‌نویس فول‌استک با تخصص Laravel، Livewire، WordPress، Vue.js و Next.js",
        url: getSiteUrl(),
        image: galleryUrls,
        knowsAbout: [...STACK_TAGS],
        sameAs: [
          settings.socialGithub,
          settings.socialLinkedin,
          settings.socialX,
        ].filter(Boolean),
      },
      ...galleryUrls.map((url) => ({
        "@type": "ImageObject",
        contentUrl: url,
        url,
        name: authorName,
        caption: authorName,
        description: authorName,
        author: {
          "@type": "Person",
          name: authorName,
        },
      })),
    ],
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader settings={settings} />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-muted/20">
          <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-5 gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                درباره‌ی من
              </Badge>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                {authorName}
              </h1>
              <p className="mt-6 text-balance text-lg leading-8 text-muted-foreground text-pretty">
                برنامه‌نویس فول‌استک — با Laravel و Livewire در بک‌اند، WordPress در محصولات وب،
                و Vue.js و Next.js در فرانت‌اند کار می‌کنم.
              </p>
              <div className="mt-8 flex items-center justify-center gap-2">
                {settings.socialGithub && (
                  <a
                    href={settings.socialGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="گیت‌هاب"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {settings.socialLinkedin && (
                  <a
                    href={settings.socialLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="لینکدین"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {settings.socialEmail && (
                  <a
                    href={`mailto:${settings.socialEmail}`}
                    aria-label="ایمیل"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <AboutGallery authorName={authorName} />

        <section className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-10">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">داستان کوتاه</h2>
              </div>
              <div className="space-y-4 text-base leading-8 text-muted-foreground text-pretty">
                <p>
                  من حسین فدایی هستم؛ با نام «آرش فدایی» شناخته می‌شوم. مسیرم از خانه ریاضیات
                  و شروع برنامه‌نویسی شروع شد، چند بار مجبور شدم از صفر دوباره بسازم — از
                  دست‌دادن لپ‌تاپ تا فریلنسری، Laravel، ساخت محصول و تجربهٔ ولناموزیک با
                  ده‌ها هزار کاربر روزانه.
                </p>
                <p>
                  امروز خودم را بیشتر «سازنده» می‌دانم تا فقط برنامه‌نویس: ایده را می‌گیرم،
                  راه‌حل می‌سازم و سعی می‌کنم به چیزی تبدیلش کنم که آدم‌های واقعی از آن استفاده کنند.
                </p>
                <blockquote className="border-r-2 border-primary/50 pr-4 text-foreground/90 italic">
                  «من همیشه بهترین شرایط رو نداشتم؛ ولی همیشه سعی کردم از همون چیزی که داشتم،
                  یه چیز بهتر بسازم.»
                </blockquote>
              </div>
              <Button asChild variant="outline" className="mt-6 gap-2">
                <Link href={BIO_ARTICLE_HREF}>
                  ادامه داستان در مقاله
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                جزئیات کامل مسیر زندگی و کارم را در صفحهٔ{" "}
                <Link href={BIO_ARTICLE_HREF} className="text-primary underline-offset-2 hover:underline">
                  آرش فدایی کیست؟
                </Link>{" "}
                بخوانید.
              </p>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">تخصص‌ها</h2>
              </div>
              <p className="mb-5 text-sm leading-7 text-muted-foreground text-pretty">
                تمرکز اصلی‌ام فول‌استک با Laravel و Livewire است؛ در WordPress هم تجربهٔ جدی دارم
                و در فرانت‌اند با Vue.js و Next.js کار می‌کنم.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SPECIALTIES.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight">ابزارها و مهارت‌ها</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {STACK_TAGS.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-muted py-1.5 px-3 font-mono text-sm">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-6 lg:p-8">
              <h2 className="text-xl font-bold tracking-tight">بیایید صحبت کنیم</h2>
              <p className="mt-2 text-muted-foreground text-pretty">
                برای همکاری، سوال یا فقط سلام، می‌توانید از راه‌های زیر با من در ارتباط باشید.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {settings.socialEmail && (
                  <Button asChild className="gap-2">
                    <a href={`mailto:${settings.socialEmail}`}>
                      <Mail className="h-4 w-4" /> ارسال ایمیل
                    </a>
                  </Button>
                )}
                <Button asChild variant="outline" className="gap-2">
                  <Link href={BIO_ARTICLE_HREF}>
                    <BookOpen className="h-4 w-4" /> خواندن داستان کامل
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter settings={settings} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
