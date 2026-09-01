import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/data/posts";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ results: [] });
  const results = await searchPosts(q, 8);
  return NextResponse.json({ results });
}
