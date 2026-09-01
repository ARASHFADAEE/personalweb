"use client";

import * as React from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatJalaliShort } from "@/lib/jalali";
import { toPersianDigits } from "@/lib/slug";
import { cn } from "@/lib/utils";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export function ArticleComments({ slug }: { slug: string }) {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [authorName, setAuthorName] = React.useState("");
  const [authorEmail, setAuthorEmail] = React.useState("");
  const [content, setContent] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const { toast } = useToast();

  const loadComments = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data.comments ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          content: content.trim(),
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: data.error ?? "خطا در ثبت نظر" });
        return;
      }

      setContent("");
      setWebsite("");
      toast({
        title: "نظر ثبت شد",
        description: data.message ?? "پس از تأیید نمایش داده می‌شود.",
      });
    } catch {
      toast({ variant: "destructive", title: "خطا در ارسال نظر" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12 border-t border-border pt-10" id="comments">
      <div className="mb-6 flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">
          نظرات
          {total > 0 && (
            <span className="mr-2 text-base font-normal text-muted-foreground">
              ({toPersianDigits(total)})
            </span>
          )}
        </h2>
      </div>

      <form
        onSubmit={submit}
        className="mb-8 rounded-2xl border border-border/80 bg-muted/20 p-5 sm:p-6"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          نظر خود را بنویسید. پس از بررسی، در همین صفحه نمایش داده می‌شود.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="comment-name" className="text-xs">
              نام *
            </Label>
            <Input
              id="comment-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="نام شما"
              required
              maxLength={80}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="comment-email" className="text-xs">
              ایمیل (اختیاری)
            </Label>
            <Input
              id="comment-email"
              type="email"
              dir="ltr"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1.5 text-left"
            />
          </div>
        </div>

        {/* Honeypot — hidden from users */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden
        />

        <div className="mt-4">
          <Label htmlFor="comment-content" className="text-xs">
            متن نظر *
          </Label>
          <Textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="نظر خود را بنویسید…"
            required
            minLength={3}
            maxLength={2000}
            rows={4}
            className="mt-1.5 resize-y"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            ارسال نظر
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          در حال بارگذاری نظرات…
        </div>
      ) : comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          هنوز نظری ثبت نشده. اولین نفر باشید!
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className={cn(
                "rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5"
              )}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold">{comment.authorName}</span>
                <time
                  dateTime={comment.createdAt}
                  className="text-xs text-muted-foreground"
                >
                  {formatJalaliShort(new Date(comment.createdAt))}
                </time>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
