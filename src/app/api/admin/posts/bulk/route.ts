import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: { action?: string; ids?: string[] };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 }); }

  const ids = (body.ids ?? []).filter((x) => typeof x === "string");
  if (!ids.length) return NextResponse.json({ error: "هیچ موردی انتخاب نشده" }, { status: 422 });

  switch (body.action) {
    case "publish":
      await db.post.updateMany({ where: { id: { in: ids } }, data: { status: "PUBLISHED", publishedAt: new Date() } });
      break;
    case "draft":
      await db.post.updateMany({ where: { id: { in: ids } }, data: { status: "DRAFT" } });
      break;
    case "delete":
      await db.post.deleteMany({ where: { id: { in: ids } } });
      break;
    default:
      return NextResponse.json({ error: "action نامعتبر" }, { status: 422 });
  }
  return NextResponse.json({ ok: true });
}
