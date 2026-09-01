"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Loader2,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatJalaliShort } from "@/lib/jalali";
import { cn } from "@/lib/utils";

type CommentItem = {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: string;
  createdAt: string;
  post: { id: string; title: string; slug: string };
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "در انتظار",
  APPROVED: "تأیید شده",
  REJECTED: "رد شده",
};

export function CommentsManager() {
  const [comments, setComments] = React.useState<CommentItem[]>([]);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [filter, setFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?status=${filter}`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(
        (data.comments ?? []).map((c: CommentItem & { createdAt: Date | string }) => ({
          ...c,
          createdAt: String(c.createdAt),
        }))
      );
      setPendingCount(data.pendingCount ?? 0);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast({ variant: "destructive", title: "خطا در به‌روزرسانی" });
      return;
    }
    toast({ title: status === "APPROVED" ? "نظر تأیید شد" : "نظر رد شد" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("این نظر حذف شود؟")) return;
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    toast({ title: "نظر حذف شد" });
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          {pendingCount > 0 ? (
            <span>
              <Badge variant="secondary" className="ml-1 bg-primary/10 text-primary">
                {pendingCount}
              </Badge>
              نظر در انتظار تأیید
            </span>
          ) : (
            <span>همه نظرات بررسی شده‌اند</span>
          )}
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="فیلتر وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
            <SelectItem value="approved">تأیید شده</SelectItem>
            <SelectItem value="rejected">رد شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          نظری یافت نشد.
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <article
              key={c.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{c.authorName}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        c.status === "PENDING" && "border-amber-500/40 text-amber-700 dark:text-amber-400",
                        c.status === "APPROVED" && "border-primary/40 text-primary",
                        c.status === "REJECTED" && "text-muted-foreground"
                      )}
                    >
                      {STATUS_LABEL[c.status] ?? c.status}
                    </Badge>
                  </div>
                  {c.authorEmail && (
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground" dir="ltr">
                      {c.authorEmail}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatJalaliShort(new Date(c.createdAt))}
                    {" · "}
                    <Link
                      href={`/blog/${c.post.slug}`}
                      target="_blank"
                      className="hover:text-foreground hover:underline"
                    >
                      {c.post.title}
                    </Link>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {c.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 text-primary"
                      onClick={() => updateStatus(c.id, "APPROVED")}
                    >
                      <Check className="h-3.5 w-3.5" />
                      تأیید
                    </Button>
                  )}
                  {c.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1"
                      onClick={() => updateStatus(c.id, "REJECTED")}
                    >
                      <X className="h-3.5 w-3.5" />
                      رد
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => remove(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {c.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
