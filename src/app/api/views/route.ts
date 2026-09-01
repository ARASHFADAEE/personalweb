import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Track a post view (idempotent per session via simple cookie check)
export async function POST(req: NextRequest) {
  let body: { slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const slug = body.slug;
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });

  const post = await db.post.findFirst({ where: { slug, status: "PUBLISHED" }, select: { id: true } });
  if (!post) return NextResponse.json({ ok: false }, { status: 404 });

  // Anonymous analytics
  const ua = req.headers.get("user-agent");
  await db.$transaction([
    db.postView.create({ data: { postId: post.id, userAgent: ua?.slice(0, 250) } }),
    db.post.update({ where: { id: post.id }, data: { viewsCount: { increment: 1 } } }),
  ]);
  return NextResponse.json({ ok: true });
}
