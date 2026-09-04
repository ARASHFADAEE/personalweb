import Image from "next/image";
import { Camera } from "lucide-react";
import { getSiteUrl } from "@/lib/site-url";

/** Gallery portraits used on the about page (SEO-friendly filenames). */
export const ABOUT_GALLERY_IMAGES = [
  "/img/Gallery/arash-fadaei-01.jpg",
  "/img/Gallery/arash-fadaei-02.jpg",
  "/img/Gallery/arash-fadaei-03.jpg",
  "/img/Gallery/arash-fadaei-04.jpg",
  "/img/Gallery/arash-fadaei-05.jpg",
] as const;

export function aboutGalleryAbsoluteUrls(): string[] {
  const base = getSiteUrl();
  return ABOUT_GALLERY_IMAGES.map((path) => `${base}${path}`);
}

type AboutGalleryProps = {
  authorName: string;
};

export function AboutGallery({ authorName }: AboutGalleryProps) {
  const alt = authorName.trim() || "آرش فدایی";

  return (
    <section className="border-b border-border/60">
      <div className="container mx-auto px-4 py-12 lg:px-6 lg:py-16">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary">
            <Camera className="h-3.5 w-3.5" />
            گالری
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{alt}</h2>
          <p className="mt-2 text-sm text-muted-foreground text-pretty">
            تصاویر شخصی برای آشنایی بیشتر با من
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-6">
          {ABOUT_GALLERY_IMAGES.map((src, index) => {
            const isHero = index === 0;
            return (
              <figure
                key={src}
                className={
                  isHero
                    ? "col-span-2 row-span-2 overflow-hidden rounded-2xl border border-border bg-muted md:col-span-3"
                    : "col-span-1 overflow-hidden rounded-2xl border border-border bg-muted md:col-span-3"
                }
              >
                <div className={isHero ? "relative aspect-square h-full" : "relative aspect-[4/5] sm:aspect-square"}>
                  <Image
                    src={src}
                    alt={alt}
                    title={alt}
                    fill
                    sizes={
                      isHero
                        ? "(max-width: 768px) 100vw, 50vw"
                        : "(max-width: 768px) 50vw, 33vw"
                    }
                    className="object-cover object-center transition-transform duration-500 hover:scale-[1.03]"
                    priority={index < 2}
                  />
                </div>
                <figcaption className="sr-only">{alt}</figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
