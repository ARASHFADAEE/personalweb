"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  FileSearch,
  LayoutGrid,
  List,
  Sparkles,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/slug";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postsCount: number;
  color?: string | null;
};

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  readingTime: number;
  viewsCount: number;
  category?: { name: string; slug: string; color?: string | null } | null;
  author?: { name: string } | null;
};

type Result = {
  items: Post[];
  page: number;
  totalPages: number;
  total: number;
};

type ViewMode = "magazine" | "grid";

export function BlogExplorer({
  categories,
  totalPosts,
}: {
  categories: Category[];
  totalPosts: number;
}) {
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [category, setCategory] = React.useState(searchParams.get("cat") ?? "all");
  const [sort, setSort] = React.useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = React.useState(Number(searchParams.get("page") ?? 1));
  const [view, setView] = React.useState<ViewMode>("magazine");
  const [data, setData] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(true);

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const railRef = React.useRef<HTMLDivElement>(null);

  const fetchPosts = React.useCallback(
    async (opts: { search: string; category: string; sort: string; page: number }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts.search) params.set("q", opts.search);
        if (opts.category && opts.category !== "all") params.set("cat", opts.category);
        if (opts.sort) params.set("sort", opts.sort);
        params.set("page", String(opts.page));
        const qs = params.toString();
        window.history.replaceState(null, "", `/blog${qs ? `?${qs}` : ""}`);

        const res = await fetch(`/api/posts?${params.toString()}`);
        if (res.ok) setData(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    []
  );

  React.useEffect(() => {
    fetchPosts({ search, category, sort, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPosts({ search, category, sort, page: 1 });
    }, 280);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  React.useEffect(() => {
    fetchPosts({ search, category, sort, page });
    const el = document.getElementById("articles");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const total = data?.total ?? totalPosts;
  const totalPages = data?.totalPages ?? 1;
  const activeCategory = categories.find((c) => c.slug === category);
  const hasFilters = Boolean(search) || category !== "all";

  const scrollRail = (dir: "left" | "right") => {
    railRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            مرور مقالات
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">همه‌ی نوشته‌ها</h2>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1">
          <ViewButton active={view === "magazine"} onClick={() => setView("magazine")} label="مجله‌ای" icon={<List className="h-4 w-4" />} />
          <ViewButton active={view === "grid"} onClick={() => setView("grid")} label="شبکه‌ای" icon={<LayoutGrid className="h-4 w-4" />} />
        </div>
      </div>

      {/* Sticky explorer bar */}
      <div className="sticky top-16 z-30 -mx-4 space-y-4 border-y border-border/60 bg-background/92 px-4 py-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78 lg:top-16 lg:mx-0 lg:rounded-[1.25rem] lg:border lg:px-5 lg:shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان، خلاصه، تگ و دسته…"
              className="h-12 rounded-xl border-border/80 bg-card/80 pr-10 text-base shadow-none focus-visible:ring-primary/30"
              aria-label="جستجو"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="پاک کردن جستجو"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-12 w-full rounded-xl border-border/80 bg-card/80 lg:w-44" aria-label="مرتب‌سازی">
              <ArrowUpDown className="ms-1 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="مرتب‌سازی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
              <SelectItem value="popular">محبوب‌ترین</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category rail */}
        <div className="relative">
          <button
            type="button"
            onClick={() => scrollRail("right")}
            className="absolute -right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 shadow-sm lg:flex"
            aria-label="اسکرول دسته‌بندی"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollRail("left")}
            className="absolute -left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 shadow-sm lg:flex"
            aria-label="اسکرول دسته‌بندی"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            ref={railRef}
            className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <CategoryPill active={category === "all"} onClick={() => setCategory("all")} label="همه" count={totalPosts} />
            {categories.map((c) => (
              <CategoryPill
                key={c.id}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
                label={c.name}
                count={c.postsCount}
                color={c.color}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Results */}
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                "در حال بارگذاری…"
              ) : (
                <>
                  <span className="font-semibold text-foreground">{formatCount(total)}</span> مقاله
                  {activeCategory && <> در «{activeCategory.name}»</>}
                  {search && <> برای «{search}»</>}
                </>
              )}
            </p>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                <X className="h-3.5 w-3.5" />
                پاک کردن فیلترها
              </Button>
            )}
          </div>

          {loading ? (
            <LoadingSkeleton view={view} />
          ) : data && data.items.length > 0 ? (
            <>
              {view === "magazine" ? (
                <div className="space-y-5">
                  {data.items.map((p, i) => (
                    <div key={p.id} className="blog-card-enter" style={{ animationDelay: `${i * 60}ms` }}>
                      <ArticleCard
                        post={p}
                        variant={i === 0 && page === 1 && !hasFilters ? "editorial" : "list"}
                        index={i + 1 + (page - 1) * 9}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  {data.items.map((p, i) => (
                    <div
                      key={p.id}
                      className={cn("blog-card-enter", i === 0 && page === 1 && !hasFilters && "sm:col-span-2")}
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <ArticleCard
                        post={p}
                        variant={i === 0 && page === 1 && !hasFilters ? "bento-hero" : "default"}
                        priority={i < 2}
                      />
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          ) : (
            <EmptyState search={search} onClear={() => { setSearch(""); setCategory("all"); }} />
          )}
        </div>

        {/* Desktop sidebar — topics */}
        <aside className="hidden xl:block">
          <div className="sticky top-52 space-y-4">
            <div className="rounded-[1.25rem] border border-border bg-card p-5 shadow-sm">
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5" />
                موضوعات
              </p>
              <div className="space-y-2">
                <SidebarCategory
                  active={category === "all"}
                  onClick={() => setCategory("all")}
                  label="همه‌ی مقالات"
                  count={totalPosts}
                />
                {categories.map((c) => (
                  <SidebarCategory
                    key={c.id}
                    active={category === c.slug}
                    onClick={() => setCategory(c.slug)}
                    label={c.name}
                    description={c.description}
                    count={c.postsCount}
                    color={c.color}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-dashed border-primary/25 bg-primary/5 p-5">
              <p className="text-sm font-semibold">نکته‌ی خواندن</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                نمای «مجله‌ای» برای مطالعه‌ی راحت‌تر و «شبکه‌ای» برای مرور سریع تصاویر طراحی شده.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-all",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/80 bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
      )}
    >
      {color && (
        <span
          className={cn("h-2 w-2 rounded-full", !active && "opacity-80")}
          style={{ backgroundColor: categoryColorValue(color) }}
        />
      )}
      <span className="font-medium">{label}</span>
      <span className={cn("font-mono text-xs", active ? "text-primary-foreground/80" : "opacity-70")}>
        {formatCount(count)}
      </span>
    </button>
  );
}

function SidebarCategory({
  active,
  onClick,
  label,
  description,
  count,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  description?: string | null;
  count: number;
  color?: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-start transition-all",
        active
          ? "border-primary/40 bg-primary/10"
          : "border-transparent hover:border-border hover:bg-muted/50"
      )}
    >
      {color && (
        <span
          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: categoryColorValue(color) }}
        />
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-sm font-medium", active && "text-primary")}>{label}</span>
        {description && (
          <span className="mt-0.5 line-clamp-2 block text-xs leading-5 text-muted-foreground">{description}</span>
        )}
      </span>
      <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatCount(count)}</span>
    </button>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        قبلی
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
        .map((p, i, arr) => {
          const prev = arr[i - 1];
          return (
            <React.Fragment key={p}>
              {prev && p - prev > 1 && <span className="px-1 text-muted-foreground">…</span>}
              <Button
                variant={page === p ? "default" : "outline"}
                size="sm"
                className="h-9 w-9 rounded-xl p-0 font-mono"
                onClick={() => onPageChange(p)}
              >
                {formatCount(p)}
              </Button>
            </React.Fragment>
          );
        })}
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      >
        بعدی
      </Button>
    </div>
  );
}

function LoadingSkeleton({ view }: { view: ViewMode }) {
  if (view === "grid") {
    return (
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
            <div className="aspect-[16/10] bg-muted" />
            <div className="space-y-3 p-5">
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-6 w-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-[220px,1fr]">
            <div className="aspect-[16/10] rounded-xl bg-muted sm:min-h-[160px]" />
            <div className="space-y-3 py-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-7 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="blog-empty flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border bg-muted/15 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <FileSearch className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-xl font-bold">مقاله‌ای پیدا نشد</h3>
      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
        {search ? `برای «${search}» نتیجه‌ای نداریم. عبارت دیگری امتحان کن یا فیلترها را پاک کن.` : "هنوز مقاله‌ای در این دسته‌بندی منتشر نشده."}
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="mt-6 gap-2 rounded-xl">
        <X className="h-4 w-4" />
        پاک کردن فیلترها
      </Button>
    </div>
  );
}

const CATEGORY_PALETTE: Record<string, string> = {
  emerald: "#10b981",
  blue: "#3b82f6",
  violet: "#8b5cf6",
  amber: "#f59e0b",
  rose: "#f43f5e",
  cyan: "#06b6d4",
  orange: "#f97316",
  lime: "#84cc16",
};

function categoryColorValue(token?: string | null) {
  if (!token) return "var(--primary)";
  if (token.startsWith("#") || token.startsWith("oklch")) return token;
  return CATEGORY_PALETTE[token] ?? "var(--primary)";
}
