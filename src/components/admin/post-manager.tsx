"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Globe,
  Clock,
  PenLine,
  CheckSquare,
  Square,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { formatJalaliShort } from "@/lib/jalali";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Category = { id: string; name: string; slug: string; postsCount: number };
type Tag = { id: string; name: string; slug: string };
type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  viewsCount: number;
  createdAt: Date | string;
  publishedAt: Date | string | null;
  category: { id: string; name: string; slug: string } | null;
  tags: { tag: { id: string; name: string } }[];
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "منتشرشده",
  DRAFT: "پیش‌نویس",
  SCHEDULED: "زمان‌بندی",
};

const STATUS_COLOR: Record<string, string> = {
  PUBLISHED: "bg-primary/10 text-primary",
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function PostManager({
  initialPosts,
  categories,
  tags,
}: {
  initialPosts: Post[];
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = React.useState(false);
  const [posts, setPosts] = React.useState(initialPosts);

  const filtered = React.useMemo(() => {
    return posts.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (search.trim() && !p.title.includes(search.trim()) && !p.slug.includes(search.trim())) return false;
      return true;
    });
  }, [posts, search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const bulkAction = async (action: "publish" | "draft" | "delete") => {
    if (selected.size === 0) return;
    try {
      const res = await fetch("/api/admin/posts/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: [...selected] }),
      });
      if (res.ok) {
        toast({ title: "انجام شد", description: `${selected.size} مقاله به‌روزرسانی شد` });
        if (action === "delete") {
          setPosts((prev) => prev.filter((p) => !selected.has(p.id)));
        } else {
          setPosts((prev) =>
            prev.map((p) =>
              selected.has(p.id)
                ? { ...p, status: action === "publish" ? "PUBLISHED" : "DRAFT", publishedAt: action === "publish" ? new Date().toISOString() : p.publishedAt }
                : p
            )
          );
        }
        setSelected(new Set());
        setBulkOpen(false);
      }
    } catch {
      toast({ variant: "destructive", title: "خطا" });
    }
  };

  const deleteOne = async (id: string) => {
    if (!confirm("این مقاله حذف شود؟")) return;
    try {
      await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "حذف شد" });
    } catch {
      toast({ variant: "destructive", title: "خطا" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی عنوان…" className="pr-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 w-full sm:w-44">
              <Filter className="ms-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">همه‌ی وضعیت‌ها</SelectItem>
              <SelectItem value="PUBLISHED">منتشرشده</SelectItem>
              <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
              <SelectItem value="SCHEDULED">زمان‌بندی‌شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} انتخاب‌شده</span>
            <Button size="sm" variant="outline" onClick={() => bulkAction("publish")}>انتشار</Button>
            <Button size="sm" variant="outline" onClick={() => bulkAction("draft")}>پیش‌نویس</Button>
            <Button size="sm" variant="destructive" onClick={() => bulkAction("delete")}>حذف</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>لغو</Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <button onClick={toggleAll} aria-label="انتخاب همه" className="flex">
                    {selected.size === filtered.length && filtered.length > 0 ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                </TableHead>
                <TableHead>عنوان</TableHead>
                <TableHead className="w-28">وضعیت</TableHead>
                <TableHead className="hidden md:table-cell w-32">دسته</TableHead>
                <TableHead className="hidden lg:table-cell w-24">بازدید</TableHead>
                <TableHead className="hidden lg:table-cell w-32">تاریخ</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    مقاله‌ای یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id} className={cn("group", selected.has(p.id) && "bg-muted/40")}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                        aria-label="انتخاب"
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        className="block max-w-md truncate font-medium hover:text-primary"
                      >
                        {p.title}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">/{p.slug}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("gap-1", STATUS_COLOR[p.status])}>
                        {p.status === "PUBLISHED" ? <Globe className="h-3 w-3" /> : p.status === "SCHEDULED" ? <Clock className="h-3 w-3" /> : <PenLine className="h-3 w-3" />}
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.category ? <span className="text-sm">{p.category.name}</span> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell font-mono text-sm">{p.viewsCount}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {p.publishedAt ? formatJalaliShort(p.publishedAt) : formatJalaliShort(p.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {p.slug && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="مشاهده مقاله"
                              title={
                                p.status === "PUBLISHED"
                                  ? "مشاهده مقاله"
                                  : "مشاهده (اگر منتشر نشده باشد ممکن است در دسترس نباشد)"
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="min-w-44">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/posts/${p.id}/edit`}>
                                <Edit className="ms-2 h-4 w-4" /> ویرایش
                              </Link>
                            </DropdownMenuItem>
                            {p.slug && (
                              <DropdownMenuItem asChild>
                                <Link href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="ms-2 h-4 w-4" /> مشاهده مقاله
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => deleteOne(p.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="ms-2 h-4 w-4" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
