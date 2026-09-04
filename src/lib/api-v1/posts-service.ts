import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { applyPostSeoDefaults } from "@/lib/post-seo";
import { ApiError } from "@/lib/api-v1/errors";
import { revalidatePath } from "next/cache";
import { getSiteUrl } from "@/lib/site-url";
import { normalizeMarkdownTables } from "@/lib/markdown-tables";

const optionalUrl = z
  .string()
  .max(2000)
  .refine((v) => !v || /^https?:\/\//i.test(v) || v.startsWith("/"), {
    message: "آدرس باید http(s) یا مسیر نسبی باشد",
  })
  .optional()
  .or(z.literal(""));

export const publishPostBodySchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").max(200),
  slug: z.string().max(200).optional().or(z.literal("")),
  excerpt: z.string().max(800).optional().or(z.literal("")),
  content: z.string().min(1, "محتوا الزامی است").max(500_000),
  coverImage: optionalUrl,
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]).default("DRAFT"),
  featured: z.boolean().optional().default(false),
  publishedAt: z.string().max(40).optional().or(z.literal("")),
  scheduledAt: z.string().max(40).optional().or(z.literal("")),
  categoryId: z.string().max(64).optional().or(z.literal("")),
  categorySlug: z.string().max(100).optional().or(z.literal("")),
  tagIds: z.array(z.string().max(64)).max(30).optional().default([]),
  tags: z.array(z.string().min(1).max(60)).max(30).optional().default([]),
  upsert: z.boolean().optional().default(false),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  canonicalUrl: optionalUrl,
  ogTitle: z.string().max(120).optional().or(z.literal("")),
  ogDescription: z.string().max(300).optional().or(z.literal("")),
  ogImage: optionalUrl,
  focusKeyword: z.string().max(120).optional().or(z.literal("")),
  robotsNoindex: z.boolean().optional().default(false),
  robotsNofollow: z.boolean().optional().default(false),
});

export type PublishPostBody = z.infer<typeof publishPostBodySchema>;

function parseOptionalDate(value: string, field: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(422, "INVALID_DATE", `مقدار ${field} تاریخ معتبر نیست`);
  }
  return date;
}

export function revalidateBlogSurfaces(slug?: string) {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
}

async function resolveAuthorId(): Promise<string> {
  const email = process.env.PUBLISH_API_AUTHOR_EMAIL?.trim();
  if (email) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError(
        503,
        "AUTHOR_NOT_FOUND",
        `کاربر نویسنده با ایمیل ${email} یافت نشد`
      );
    }
    return user.id;
  }

  const admin = await db.user.findFirst({
    where: { role: { in: ["ADMIN", "EDITOR"] } },
    orderBy: { createdAt: "asc" },
  });
  if (!admin) {
    throw new ApiError(503, "AUTHOR_NOT_FOUND", "هیچ کاربر ادمینی برای انتساب مقاله وجود ندارد");
  }
  return admin.id;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let finalSlug = base || "post";
  let i = 2;
  while (true) {
    const existing = await db.post.findUnique({ where: { slug: finalSlug } });
    if (!existing || (excludeId && existing.id === excludeId)) return finalSlug;
    finalSlug = `${base}-${i++}`;
  }
}

async function resolveCategoryId(input: PublishPostBody): Promise<string | null> {
  if (input.categoryId) {
    const cat = await db.category.findUnique({ where: { id: input.categoryId } });
    if (!cat) throw new ApiError(422, "INVALID_CATEGORY", "categoryId نامعتبر است");
    return cat.id;
  }
  if (input.categorySlug) {
    const cat = await db.category.findUnique({ where: { slug: input.categorySlug } });
    if (!cat) throw new ApiError(422, "INVALID_CATEGORY", "categorySlug نامعتبر است");
    return cat.id;
  }
  return null;
}

async function resolveTagIds(input: PublishPostBody): Promise<string[]> {
  const ids = new Set<string>(input.tagIds ?? []);

  for (const raw of input.tags ?? []) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name) || name.toLowerCase();
    const tag = await db.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ids.add(tag.id);
  }

  if (input.tagIds?.length) {
    const found = await db.tag.findMany({
      where: { id: { in: input.tagIds } },
      select: { id: true },
    });
    if (found.length !== input.tagIds.length) {
      throw new ApiError(422, "INVALID_TAG", "یکی از tagIds نامعتبر است");
    }
  }

  return [...ids];
}

