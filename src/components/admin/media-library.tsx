"use client";

import * as React from "react";
import { Upload, Trash2, Copy, Check, Search, Loader2, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Media = {
  id: string; url: string; originalName: string;
  altText: string | null; caption: string | null;
  mimeType: string; size: number;
  width: number | null; height: number | null; createdAt: string;
};

function fmtSize(b: number): string {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
}

export function MediaLibrary({ initial }: { initial: Media[] }) {
  const [items, setItems] = React.useState(initial);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Media | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    for (const f of Array.from(files)) formData.append("files", f);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "آپلود شد", description: `${files.length} فایل` });
        // refresh
        const r = await fetch("/api/admin/media");
        const d = await r.json();
        setItems(d.items ?? items);
      } else {
        toast({ variant: "destructive", title: data.error ?? "خطا" });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (m: Media) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/media/${m.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== m.id));
    if (selected?.id === m.id) setSelected(null);
    toast({ title: "حذف شد" });
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 1800);
      toast({ title: "کپی شد" });
    } catch {}
  };

  const updateMeta = async (m: Media, field: "altText" | "caption", value: string) => {
    await fetch(`/api/admin/media/${m.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
    setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, [field]: value } : x)));
    setSelected((s) => (s && s.id === m.id ? { ...s, [field]: value } : s));
  };

  const filtered = items.filter((i) => (search ? i.originalName.includes(search) : true));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,320px]">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="جستجوی فایل…" className="pr-9" />
          </div>
          <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2 shrink-0">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            آپلود
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <p className="mt-2 text-sm">رسانه‌ای موجود نیست. فایل آپلود کنید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {filtered.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-colors",
                  selected?.id === m.id ? "border-primary" : "border-border hover:border-primary/40"
                )}
                title={m.originalName}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.altText ?? m.originalName} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="truncate text-left text-[10px] text-white">{m.originalName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <aside className="space-y-4">
        {selected ? (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selected.url} alt={selected.altText ?? selected.originalName} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium">{selected.originalName}</span>
                <button onClick={() => remove(selected)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
              <dl className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                <div><dt className="inline">نوع:</dt> <dd className="inline font-mono">{selected.mimeType}</dd></div>
                <div><dt className="inline">حجم:</dt> <dd className="inline">{fmtSize(selected.size)}</dd></div>
                {selected.width && <div><dt className="inline">سایز:</dt> <dd className="inline">{selected.width}×{selected.height}</dd></div>}
              </dl>
            </div>
            <div>
              <label className="text-xs font-medium">URL</label>
              <div className="mt-1 flex items-center gap-1.5">
                <Input dir="ltr" readOnly value={selected.url} className="text-left font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={() => copyUrl(selected.url)} className="shrink-0">
                  {copied === selected.url ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">متن جایگزین (alt)</label>
              <Input value={selected.altText ?? ""} onChange={(e) => updateMeta(selected, "altText", e.target.value)} placeholder="توضیح تصویر…" className="mt-1 text-sm" />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            یک تصویر را برای مشاهده‌ی جزئیات انتخاب کنید.
          </div>
        )}
      </aside>
    </div>
  );
}
