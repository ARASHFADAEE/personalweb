import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { listAllPosts } from "@/lib/data/posts";
import { slugify } from "@/lib/slug";
import { applyPostSeoDefaults } from "@/lib/post-seo";

// List all posts (admin) — includes drafts
export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const page = Number(sp.get("page") ?? 1);
  const perPage = Math.min(50, Math.max(1, Number(sp.get("perPage") ?? 20)));
  const search = sp.get("q") ?? "";
  const status = sp.get("status") ?? "ALL";
  const orderBy = (sp.get("sort") as "newest" | "oldest" | "popular") ?? "newest";

  const result = await listAllPosts({ page, perPage, search, status, orderBy });
  return NextResponse.json(result);
}

// Create a post
export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 }); }

  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "عنوان الزامی است" }, { status: 422 });

  const slugIn = String(body.slug ?? "").trim();
  const status = String(body.status ?? "DRAFT") as "DRAFT" | "PUBLISHED" | "SCHEDULED";

  // unique slug
  const baseSlug = slugIn || slugify(title);
  let finalSlug = baseSlug;
  let i = 2;
  while (await db.post.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${i++}`;
  }

  const publishedAtInput = body.publishedAt ? new Date(String(body.publishedAt)) : null;
  const pubAt = status === "PUBLISHED" ? (publishedAtInput ?? new Date()) : publishedAtInput;
  const schAt = status === "SCHEDULED" && body.scheduledAt ? new Date(String(body.scheduledAt)) : null;

  const content = String(body.content ?? "");
  const readingTime = content ? Math.max(1, Math.ceil(content.split(/\s+/).filter(Boolean).length / 200)) : 0;

  const tagIds = Array.isArray(body.tagIds) ? body.tagIds.filter((t): t is string => typeof t === "string") : [];

  const post = await db.post.create({
    data: {
      title,
      slug: finalSlug,
      excerpt: String(body.excerpt ?? "").trim() || null,
      content,
      coverImage: String(body.coverImage ?? "").trim() || null,
      status,
      featured: Boolean(body.featured),
      publishedAt: pubAt,
      scheduledAt: schAt,
      authorId: user.id,
      categoryId: (body.categoryId as string) || null,
      readingTime,
      ...applyPostSeoDefaults(body, {
        title,
        slug: finalSlug,
        excerpt: String(body.excerpt ?? "").trim() || null,
        coverImage: String(body.coverImage ?? "").trim() || null,
      }),
      tags: tagIds.length ? { create: tagIds.map((tid) => ({ tagId: tid })) } : undefined,
    },
    include: { category: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json({ post });
}
