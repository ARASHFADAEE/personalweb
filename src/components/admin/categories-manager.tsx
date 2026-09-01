"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, FolderTree } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { slugify, toPersianDigits } from "@/lib/slug";

type Item = {
  id: string; name: string; slug: string;
  description: string | null; color: string | null;
  seoTitle: string | null; metaDescription: string | null;
  postsCount: number;
};

export function CategoriesManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const { toast } = useToast();
  const [form, setForm] = React.useState({ name: "", slug: "", description: "", color: "", seoTitle: "", metaDescription: "" });

  const reset = () => { setForm({ name: "", slug: "", description: "", color: "", seoTitle: "", metaDescription: "" }); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) { toast({ variant: "destructive", title: "نام الزامی است" }); return; }
    const payload = { ...form, slug: form.slug ? slugify(form.slug) : slugify(form.name) };
    try {
      if (editing) {
        const res = await fetch(`/api/admin/categories/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) { toast({ variant: "destructive", title: data.error }); return; }
        setItems((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));
        toast({ title: "به‌روزرسانی شد" });
      } else {
        const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) { toast({ variant: "destructive", title: data.error }); return; }
        setItems((prev) => [...prev, { ...data.category, postsCount: 0 }]);
        toast({ title: "ساخته شد" });
      }
      setOpen(false);
      reset();
    } catch { toast({ variant: "destructive", title: "خطا" }); }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف شود؟ مقالات این دسته بدون دسته می‌مانند.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "حذف شد" });
  };

  const startEdit = (item: Item) => {
    setEditing(item);
    setForm({ name: item.name, slug: item.slug, description: item.description ?? "", color: item.color ?? "", seoTitle: item.seoTitle ?? "", metaDescription: item.metaDescription ?? "" });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { reset(); setOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" /> دسته‌ی جدید
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <div key={c.id} className="group flex flex-col rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderTree className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">{c.name}</h3>
                  <p className="font-mono text-xs text-muted-foreground">/{c.slug}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => startEdit(c)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(c.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground text-pretty">{c.description}</p>}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{toPersianDigits(c.postsCount)} مقاله</span>
              {c.color && <span className="font-mono">{c.color}</span>}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
            هنوز دسته‌ای ایجاد نشده.
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "ویرایش دسته" : "دسته‌ی جدید"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="c-name">نام</Label>
                <Input id="c-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} />
              </div>
              <div>
                <Label htmlFor="c-slug">نشانک</Label>
                <Input id="c-slug" dir="ltr" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} className="font-mono text-left" />
              </div>
            </div>
            <div>
              <Label htmlFor="c-desc">توضیحات</Label>
              <Textarea id="c-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} />
            </div>
            <div>
              <Label htmlFor="c-seot">عنوان سئو</Label>
              <Input id="c-seot" value={form.seoTitle} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="c-seod">توضیحات متا</Label>
              <Textarea id="c-seod" value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild><Button variant="ghost">انصراف</Button></DialogClose>
              <Button onClick={save}>ذخیره</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
