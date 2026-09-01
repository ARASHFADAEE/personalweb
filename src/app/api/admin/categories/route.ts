import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "نام الزامی است" }, { status: 422 });

  const baseSlug = slugify(body.slug?.trim() || name);
  let slug = baseSlug;
  let i = 2;
  while (await db.category.findUnique({ where: { slug } })) slug = `${baseSlug}-${i++}`;

  const category = await db.category.create({
    data: {
      name,
      slug,
      description: body.description?.trim() || null,
      color: body.color?.trim() || null,
      seoTitle: body.seoTitle?.trim() || null,
      metaDescription: body.metaDescription?.trim() || null,
    },
  });
  return NextResponse.json({ category });
}
