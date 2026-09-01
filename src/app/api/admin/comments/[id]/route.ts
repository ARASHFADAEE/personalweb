import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { z } from "zod";

type Params = Promise<{ id: string }>;

const patchSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "وضعیت نامعتبر" }, { status: 422 });
  }

  const comment = await db.comment.update({
    where: { id },
    data: { status: parsed.data.status },
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
  });

  return NextResponse.json({ comment });
}

export async function DELETE(_req: NextRequest, { params }: { params: Params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
