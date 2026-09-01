import { getSiteUrl } from "@/lib/site-url";
import { resolvePostSeo, type PostSeoInput } from "@/lib/post-seo";

type BreadcrumbItem = { name: string; href?: string };

type ArticleSchemaInput = {
  post: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    coverImage: string | null;
    publishedAt: Date | null;
    updatedAt: Date;
    seoTitle?: string | null;
    metaDescription?: string | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
    focusKeyword?: string | null;
    readingTime: number;
    category?: { name: string; slug: string } | null;
    author: { name: string; bio?: string | null; avatarUrl?: string | null };
    tags: { tag: { name: string } }[];
  };
  settings: {
    siteName: string;
    authorName: string;
    defaultSeoDescription: string;
    defaultOgImage?: string | null;
  };
  breadcrumbs: BreadcrumbItem[];
};

export function buildArticleSeo(post: PostSeoInput & { slug: string }) {
  return resolvePostSeo(post);
}

export function buildArticleJsonLd({ post, settings, breadcrumbs }: ArticleSchemaInput) {
  const siteUrl = getSiteUrl();
  const seo = resolvePostSeo({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    canonicalUrl: post.canonicalUrl,
    ogTitle: post.ogTitle,
    ogDescription: post.ogDescription,
    ogImage: post.ogImage,
    focusKeyword: post.focusKeyword,
  });

  const canonical = seo.canonicalUrl;
  const image = seo.ogImage || undefined;
  const wordCount = (post.content ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const article = {
    "@type": "TechArticle",
    "@id": `${canonical}#article`,
    headline: post.title,
    description: seo.metaDescription,
    image: image ? [image] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    inLanguage: "fa-IR",
    wordCount: wordCount > 0 ? wordCount : undefined,
    timeRequired: post.readingTime > 0 ? `PT${post.readingTime}M` : undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: `${siteUrl}/about`,
      ...(post.author.avatarUrl ? { image: post.author.avatarUrl } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName || settings.authorName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,
    articleSection: post.category?.name,
    keywords: post.tags.map((t) => t.tag.name).join(", ") || undefined,
  };

  const breadcrumbList = {
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs
      .filter((b) => b.href || b.name)
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(item.href ? { item: `${siteUrl}${item.href}` } : {}),
      })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [article, breadcrumbList],
  };
}
