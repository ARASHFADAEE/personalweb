"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Loader2, Save, Eye, Send, Trash2, ImagePlus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { slugify, toPersianDigits } from "@/lib/slug";
import { resolvePostSeo } from "@/lib/post-seo";
import { GooglePreview } from "@/components/admin/google-preview";
import { MediaPickerButton } from "@/components/admin/media-picker-button";
import {
  MdxEditorErrorBoundary,
  PostMdxEditor,
  sanitizeEditorMarkdown,
} from "@/components/admin/post-mdx-editor";

type Category = { id: string; name: string; slug: string };
type Tag = { id: string; name: string; slug: string };

type PostData = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: string;
  featured: boolean;
  publishedAt: string | null;
  categoryId: string | null;
  tagIds: string[];
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  focusKeyword: string;
  robotsNoindex: boolean;
  robotsNofollow: boolean;
};

export function PostEditor({
  initial,
  categories,
  tags,
}: {
  initial: PostData | null;
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const mdxRef = React.useRef<MDXEditorMethods>(null);
  const contentRef = React.useRef(sanitizeEditorMarkdown(initial?.content ?? ""));
  const [editorSession, setEditorSession] = React.useState(0);

  const [data, setData] = React.useState<PostData>(
    initial ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      status: "DRAFT",
      featured: false,
      publishedAt: null,
      categoryId: null,
      tagIds: [],
      seoTitle: "",
      metaDescription: "",
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      focusKeyword: "",
      robotsNoindex: false,
      robotsNofollow: false,
    }
  );
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("content");
  const [contentStats, setContentStats] = React.useState(() => {
    const words = contentRef.current.split(/\s+/).filter(Boolean).length;
    return { words, readingTime: Math.max(1, Math.ceil(words / 200)) };
  });

  const handleContentChange = React.useCallback((md: string) => {
    contentRef.current = md;
    const words = md.split(/\s+/).filter(Boolean).length;
    setContentStats({
      words,
      readingTime: Math.max(1, Math.ceil(words / 200)),
    });
  }, []);

  const getEditorMarkdown = React.useCallback(() => {
    const live = mdxRef.current?.getMarkdown();
    if (typeof live === "string") {
      return sanitizeEditorMarkdown(live);
    }
    return contentRef.current;
  }, []);

  const update = (patch: Partial<PostData>) => setData((prev) => ({ ...prev, ...patch }));

  const onTitleChange = (title: string) => {
    update({ title, slug: initial ? data.slug : slugify(title) });
  };

  const toggleTag = (id: string) => {
    setData((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id) ? prev.tagIds.filter((t) => t !== id) : [...prev.tagIds, id],
    }));
  };

  const readingTime = contentStats.readingTime;
  const editorKey = `${data.id ?? "new"}-${editorSession}`;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const autoSeo = React.useMemo(
    () =>
      resolvePostSeo(
        {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          coverImage: data.coverImage,
          seoTitle: data.seoTitle,
          metaDescription: data.metaDescription,
          canonicalUrl: data.canonicalUrl,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
          focusKeyword: data.focusKeyword,
        },
        siteUrl
      ),
    [data, siteUrl]
  );

  const buildPayload = React.useCallback(
    (overrideStatus?: string) => {
      const content = getEditorMarkdown();
      const seo = resolvePostSeo(
        {
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          coverImage: data.coverImage,
          seoTitle: data.seoTitle,
          metaDescription: data.metaDescription,
          canonicalUrl: data.canonicalUrl,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
          focusKeyword: data.focusKeyword,
        },
        siteUrl
      );
      return {
        ...data,
        content,
        ...seo,
        ...(overrideStatus ? { status: overrideStatus } : {}),
      };
    },
    [data, getEditorMarkdown, siteUrl]
  );

  const save = async (overrideStatus?: string) => {
    if (!data.title.trim()) {
      toast({ variant: "destructive", title: "عنوان الزامی است" });
      return;
    }
    const content = getEditorMarkdown();
    if (!content.trim() && overrideStatus === "PUBLISHED") {
      toast({ variant: "destructive", title: "محتوای مقاله خالی است" });
      return;
    }
    setSaving(true);
    const payload = buildPayload(overrideStatus);
    try {
      const url = data.id ? `/api/admin/posts/${data.id}` : "/api/admin/posts";
      const method = data.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "خطا", description: result.error ?? "ذخیره نشد" });
        return;
      }
      toast({ title: "ذخیره شد", description: "مقاله با موفقیت ذخیره شد" });
      const saved = result.post;
      if (saved) {
        setData((prev) => ({
          ...prev,
          id: saved.id ?? prev.id,
          slug: saved.slug ?? prev.slug,
          seoTitle: saved.seoTitle ?? prev.seoTitle,
          metaDescription: saved.metaDescription ?? prev.metaDescription,
          canonicalUrl: saved.canonicalUrl ?? prev.canonicalUrl,
          ogTitle: saved.ogTitle ?? prev.ogTitle,
          ogDescription: saved.ogDescription ?? prev.ogDescription,
          ogImage: saved.ogImage ?? prev.ogImage,
          focusKeyword: saved.focusKeyword ?? prev.focusKeyword,
        }));
      }
      if (!data.id && result.post?.id) {
        router.push(`/admin/posts/${result.post.id}/edit`);
      }
    } catch {
      toast({ variant: "destructive", title: "خطای شبکه" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!data.id || !confirm("این مقاله حذف شود؟")) return;
    await fetch(`/api/admin/posts/${data.id}`, { method: "DELETE" });
    toast({ title: "حذف شد" });
    router.push("/admin/posts");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">
            {data.id ? "ویرایش مقاله" : "مقاله‌ی جدید"}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data.status === "PUBLISHED" ? "منتشرشده" : data.status === "SCHEDULED" ? "زمان‌بندی‌شده" : "پیش‌نویس"} · {toPersianDigits(readingTime)} دقیقه مطالعه
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.id && (
            <Button variant="ghost" size="sm" onClick={remove} className="gap-1.5 text-destructive">
              <Trash2 className="h-4 w-4" /> حذف
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => save("DRAFT")} disabled={saving} className="gap-1.5">
            <Save className="h-4 w-4" /> پیش‌نویس
          </Button>
          <Button size="sm" onClick={() => save("PUBLISHED")} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            انتشار
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="content">محتوا</TabsTrigger>
          <TabsTrigger value="meta">تنظیمات</TabsTrigger>
          <TabsTrigger value="seo">سئو</TabsTrigger>
        </TabsList>

        {/* CONTENT TAB */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]" dir="ltr">
            {/* Sidebar — physical left; editor content stays RTL */}
            <aside className="space-y-4" dir="rtl">
              <div className="rounded-xl border border-border bg-card p-4">
                <Label>وضعیت</Label>
                <Select value={data.status} onValueChange={(v) => update({ status: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
                    <SelectItem value="PUBLISHED">منتشرشده</SelectItem>
                    <SelectItem value="SCHEDULED">زمان‌بندی‌شده</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-4 flex items-center justify-between">
                  <Label htmlFor="feat">مقاله‌ی برتر</Label>
                  <Switch id="feat" checked={data.featured} onCheckedChange={(c) => update({ featured: Boolean(c) })} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <Label>دسته‌بندی</Label>
                <Select value={data.categoryId ?? "none"} onValueChange={(v) => update({ categoryId: v === "none" ? null : v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— بدون دسته —</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <Label>تگ‌ها</Label>
                <div className="mt-2 flex max-h-44 flex-wrap gap-1.5 overflow-y-auto">
                  {tags.map((t) => {
                    const active = data.tagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`rounded-full border px-2.5 py-1 font-mono text-xs transition-colors ${
                          active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        #{t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <Label>تصویر کاور</Label>
                {data.coverImage ? (
                  <div className="relative mt-2 aspect-[16/9] overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.coverImage} alt="cover" className="h-full w-full object-cover" />
                    <button
                      onClick={() => update({ coverImage: "" })}
                      className="absolute start-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                    >
                      حذف
                    </button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <MediaPickerButton
                      onPick={(url) => update({ coverImage: url })}
                      className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="mt-1.5 text-xs">افزودن کاور</span>
                    </MediaPickerButton>
                  </div>
                )}
              </div>
            </aside>

            <div className="min-w-0 space-y-4" dir="rtl">
              <div>
                <Label htmlFor="title">عنوان</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  placeholder="یک عنوان جذاب و واضح…"
                  className="mt-1.5 text-lg"
                />
              </div>
              <div>
                <Label htmlFor="slug">نشانک (URL)</Label>
                <div className="ltr-field mt-1.5 flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1">
                  <span className="shrink-0 font-mono text-sm text-muted-foreground">/blog/</span>
                  <Input
                    id="slug"
                    dir="ltr"
                    value={data.slug}
                    onChange={(e) => update({ slug: slugify(e.target.value) })}
                    placeholder="my-article"
                    className="border-0 bg-transparent px-0 font-mono shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="excerpt">خلاصه</Label>
                <Textarea
                  id="excerpt"
                  value={data.excerpt}
                  onChange={(e) => update({ excerpt: e.target.value })}
                  placeholder="یک یا دو جمله برای معرفی مقاله…"
                  rows={2}
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">{data.excerpt.length}/400</p>
              </div>

              <div>
                <Label>محتوا</Label>
                <div className="admin-mdx-editor mt-1.5 overflow-hidden rounded-xl border border-border" dir="rtl">
                  <MdxEditorErrorBoundary onRetry={() => setEditorSession((n) => n + 1)}>
                    <PostMdxEditor
                      editorKey={editorKey}
                      editorRef={mdxRef}
                      initialMarkdown={contentRef.current}
                      onMarkdownChange={handleContentChange}
                    />
                  </MdxEditorErrorBoundary>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* META TAB */}
        <TabsContent value="meta" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">اطلاعات انتشار</h3>
              <div>
                <Label htmlFor="pubat">تاریخ انتشار</Label>
                <Input
                  id="pubat"
                  type="datetime-local"
                  dir="ltr"
                  value={data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : ""}
                  onChange={(e) => update({ publishedAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="mt-1.5 text-left"
                />
              </div>
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="noindex">robots: noindex</Label>
                  <Switch id="noindex" checked={data.robotsNoindex} onCheckedChange={(c) => update({ robotsNoindex: Boolean(c) })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="nofollow">robots: nofollow</Label>
                  <Switch id="nofollow" checked={data.robotsNofollow} onCheckedChange={(c) => update({ robotsNofollow: Boolean(c) })} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">خلاصه و خوانش</h3>
              <p className="text-xs text-muted-foreground">
                تعداد کلمات: {toPersianDigits(contentStats.words)}
              </p>
              <p className="text-xs text-muted-foreground">
                زمان مطالعه تقریبی: {toPersianDigits(readingTime)} دقیقه
              </p>
              <div>
                <Label>تصویر کاور</Label>
                <Input
                  dir="ltr"
                  value={data.coverImage}
                  onChange={(e) => update({ coverImage: e.target.value })}
                  placeholder="https://…"
                  className="mt-1.5 text-left"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* SEO TAB */}
        <TabsContent value="seo" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            فیلدهای خالی هنگام ذخیره به‌صورت خودکار از عنوان، خلاصه، نشانک و تصویر کاور پر می‌شوند.
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold">متادیتای اصلی</h3>
                <div>
                  <Label htmlFor="seo-title">عنوان سئو</Label>
                  <Input
                    id="seo-title"
                    value={data.seoTitle}
                    onChange={(e) => update({ seoTitle: e.target.value })}
                    placeholder={autoSeo.seoTitle}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(data.seoTitle || autoSeo.seoTitle).length}/60
                    {!data.seoTitle.trim() && (
                      <span className="ms-2 text-primary">خودکار: {autoSeo.seoTitle}</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label htmlFor="meta-desc">توضیحات متا</Label>
                  <Textarea
                    id="meta-desc"
                    value={data.metaDescription}
                    onChange={(e) => update({ metaDescription: e.target.value })}
                    rows={3}
                    placeholder={autoSeo.metaDescription}
                    className="mt-1.5"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(data.metaDescription || autoSeo.metaDescription).length}/160
                    {!data.metaDescription.trim() && (
                      <span className="ms-2 text-primary">خودکار از خلاصه</span>
                    )}
                  </p>
                </div>
                <div>
                  <Label htmlFor="canon">Canonical URL</Label>
                  <Input
                    id="canon"
                    dir="ltr"
                    value={data.canonicalUrl}
                    onChange={(e) => update({ canonicalUrl: e.target.value })}
                    placeholder={autoSeo.canonicalUrl}
                    className="mt-1.5 text-left"
                  />
                  {!data.canonicalUrl.trim() && (
                    <p className="mt-1 text-xs text-primary">خودکار: {autoSeo.canonicalUrl}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="focus">کلمه‌ی کلیدی</Label>
                  <Input
                    id="focus"
                    value={data.focusKeyword}
                    onChange={(e) => update({ focusKeyword: e.target.value })}
                    placeholder={autoSeo.focusKeyword ?? "از عنوان استخراج می‌شود"}
                    className="mt-1.5"
                  />
                  {!data.focusKeyword.trim() && autoSeo.focusKeyword && (
                    <p className="mt-1 text-xs text-primary">خودکار: {autoSeo.focusKeyword}</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h3 className="text-sm font-semibold">Open Graph</h3>
                <div>
                  <Label htmlFor="og-title">عنوان OG</Label>
                  <Input
                    id="og-title"
                    value={data.ogTitle}
                    onChange={(e) => update({ ogTitle: e.target.value })}
                    placeholder={autoSeo.ogTitle}
                    className="mt-1.5"
                  />
                  {!data.ogTitle.trim() && (
                    <p className="mt-1 text-xs text-primary">خودکار: همان عنوان سئو</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="og-desc">توضیحات OG</Label>
                  <Textarea
                    id="og-desc"
                    value={data.ogDescription}
                    onChange={(e) => update({ ogDescription: e.target.value })}
                    rows={2}
                    placeholder={autoSeo.ogDescription}
                    className="mt-1.5"
                  />
                  {!data.ogDescription.trim() && (
                    <p className="mt-1 text-xs text-primary">خودکار: همان توضیحات متا</p>
                  )}
                </div>
                <div>
                  <Label>تصویر OG</Label>
                  <Input
                    dir="ltr"
                    value={data.ogImage}
                    onChange={(e) => update({ ogImage: e.target.value })}
                    placeholder={autoSeo.ogImage ?? "https://… (1200×630)"}
                    className="mt-1.5 text-left"
                  />
                  {!data.ogImage.trim() && data.coverImage && (
                    <p className="mt-1 text-xs text-primary">خودکار: تصویر کاور</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold flex items-center gap-1.5">
                  <Search className="h-4 w-4 text-primary" />
                  پیش‌نمایش گوگل
                </h3>
                <GooglePreview
                  title={autoSeo.seoTitle}
                  url={autoSeo.canonicalUrl}
                  description={autoSeo.metaDescription}
                />
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="mb-3 text-sm font-semibold">تحلیل سریع سئو</h3>
                <SeoChecklist data={data} autoSeo={autoSeo} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SeoChecklist({
  data,
  autoSeo,
}: {
  data: PostData;
  autoSeo: ReturnType<typeof resolvePostSeo>;
}) {
  const seoTitle = data.seoTitle.trim() || autoSeo.seoTitle;
  const metaDescription = data.metaDescription.trim() || autoSeo.metaDescription;
  const ogImage = data.ogImage.trim() || autoSeo.ogImage;
  const focusKeyword = data.focusKeyword.trim() || autoSeo.focusKeyword;

  const items = [
    { ok: data.title.length >= 10 && data.title.length <= 70, label: "طول عنوان مناسب (۱۰–۷۰)" },
    { ok: seoTitle.length > 0 && seoTitle.length <= 60, label: "عنوان سئو (≤۶۰)" },
    { ok: metaDescription.length >= 50 && metaDescription.length <= 160, label: "توضیحات متا (۵۰–۱۶۰)" },
    { ok: data.slug.length > 0, label: "نشانک (slug) تنظیم‌شده" },
    { ok: !!data.categoryId, label: "دسته‌بندی انتخاب‌شده" },
    { ok: data.tagIds.length > 0, label: "حداقل یک تگ" },
    { ok: !!data.coverImage, label: "تصویر کاور" },
    { ok: !!focusKeyword, label: "کلمه‌ی کلیدی" },
    { ok: !!ogImage, label: "تصویر OG" },
  ];
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${it.ok ? "bg-primary" : "bg-muted-foreground/40"}`} />
          <span className={it.ok ? "" : "text-muted-foreground"}>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}
