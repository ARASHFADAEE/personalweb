"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Hash,
  Folder,
  Home,
  Info,
  Sparkles,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type SearchHit = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category?: { name: string } | null;
};

type SearchContextValue = {
  open: () => void;
};

const SearchContext = React.createContext<SearchContextValue | undefined>(undefined);

export function SearchCommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const go = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/blog/${slug}`);
  };

  return (
    <SearchContext.Provider
      value={{
        open: () => setOpen(true),
      }}
    >
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="جستجوی مقاله، دسته‌بندی یا صفحه…"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "در حال جستجو…" : "نتیجه‌ای یافت نشد."}
          </CommandEmpty>

          {query.trim() && results.length > 0 && (
            <CommandGroup heading="مقالات">
              {results.map((r) => (
                <CommandItem
                  key={r.id}
                  value={`${r.title} ${r.category?.name ?? ""}`}
                  onSelect={() => go(r.slug)}
                  className="gap-3"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{r.title}</span>
                    {r.category?.name && (
                      <span className="text-xs text-muted-foreground">
                        {r.category.name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {!query.trim() && (
            <>
              <CommandGroup heading="صفحات">
                <CommandItem value="خانه" onSelect={() => { setOpen(false); router.push("/"); }}>
                  <Home className="ml-2 h-4 w-4" />
                  خانه
                  <CommandShortcut>↖</CommandShortcut>
                </CommandItem>
                <CommandItem value="وبلاگ" onSelect={() => { setOpen(false); router.push("/blog"); }}>
                  <FileText className="ml-2 h-4 w-4" />
                  وبلاگ
                </CommandItem>
                <CommandItem value="پروژه‌ها" onSelect={() => { setOpen(false); router.push("/projects"); }}>
                  <Sparkles className="ml-2 h-4 w-4" />
                  پروژه‌ها
                </CommandItem>
                <CommandItem value="درباره" onSelect={() => { setOpen(false); router.push("/about"); }}>
                  <Info className="ml-2 h-4 w-4" />
                  درباره‌ی من
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="میانبرها">
                <CommandItem value="جستجو" onSelect={() => {}}>
                  <Search className="ml-2 h-4 w-4" />
                  جستجوی مقالات
                  <CommandShortcut>⌘K</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </SearchContext.Provider>
  );
}

export function useSearchCommand() {
  const ctx = React.useContext(SearchContext);
  if (!ctx) throw new Error("useSearchCommand must be used within SearchCommandProvider");
  return ctx;
}
