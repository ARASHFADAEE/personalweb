import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations/schema";
import { hashIp, serializeComment } from "@/lib/comments";

type Params = Promise<{ slug: string }>;

export async function GET(_req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;
  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
  }

  const comments = await db.comment.findMany({
    where: { postId: post.id, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    comments: comments.map(serializeComment),
    total: comments.length,
  });
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "ورودی نامعتبر";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true, pending: true });
  }

  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "مقاله یافت نشد" }, { status: 404 });
  }

  const ipHash = hashIp(req);
  const recent = await db.comment.findFirst({
    where: {
      ipHash,
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
  });
  if (recent) {
    return NextResponse.json(
      { error: "لطفاً کمی صبر کنید و دوباره تلاش کنید" },
      { status: 429 }
    );
  }

  const email = parsed.data.authorEmail?.trim() || null;

  const comment = await db.comment.create({
    data: {
      postId: post.id,
      authorName: parsed.data.authorName.trim(),
      authorEmail: email,
      content: parsed.data.content.trim(),
      status: "PENDING",
      ipHash,
    },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
      status: true,
    },
  });

  return NextResponse.json({
    ok: true,
    pending: true,
    message: "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود.",
    comment: serializeComment(comment),
  });
}
