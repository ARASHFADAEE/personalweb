import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await db.media.findMany({ orderBy: { createdAt: "desc" }, take: 60 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // direct create by URL
  const body = await req.json();
  const media = await db.media.create({
    data: {
      filename: body.filename || "manual",
      originalName: body.originalName || body.filename || "manual",
      url: body.url,
      mimeType: body.mimeType || "image/png",
      size: Number(body.size ?? 0),
      altText: body.altText ?? null,
      caption: body.caption ?? null,
    },
  });
  return NextResponse.json({ media });
}