function readingTimeFromContent(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function serializePost<T extends {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  featured: boolean;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  readingTime: number;
  viewsCount: number;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: { id: string; name: string; slug: string } | null;
  tags?: { tag: { id: string; name: string; slug: string } }[];
}>(post: T) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.coverImage,
    status: post.status,
    featured: post.featured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    readingTime: post.readingTime,
    viewsCount: post.viewsCount,
    categoryId: post.categoryId,
    category: post.category
      ? { id: post.category.id, name: post.category.name, slug: post.category.slug }
      : null,
    tags: (post.tags ?? []).map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      slug: t.tag.slug,
    })),
    url: `${getSiteUrl()}/blog/${post.slug}`,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

const postInclude = {
  category: { select: { id: true, name: true, slug: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
} as const;

export async function createOrUpsertPost(input: PublishPostBody) {
  const authorId = await resolveAuthorId();
  const categoryId = await resolveCategoryId(input);
  const tagIds = await resolveTagIds(input);

  const baseSlug = slugify(input.slug || input.title) || "post";
  const existing = await db.post.findUnique({ where: { slug: baseSlug } });

  if (existing && !input.upsert) {
    throw new ApiError(409, "SLUG_EXISTS", "مقاله‌ای با این slug وجود دارد. برای به‌روزرسانی upsert=true بفرستید.", {
      id: existing.id,
      slug: existing.slug,
    });
  }

  const status = input.status;
  const publishedAtInput = input.publishedAt
    ? parseOptionalDate(input.publishedAt, "publishedAt")
    : null;
  const publishedAt =
    status === "PUBLISHED" ? publishedAtInput ?? new Date() : publishedAtInput;
  const scheduledAt =
    status === "SCHEDULED"
      ? parseOptionalDate(input.scheduledAt || "", "scheduledAt")
      : null;
  if (status === "SCHEDULED" && !scheduledAt) {
    throw new ApiError(422, "INVALID_SCHEDULE", "برای SCHEDULED مقدار scheduledAt الزامی است");
  }

  const content = normalizeMarkdownTables(input.content);
  const excerpt = input.excerpt?.trim() || null;
  const coverImage = input.coverImage?.trim() || null;
  const readingTime = readingTimeFromContent(content);
  const seo = applyPostSeoDefaults(input as unknown as Record<string, unknown>, {
    title: input.title.trim(),
    slug: baseSlug,
    excerpt,
    coverImage,
  });

  if (existing && input.upsert) {
    await db.postTag.deleteMany({ where: { postId: existing.id } });
    const post = await db.post.update({
      where: { id: existing.id },
      data: {
        title: input.title.trim(),
        excerpt,
        content,
        coverImage,
        status,
        featured: Boolean(input.featured),
        publishedAt,
        scheduledAt,
        categoryId,
        readingTime,
        ...seo,
        tags: tagIds.length
          ? { create: tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: postInclude,
    });
    revalidateBlogSurfaces(post.slug);
    return { post: serializePost(post), created: false };
  }

  const finalSlug = await uniqueSlug(baseSlug);
  const seoFinal = applyPostSeoDefaults(input as unknown as Record<string, unknown>, {
    title: input.title.trim(),
    slug: finalSlug,
    excerpt,
    coverImage,
  });

  const post = await db.post.create({
    data: {
      title: input.title.trim(),
      slug: finalSlug,
      excerpt,
      content,
      coverImage,
      status,
      featured: Boolean(input.featured),
      publishedAt,
      scheduledAt,
      authorId,
      categoryId,
      readingTime,
      ...seoFinal,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
    },
    include: postInclude,
  });

  revalidateBlogSurfaces(post.slug);
  return { post: serializePost(post), created: true };
}

export async function getPostByIdOrSlug(idOrSlug: string) {
  const post = await db.post.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: postInclude,
  });
  if (!post) throw new ApiError(404, "NOT_FOUND", "مقاله یافت نشد");
  return serializePost(post);
}

export async function listCategoriesForApi() {
  const rows = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, description: true },
  });
  return rows;
}

export async function listTagsForApi() {
  const rows = await db.tag.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
  return rows;
}
