import { NextRequest, NextResponse } from "next/server";
import { listPublishedPosts, type PostListOrderBy } from "@/lib/data/posts";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? "";
  const cat = sp.get("cat") ?? "all";
  const sort = (sp.get("sort") as PostListOrderBy) ?? "newest";
  const page = Number(sp.get("page") ?? 1);

  const result = await listPublishedPosts({
    page,
    perPage: 9,
    search: q,
    categorySlug: cat && cat !== "all" ? cat : undefined,
    orderBy: sort,
  });

  return NextResponse.json({
    items: result.items,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
    totalPages: result.totalPages,
  });
}
