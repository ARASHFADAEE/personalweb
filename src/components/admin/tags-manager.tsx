"use client";

import * as React from "react";
import { Pencil, Trash2, Plus, Hash, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { slugify, toPersianDigits } from "@/lib/slug";
import { cn } from "@/lib/utils";

type Item = { id: string; name: string; slug: string; postsCount: number };

export function TagsManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const { toast } = useToast();

  const add = async () => {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/admin/tags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim() }) });
      const data = await res.json();
      if (!res.ok) { toast({ variant: "destructive", title: data.error }); return; }
      setItems((prev) => [...prev, { ...data.tag, postsCount: 0 }]);
      setName("");
      toast({ title: "تگ ساخته شد" });
    } catch { toast({ variant: "destructive", title: "خطا" }); }
  };

  const startEdit = (item: Item) => { setEditingId(item.id); setEditName(item.name); };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const res = await fetch(`/api/admin/tags/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: editName.trim(), slug: slugify(editName.trim()) }) });
    const data = await res.json();
    if (!res.ok) { toast({ variant: "destructive", title: data.error }); return; }
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, name: data.tag.name, slug: data.tag.slug } : x)));
    setEditingId(null);
    toast({ title: "به‌روزرسانی شد" });
  };

  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "حذف شد" });
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="نام تگ (مثلاً: Next.js)"
          className="max-w-sm"
        />
        <Button onClick={add} className="gap-2"><Plus className="h-4 w-4" /> افزودن</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز تگی ایجاد نشده.</p>
        ) : (
          items.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pr-3 pl-1.5 text-sm",
                editingId === t.id && "border-primary"
              )}
            >
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              {editingId === t.id ? (
                <>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(t.id); if (e.key === "Escape") setEditingId(null); }}
                    className="w-24 bg-transparent text-sm outline-none"
                  />
                  <button onClick={() => saveEdit(t.id)} className="rounded px-1 text-xs text-primary hover:bg-primary/10">ذخیره</button>
                </>
              ) : (
                <>
                  <span className="font-medium">{t.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{toPersianDigits(t.postsCount)}</span>
                  <div className="opacity-0 transition-opacity group-hover:opacity-100 flex items-center">
                    <button onClick={() => startEdit(t)} className="rounded p-0.5 text-muted-foreground hover:text-foreground"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => remove(t.id)} className="rounded p-0.5 text-muted-foreground hover:text-destructive"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
