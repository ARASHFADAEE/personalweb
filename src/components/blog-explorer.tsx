"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, Loader2, FileSearch } from "lucide-react";
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

type Post = any;

type Result = {
  items: Post[];
  page: number;
  totalPages: number;
  total: number;
};

export function BlogExplorer({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");
  const [category, setCategory] = React.useState(searchParams.get("cat") ?? "all");
  const [sort, setSort] = React.useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = React.useState(Number(searchParams.get("page") ?? 1));
  const [data, setData] = React.useState<Result | null>(null);
  const [loading, setLoading] = React.useState(true);

  // debounced search
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
        // replace URL (shallow) for shareable state
        const qs = params.toString();
        window.history.replaceState(null, "", `/blog${qs ? `?${qs}` : ""}`);

        const res = await fetch(`/api/posts?${params.toString()}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // initial
  React.useEffect(() => {
    fetchPosts({ search, category, sort, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch on filter changes
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
    window.scrollTo({ top: 200, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="grid gap-8 lg:grid-cols-[220px,1fr]">
      {/* Sidebar filters */}
      <aside className="space-y-4">
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            دسته‌بندی‌ها
          </p>
          <div className="space-y-1">
            <button
              onClick={() => setCategory("all")}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                category === "all"
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              همه‌ی مقالات
              <span className="font-mono text-xs">{total}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                  category === c.slug
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="truncate">{c.name}</span>
                <span className="font-mono text-xs">{c.postsCount}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0">
        {/* toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در مقالات…"
              className="pr-9"
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
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="h-10 w-full sm:w-44" aria-label="مرتب‌سازی">
              <SelectValue placeholder="مرتب‌سازی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
              <SelectItem value="popular">محبوب‌ترین</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin ml-2" /> در حال بارگذاری…
          </div>
        ) : data && data.items.length > 0 ? (
          <>
            <p className="mb-5 text-sm text-muted-foreground">
              {total} مقاله یافت شد
            </p>
            <div className="grid gap-x-6 gap-y-2">
              {data.items.map((p) => (
                <ArticleCard key={p.id} post={p} variant="list" />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
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
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
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
        {search
          ? `برای «${search}» چیزی پیدا نکردیم. عبارت دیگری را امتحان کنید.`
          : "هنوز مقاله‌ای در این دسته‌بندی منتشر نشده است."}
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
