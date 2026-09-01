import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, string> = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.slug === "string") {
    const newSlug = slugify(body.slug.trim() || body.name);
    const clash = await db.tag.findUnique({ where: { slug: newSlug } });
    if (clash && clash.id !== id) return NextResponse.json({ error: "slug تکراری" }, { status: 422 });
    data.slug = newSlug;
  }
  const tag = await db.tag.update({ where: { id }, data });
  return NextResponse.json({ tag });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.tag.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
