import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const media = await db.media.update({
    where: { id },
    data: {
      ...(typeof body.altText === "string" ? { altText: body.altText || null } : {}),
      ...(typeof body.caption === "string" ? { caption: body.caption || null } : {}),
    },
  });
  return NextResponse.json({ media });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const media = await db.media.findUnique({ where: { id } });
  if (media?.url.startsWith("/uploads/")) {
    // best-effort delete of file
    const fs = await import("fs/promises");
    const path = await import("path");
    try { await fs.unlink(path.join(process.cwd(), "public", media.url)); } catch {}
  }
  await db.media.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
