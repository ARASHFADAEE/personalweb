import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/** Published posts visible on the public site (includes legacy rows with null publishedAt). */
function publishedWhere(now = new Date()): Prisma.PostWhereInput {
  return {
    status: "PUBLISHED",
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };
}

const PUBLISHED_WHERE = publishedWhere();

// ---------------------------------------------------------------------------
// Public: list posts (blog page) with search, filter, sort, pagination
// ---------------------------------------------------------------------------

export type PostListOrderBy = "newest" | "oldest" | "popular";

export async function listPublishedPosts(opts: {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  tagSlug?: string;
  categorySlug?: string;
  orderBy?: PostListOrderBy;
  featuredOnly?: boolean;
} = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(24, Math.max(1, opts.perPage ?? 9));
  const skip = (page - 1) * perPage;

  const where: Prisma.PostWhereInput = { ...PUBLISHED_WHERE };

  if (opts.search?.trim()) {
    const q = opts.search.trim();
    where.OR = [
      { title: { contains: q } },
      { excerpt: { contains: q } },
      { content: { contains: q } },
      { focusKeyword: { contains: q } },
      { tags: { some: { tag: { name: { contains: q } } } } },
      { category: { name: { contains: q } } },
    ];
  }
  if (opts.categoryId) where.categoryId = opts.categoryId;
  if (opts.categorySlug) where.category = { slug: opts.categorySlug };
  if (opts.tagSlug) where.tags = { some: { tag: { slug: opts.tagSlug } } };
  if (opts.featuredOnly) where.featured = true;

  const orderBy: Prisma.PostOrderByWithRelationInput =
    opts.orderBy === "popular"
      ? { viewsCount: "desc" }
      : opts.orderBy === "oldest"
      ? { publishedAt: "asc" }
      : { publishedAt: "desc" };

  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    }),
    db.post.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

// ---------------------------------------------------------------------------
// Public: single post by slug (only published or scheduled-past)
// ---------------------------------------------------------------------------

export async function getPublishedPostBySlug(slug: string) {
  return db.post.findFirst({
    where: { slug, ...publishedWhere() },
    include: {
      category: true,
      author: { select: { id: true, name: true, bio: true, avatarUrl: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getPostById(id: string) {
  return db.post.findUnique({
    where: { id },
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });
}

// ---------------------------------------------------------------------------
// Public: featured + latest for homepage
// ---------------------------------------------------------------------------

export async function getFeaturedPosts(limit = 3) {
  return db.post.findMany({
    where: { ...publishedWhere(), featured: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function countPublishedPosts() {
  return db.post.count({ where: publishedWhere() });
}

export async function getLatestPosts(limit = 6, excludeIds: string[] = []) {
  return db.post.findMany({
    where: { ...publishedWhere(), ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}) },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
    },
  });
}

export async function getRelatedPosts(postId: string, categoryId?: string | null, limit = 3) {
  return db.post.findMany({
    where: {
      ...PUBLISHED_WHERE,
      id: { not: postId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: {
      category: true,
      author: { select: { id: true, name: true } },
    },
  });
}

export async function getAdjacentPosts(publishedAt: Date) {
  const [prev, next] = await Promise.all([
    db.post.findFirst({
      where: { ...PUBLISHED_WHERE, publishedAt: { gt: publishedAt } },
      orderBy: { publishedAt: "asc" },
      select: { title: true, slug: true },
    }),
    db.post.findFirst({
      where: { ...PUBLISHED_WHERE, publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: "desc" },
      select: { title: true, slug: true },
    }),
  ]);
  return { prev, next };
}

// ---------------------------------------------------------------------------
// Public: search command palette results (fast, title + excerpt only)
// ---------------------------------------------------------------------------

export async function searchPosts(q: string, limit = 8) {
  const query = q.trim();
  if (!query) return [];
  return db.post.findMany({
    where: {
      ...PUBLISHED_WHERE,
      OR: [
        { title: { contains: query } },
        { excerpt: { contains: query } },
        { tags: { some: { tag: { name: { contains: query } } } } },
        { category: { name: { contains: query } } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { id: true, title: true, slug: true, excerpt: true, category: { select: { name: true } } },
  });
}

// ---------------------------------------------------------------------------
// Admin: list all posts (incl. drafts)
// ---------------------------------------------------------------------------

export async function listAllPosts(opts: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  orderBy?: PostListOrderBy;
} = {}) {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(50, Math.max(1, opts.perPage ?? 20));
  const skip = (page - 1) * perPage;

  const where: Prisma.PostWhereInput = {};
  if (opts.search?.trim()) {
    const q = opts.search.trim();
    where.OR = [
      { title: { contains: q } },
      { slug: { contains: q } },
      { excerpt: { contains: q } },
    ];
  }
  if (opts.status && opts.status !== "ALL") where.status = opts.status;

  const orderBy: Prisma.PostOrderByWithRelationInput =
    opts.orderBy === "popular"
      ? { viewsCount: "desc" }
      : opts.orderBy === "oldest"
      ? { createdAt: "asc" }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    db.post.findMany({
      where,
      orderBy,
      skip,
      take: perPage,
      include: {
        category: { select: { id: true, name: true } },
        author: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    db.post.count({ where }),
  ]);

  return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

// ---------------------------------------------------------------------------
// Categories & Tags
// ---------------------------------------------------------------------------

export async function listCategoriesWithCount() {
  const cats = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: { where: { ...PUBLISHED_WHERE } } } } },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    postsCount: c._count.posts,
  }));
}

export async function listCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function listTagsWithCount() {
  const tags = await db.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: { where: { post: { ...PUBLISHED_WHERE } } } } } },
  });
  return tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    postsCount: t._count.posts,
  }));
}

export async function listAllTags() {
  return db.tag.findMany({ orderBy: { name: "asc" } });
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export async function listPublishedProjects(featuredOnly = false) {
  return db.project.findMany({
    where: { status: "PUBLISHED", ...(featuredOnly ? { featured: true } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPublishedProjectBySlug(slug: string) {
  return db.project.findFirst({ where: { slug, status: "PUBLISHED" } });
}

// ---------------------------------------------------------------------------
// Admin stats
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  const [total, published, drafts, scheduled, categories, tags, projects, media] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.post.count({ where: { status: "DRAFT" } }),
    db.post.count({ where: { status: "SCHEDULED" } }),
    db.category.count(),
    db.tag.count(),
    db.project.count({ where: { status: "PUBLISHED" } }),
    db.media.count(),
  ]);

  const totalViews = await db.post.aggregate({ _sum: { viewsCount: true } });

  // last 7 days post views for chart
  const since = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
  const recentViews = await db.postView.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const viewsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    viewsByDay[key] = 0;
  }
  for (const v of recentViews) {
    const key = `${v.createdAt.getFullYear()}-${String(v.createdAt.getMonth() + 1).padStart(2, "0")}-${String(v.createdAt.getDate()).padStart(2, "0")}`;
    if (key in viewsByDay) viewsByDay[key] += 1;
  }

  const recentPosts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { category: { select: { name: true } } },
  });

  return {
    total,
    published,
    drafts,
    scheduled,
    categories,
    tags,
    projects,
    media,
    totalViews: totalViews._sum.viewsCount ?? 0,
    viewsByDay: Object.entries(viewsByDay).map(([date, count]) => ({ date, count })),
    recentPosts,
  };
}
