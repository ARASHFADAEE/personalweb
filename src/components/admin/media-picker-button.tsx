"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Media = {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
  mimeType: string;
  width: number | null;
  height: number | null;
};

export function MediaPickerButton({
  onPick,
  className,
  children,
}: {
  onPick: (url: string, media?: Media) => void;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [items, setItems] = React.useState<Media[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) load();
  }, [open, load]);

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    for (const f of Array.from(files)) formData.append("files", f);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        toast({ title: "آپلود شد" });
        await load();
      } else {
        toast({ variant: "destructive", title: "آپلود ناموفق" });
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const filtered = items.filter((i) => (search ? i.originalName.includes(search) : true));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={cn("text-sm", className)} onClick={() => setOpen(true)}>
          {children}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>انتخاب از رسانه‌ها</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input placeholder="جستجو…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2 shrink-0">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            آپلود
          </Button>
          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => onUpload(e.target.files)} />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <p className="mt-2 text-sm">رسانه‌ای موجود نیست. ابتدا یک تصویر آپلود کنید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {filtered.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { onPick(m.url, m); setOpen(false); }}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-primary"
                  title={m.originalName}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.altText ?? m.originalName} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
