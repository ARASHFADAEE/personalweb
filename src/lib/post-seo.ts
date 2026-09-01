import { getSiteUrl } from "@/lib/site-url";

export type PostSeoInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  focusKeyword?: string | null;
};

export type ResolvedPostSeo = {
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string | null;
  focusKeyword: string | null;
};

export function truncateText(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function extractFocusKeyword(title: string): string | null {
  const words = title.trim().split(/\s+/).filter((w) => w.length > 1);
  if (words.length === 0) return null;
  return words.slice(0, 3).join(" ");
}

/** Fill empty SEO fields from title, excerpt, slug, and cover image. */
export function resolvePostSeo(
  input: PostSeoInput,
  siteUrl = getSiteUrl()
): ResolvedPostSeo {
  const base = siteUrl.replace(/\/+$/, "");
  const title = input.title.trim();
  const slug = input.slug.trim() || "slug";
  const excerpt = (input.excerpt ?? "").trim();

  const seoTitle = input.seoTitle?.trim() || truncateText(title, 60);
  const metaDescription =
    input.metaDescription?.trim() || truncateText(excerpt || title, 160);
  const canonicalUrl =
    input.canonicalUrl?.trim() || `${base}/blog/${slug}`;
  const ogTitle = input.ogTitle?.trim() || seoTitle;
  const ogDescription = input.ogDescription?.trim() || metaDescription;
  const ogImage = input.ogImage?.trim() || input.coverImage?.trim() || null;
  const focusKeyword = input.focusKeyword?.trim() || extractFocusKeyword(title);

  return {
    seoTitle,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    focusKeyword,
  };
}

export function applyPostSeoDefaults(
  body: Record<string, unknown>,
  ctx: {
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
  }
) {
  const resolved = resolvePostSeo({
    title: ctx.title,
    slug: ctx.slug,
    excerpt: ctx.excerpt,
    coverImage: ctx.coverImage,
    seoTitle: typeof body.seoTitle === "string" ? body.seoTitle : null,
    metaDescription:
      typeof body.metaDescription === "string" ? body.metaDescription : null,
    canonicalUrl:
      typeof body.canonicalUrl === "string" ? body.canonicalUrl : null,
    ogTitle: typeof body.ogTitle === "string" ? body.ogTitle : null,
    ogDescription:
      typeof body.ogDescription === "string" ? body.ogDescription : null,
    ogImage: typeof body.ogImage === "string" ? body.ogImage : null,
    focusKeyword:
      typeof body.focusKeyword === "string" ? body.focusKeyword : null,
  });

  return {
    ...resolved,
    robotsNoindex:
      typeof body.robotsNoindex === "boolean" ? body.robotsNoindex : false,
    robotsNofollow:
      typeof body.robotsNofollow === "boolean" ? body.robotsNofollow : false,
  };
}
