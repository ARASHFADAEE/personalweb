import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { revalidateProjectPages } from "@/lib/revalidate-public";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.description === "string") data.description = body.description.trim();
  if (typeof body.content === "string") data.content = body.content;
  if (typeof body.coverImage === "string") data.coverImage = body.coverImage.trim() || null;
  if (typeof body.demoUrl === "string") data.demoUrl = body.demoUrl.trim() || null;
  if (typeof body.repoUrl === "string") data.repoUrl = body.repoUrl.trim() || null;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (typeof body.status === "string") data.status = body.status;
  if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
  if (typeof body.slug === "string") {
    const newSlug = slugify(body.slug.trim() || body.title);
    const clash = await db.project.findUnique({ where: { slug: newSlug } });
    if (clash && clash.id !== id) return NextResponse.json({ error: "slug تکراری" }, { status: 422 });
    data.slug = newSlug;
  }
  if (Array.isArray(body.technologies)) data.technologies = JSON.stringify(body.technologies.filter((t: any): t is string => typeof t === "string"));

  const project = await db.project.update({ where: { id }, data });
  revalidateProjectPages(project.slug);
  return NextResponse.json({ project });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = await db.project.findUnique({ where: { id }, select: { slug: true } });
  await db.project.delete({ where: { id } }).catch(() => {});
  revalidateProjectPages(existing?.slug);
  return NextResponse.json({ ok: true });
}
