"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { Loader2, Save, Send, Trash2, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { plainTextFromMarkdown, slugify } from "@/lib/slug";
import { MediaPickerButton } from "@/components/admin/media-picker-button";
import { PublishSuccessModal } from "@/components/admin/publish-success-modal";
import {
  MdxEditorErrorBoundary,
  PostMdxEditor,
  sanitizeEditorMarkdown,
} from "@/components/admin/post-mdx-editor";

type ProjectData = {
  id?: string; title: string; slug: string; description: string; content: string;
  coverImage: string; technologies: string[]; demoUrl: string; repoUrl: string;
  featured: boolean; status: string; sortOrder: number;
};

export function ProjectEditor({ initial }: { initial: ProjectData | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const descriptionRef = React.useRef<MDXEditorMethods>(null);
  const descriptionContentRef = React.useRef(sanitizeEditorMarkdown(initial?.description ?? ""));
  const [descriptionSession, setDescriptionSession] = React.useState(0);

  const [data, setData] = React.useState<ProjectData>(initial ?? {
    title: "", slug: "", description: "", content: "", coverImage: "",
    technologies: [], demoUrl: "", repoUrl: "", featured: false, status: "PUBLISHED", sortOrder: 0,
  });
  const [techInput, setTechInput] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [publishSuccessOpen, setPublishSuccessOpen] = React.useState(false);
  const pendingRedirectRef = React.useRef<string | null>(null);

  const update = (patch: Partial<ProjectData>) => setData((p) => ({ ...p, ...patch }));

  const getDescriptionMarkdown = React.useCallback(() => {
    const live = descriptionRef.current?.getMarkdown();
    if (typeof live === "string") {
      return sanitizeEditorMarkdown(live);
    }
    return descriptionContentRef.current;
  }, []);

  const addTech = () => {
    const t = techInput.trim();
    if (t && !data.technologies.includes(t)) {
      update({ technologies: [...data.technologies, t] });
      setTechInput("");
    }
  };
  const removeTech = (t: string) => update({ technologies: data.technologies.filter((x) => x !== t) });

  const save = async (status?: string) => {
    const description = getDescriptionMarkdown();
    if (!data.title.trim() || !plainTextFromMarkdown(description, 10_000).trim()) {
      toast({ variant: "destructive", title: "عنوان و توضیحات الزامی است" });
      return;
    }
    setSaving(true);
    const payload = {
      ...data,
      description,
      slug: slugify(data.slug) || slugify(data.title),
      ...(status ? { status } : {}),
    };
    try {
      const url = data.id ? `/api/admin/projects/${data.id}` : "/api/admin/projects";
      const method = data.id ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: result.error ?? "خطا" });
        return;
      }

      const saved = result.project;
      const isPublish = status === "PUBLISHED";

      if (isPublish) {
        pendingRedirectRef.current =
          !data.id && saved?.id ? `/admin/projects/${saved.id}/edit` : null;
        setPublishSuccessOpen(true);
      } else {
        toast({ title: "ذخیره شد" });
      }

      if (saved) {
        setData((prev) => ({
          ...prev,
          id: saved.id ?? prev.id,
          slug: saved.slug ?? prev.slug,
          description: saved.description ?? description,
          status: isPublish ? "PUBLISHED" : prev.status,
        }));
        descriptionContentRef.current = saved.description ?? description;
      } else if (isPublish) {
        update({ status: "PUBLISHED", description });
        descriptionContentRef.current = description;
      }

      if (!isPublish && !data.id && saved?.id) {
        router.push(`/admin/projects/${saved.id}/edit`);
      }
    } catch {
      toast({ variant: "destructive", title: "خطای شبکه" });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishSuccessClose = () => {
    setPublishSuccessOpen(false);
    const redirect = pendingRedirectRef.current;
    pendingRedirectRef.current = null;
    if (redirect) router.push(redirect);
  };

  const remove = async () => {
    if (!data.id || !confirm("حذف شود؟")) return;
    await fetch(`/api/admin/projects/${data.id}`, { method: "DELETE" });
    toast({ title: "حذف شد" });
    router.push("/admin/projects");
    router.refresh();
  };

  const descriptionEditorKey = `${data.id ?? "new"}-desc-${descriptionSession}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{data.id ? "ویرایش پروژه" : "پروژه‌ی جدید"}</h1>
        <div className="flex gap-2">
          {data.id && <Button variant="ghost" size="sm" onClick={remove} className="gap-1.5 text-destructive"><Trash2 className="h-4 w-4" /> حذف</Button>}
          <Button variant="outline" size="sm" onClick={() => save()} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره
          </Button>
          <Button size="sm" onClick={() => save("PUBLISHED")} disabled={saving} className="gap-1.5">
            <Send className="h-4 w-4" /> انتشار
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان</Label>
            <Input id="title" value={data.title} onChange={(e) => update({ title: e.target.value, slug: initial ? data.slug : slugify(e.target.value) })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="slug">نشانک</Label>
            <div className="ltr-field mt-1.5 flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1">
              <span className="shrink-0 font-mono text-sm text-muted-foreground">/projects/</span>
              <Input id="slug" dir="ltr" value={data.slug} onChange={(e) => update({ slug: slugify(e.target.value) })} className="border-0 bg-transparent px-0 font-mono shadow-none focus-visible:ring-0" />
            </div>
          </div>
          <div>
            <Label htmlFor="desc">توضیحات کوتاه</Label>
            <div className="admin-mdx-editor mt-1.5 overflow-hidden rounded-xl border border-border" dir="rtl">
              <MdxEditorErrorBoundary onRetry={() => setDescriptionSession((n) => n + 1)}>
                <PostMdxEditor
                  editorKey={descriptionEditorKey}
                  editorRef={descriptionRef}
                  initialMarkdown={descriptionContentRef.current}
                  onMarkdownChange={(md) => {
                    descriptionContentRef.current = md;
                  }}
                  variant="compact"
                />
              </MdxEditorErrorBoundary>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              از **پررنگ**، *کج*، لیست و لینک پشتیبانی می‌شود.
            </p>
          </div>
          <div>
            <Label htmlFor="content">محتوای کامل (Markdown)</Label>
            <Textarea id="content" value={data.content} onChange={(e) => update({ content: e.target.value })} rows={12} className="mt-1.5 font-mono text-sm" dir="rtl" />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">اطلاعات</h3>
            <div>
              <Label>وضعیت</Label>
              <Select value={data.status} onValueChange={(v) => update({ status: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLISHED">منتشرشده</SelectItem>
                  <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
                  <SelectItem value="ARCHIVED">بایگانی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="feat">پروژه‌ی برتر</Label>
              <Switch id="feat" checked={data.featured} onCheckedChange={(c) => update({ featured: Boolean(c) })} />
            </div>
            <div>
              <Label htmlFor="order">ترتیب</Label>
              <Input id="order" type="number" value={data.sortOrder} onChange={(e) => update({ sortOrder: Number(e.target.value) })} className="mt-1.5 font-mono text-left" dir="ltr" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">تکنولوژی‌ها</h3>
            <div className="flex gap-1.5">
              <Input value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(); } }} placeholder="مثلاً: Next.js" />
              <Button type="button" size="icon" onClick={addTech}><Plus className="h-4 w-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.technologies.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 bg-muted font-mono">
                  {t}
                  <button onClick={() => removeTech(t)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">لینک‌ها</h3>
            <div>
              <Label>دمو</Label>
              <Input dir="ltr" value={data.demoUrl} onChange={(e) => update({ demoUrl: e.target.value })} placeholder="https://" className="mt-1.5 text-left" />
            </div>
            <div>
              <Label>مخزن</Label>
              <Input dir="ltr" value={data.repoUrl} onChange={(e) => update({ repoUrl: e.target.value })} placeholder="https://github.com/…" className="mt-1.5 text-left" />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">تصویر کاور</h3>
            {data.coverImage ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={data.coverImage} alt="cover" className="h-full w-full object-cover" />
                <button onClick={() => update({ coverImage: "" })} className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80">حذف</button>
              </div>
            ) : (
              <MediaPickerButton onPick={(url) => update({ coverImage: url })} className="flex h-24 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-muted">
                <Plus className="h-6 w-6" />
                <span className="mt-1.5 text-xs">افزودن کاور</span>
              </MediaPickerButton>
            )}
          </div>
        </aside>
      </div>

      <PublishSuccessModal
        open={publishSuccessOpen}
        onClose={handlePublishSuccessClose}
        title="پروژه منتشر شد!"
        description="پروژه با موفقیت منتشر شد و اکنون در سایت قابل مشاهده است."
        duration={5}
      />
    </div>
  );
}
