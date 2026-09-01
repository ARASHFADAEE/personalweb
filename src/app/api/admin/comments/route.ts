import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = req.nextUrl.searchParams.get("status") ?? "all";
  const where =
    status === "all"
      ? {}
      : { status: status.toUpperCase() };

  const comments = await db.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true, slug: true } },
    },
    take: 200,
  });

  const pendingCount = await db.comment.count({ where: { status: "PENDING" } });

  return NextResponse.json({ comments, pendingCount });
}
