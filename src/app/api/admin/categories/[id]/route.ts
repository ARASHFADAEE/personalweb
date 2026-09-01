import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, string | null> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") {
    const newSlug = slugify(body.slug.trim() || body.name);
    const clash = await db.category.findUnique({ where: { slug: newSlug } });
    if (clash && clash.id !== id) return NextResponse.json({ error: "slug تکراری" }, { status: 422 });
    data.slug = newSlug;
  }
  if (typeof body.description === "string") data.description = body.description.trim() || null;
  if (typeof body.color === "string") data.color = body.color.trim() || null;
  if (typeof body.seoTitle === "string") data.seoTitle = body.seoTitle.trim() || null;
  if (typeof body.metaDescription === "string") data.metaDescription = body.metaDescription.trim() || null;

  const category = await db.category.update({ where: { id }, data });
  return NextResponse.json({ category });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.category.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
