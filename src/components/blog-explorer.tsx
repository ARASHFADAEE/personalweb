"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Loader2, FileSearch, LayoutGrid } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  postsCount: number;
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

export function BlogExplorer({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [category, setCategory] = React.useState(searchParams.get("cat") ?? "all");
  const [sort, setSort] = React.useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = React.useState(Number(searchParams.get("page") ?? 1));
  const [data, setData] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showFilters, setShowFilters] = React.useState(false);

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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
    window.scrollTo({ top: 280, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="space-y-6">
      {/* Sticky toolbar */}
      <div className="sticky top-16 z-30 -mx-4 border-y border-border/60 bg-background/90 px-4 py-4 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75 lg:top-16 lg:mx-0 lg:rounded-2xl lg:border lg:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در عنوان، خلاصه و تگ‌ها…"
              className="h-11 pr-9"
              aria-label="جستجو"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="پاک کردن جستجو"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-11 w-full sm:w-40" aria-label="مرتب‌سازی">
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                <SelectItem value="popular">محبوب‌ترین</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0 gap-2 lg:hidden"
              onClick={() => setShowFilters((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              فیلتر
            </Button>
          </div>
        </div>

        {/* Mobile category chips */}
        <div className={cn("mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden", !showFilters && "hidden")}>
          <CategoryChip active={category === "all"} onClick={() => setCategory("all")} label="همه" count={total} />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              active={category === c.slug}
              onClick={() => setCategory(c.slug)}
              label={c.name}
              count={c.postsCount}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px,1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-44 space-y-2 rounded-2xl border border-border bg-card p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <LayoutGrid className="h-3.5 w-3.5" />
              دسته‌بندی
            </p>
            <CategoryButton active={category === "all"} onClick={() => setCategory("all")} label="همه‌ی مقالات" count={total} />
            {categories.map((c) => (
              <CategoryButton
                key={c.id}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
                label={c.name}
                count={c.postsCount}
              />
            ))}
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {loading ? "در حال بارگذاری…" : (
                <>
                  <span className="font-medium text-foreground">{toFa(total)}</span> مقاله
                  {activeCategory && <> در «{activeCategory.name}»</>}
                  {search && <> برای «{search}»</>}
                </>
              )}
            </p>
            {(search || category !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => { setSearch(""); setCategory("all"); }}
              >
                <X className="h-3.5 w-3.5" /> پاک کردن فیلترها
              </Button>
            )}
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-6 w-full rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                {data.items.map((p, i) => (
                  <ArticleCard key={p.id} post={p} variant="default" priority={i < 2} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
                            className="h-9 w-9 p-0 font-mono"
                            onClick={() => setPage(p)}
                          >
                            {toFa(p)}
                          </Button>
                        </React.Fragment>
                      );
                    })}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    بعدی
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState search={search} onClear={() => { setSearch(""); setCategory("all"); }} />
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active ? "border-primary bg-primary/10 font-medium text-primary" : "border-border text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
      <span className="font-mono text-xs opacity-70">{toFa(count)}</span>
    </button>
  );
}

function CategoryButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
        active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="truncate">{label}</span>
      <span className="font-mono text-xs">{toFa(count)}</span>
    </button>
  );
}

function EmptyState({ search, onClear }: { search: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileSearch className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">مقاله‌ای پیدا نشد</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {search ? `برای «${search}» چیزی پیدا نکردیم.` : "هنوز مقاله‌ای در این دسته‌بندی منتشر نشده است."}
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="mt-5 gap-2">
        <X className="h-4 w-4" /> پاک کردن فیلترها
      </Button>
    </div>
  );
}

function toFa(n: number) {
  return String(n).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}
