import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  if (!title || !description) return NextResponse.json({ error: "عنوان و توضیحات الزامی است" }, { status: 422 });

  const baseSlug = slugify(body.slug?.trim() || title);
  let slug = baseSlug; let i = 2;
  while (await db.project.findUnique({ where: { slug } })) slug = `${baseSlug}-${i++}`;

  const technologies = Array.isArray(body.technologies) ? body.technologies.filter((t: any): t is string => typeof t === "string") : [];

  const project = await db.project.create({
    data: {
      title,
      slug,
      description,
      content: String(body.content ?? ""),
      coverImage: String(body.coverImage ?? "").trim() || null,
      technologies: JSON.stringify(technologies),
      demoUrl: String(body.demoUrl ?? "").trim() || null,
      repoUrl: String(body.repoUrl ?? "").trim() || null,
      featured: Boolean(body.featured),
      status: String(body.status ?? "PUBLISHED"),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  });
  return NextResponse.json({ project });
}
