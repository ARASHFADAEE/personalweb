import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { applyPostSeoDefaults } from "@/lib/post-seo";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const post = await db.post.findUnique({
    where: { id },
    include: { category: true, tags: { include: { tag: true } }, author: { select: { id: true, name: true } } },
  });
  if (!post) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 }); }

  const existing = await db.post.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.slug === "string") {
    const newSlug = body.slug.trim() || slugify(String(body.title ?? existing.title));
    if (newSlug !== existing.slug) {
      const clash = await db.post.findUnique({ where: { slug: newSlug } });
      if (clash && clash.id !== id) {
        return NextResponse.json({ error: "این slug قبلاً استفاده شده" }, { status: 422 });
      }
      data.slug = newSlug;
    }
  }
  if (typeof body.excerpt === "string") data.excerpt = body.excerpt.trim() || null;
  if (typeof body.content === "string") {
    data.content = body.content;
    data.readingTime = body.content
      ? Math.max(1, Math.ceil(body.content.split(/\s+/).filter(Boolean).length / 200))
      : 0;
  }
  if (typeof body.coverImage === "string") data.coverImage = body.coverImage.trim() || null;
  if (typeof body.status === "string") {
    const status = body.status as "DRAFT" | "PUBLISHED" | "SCHEDULED";
    data.status = status;
    if (status === "PUBLISHED" && !existing.publishedAt) data.publishedAt = new Date();
    if (status === "PUBLISHED" && body.publishedAt) data.publishedAt = new Date(String(body.publishedAt));
    if (status === "SCHEDULED" && body.scheduledAt) data.scheduledAt = new Date(String(body.scheduledAt));
  }
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (body.categoryId !== undefined) data.categoryId = (body.categoryId as string) || null;

  const nextTitle = typeof data.title === "string" ? data.title : existing.title;
  const nextSlug = typeof data.slug === "string" ? data.slug : existing.slug;
  const nextExcerpt =
    typeof data.excerpt === "string" ? data.excerpt : existing.excerpt;
  const nextCover =
    typeof data.coverImage === "string" ? data.coverImage : existing.coverImage;

  Object.assign(
    data,
    applyPostSeoDefaults(body, {
      title: nextTitle,
      slug: nextSlug,
      excerpt: nextExcerpt,
      coverImage: nextCover,
    })
  );

  const tagIds = Array.isArray(body.tagIds) ? body.tagIds.filter((t): t is string => typeof t === "string") : null;

  const post = await db.$transaction(async (tx) => {
    if (tagIds) {
      await tx.postTag.deleteMany({ where: { postId: id } });
      if (tagIds.length) {
        await tx.postTag.createMany({ data: tagIds.map((tid) => ({ postId: id, tagId: tid })) });
      }
    }
    return tx.post.update({ where: { id }, data, include: { category: true, tags: { include: { tag: true } } } });
  });

  return NextResponse.json({ post });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.post.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
