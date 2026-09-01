"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Trash2, Star, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { formatJalaliShort } from "@/lib/jalali";

type Project = {
  id: string; title: string; slug: string; description: string;
  coverImage: string | null; technologies: string; demoUrl: string | null;
  repoUrl: string | null; featured: boolean; status: string;
  sortOrder: number; createdAt: Date | string;
};

const STATUS_LABEL: Record<string, string> = { PUBLISHED: "منتشرشده", DRAFT: "پیش‌نویس", ARCHIVED: "بایگانی" };

export function ProjectsTable({ initial }: { initial: Project[] }) {
  const [items, setItems] = React.useState(initial);
  const { toast } = useToast();

  const remove = async (id: string) => {
    if (!confirm("حذف شود؟")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((x) => x.id !== id));
    toast({ title: "حذف شد" });
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>پروژه</TableHead>
              <TableHead className="hidden md:table-cell">تکنولوژی‌ها</TableHead>
              <TableHead className="w-24">وضعیت</TableHead>
              <TableHead className="hidden lg:table-cell w-28">تاریخ</TableHead>
              <TableHead className="w-28">لینک‌ها</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((p) => {
              const techs: string[] = (() => { try { return JSON.parse(p.technologies) } catch { return [] } })();
              return (
                <TableRow key={p.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.coverImage} alt={p.title} className="h-10 w-10 shrink-0 rounded-md object-cover" />
                      ) : <div className="h-10 w-10 shrink-0 rounded-md bg-muted" />}
                      <div className="min-w-0">
                        <Link href={`/admin/projects/${p.id}/edit`} className="block truncate font-medium hover:text-primary">{p.title}</Link>
                        {p.featured && <span className="inline-flex items-center gap-0.5 text-xs text-primary"><Star className="h-3 w-3 fill-current" /></span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {techs.slice(0, 3).map((t) => <Badge key={t} variant="secondary" className="font-mono text-xs">{t}</Badge>)}
                      {techs.length > 3 && <span className="text-xs text-muted-foreground">+{techs.length - 3}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={p.status === "PUBLISHED" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatJalaliShort(p.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {p.demoUrl && <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-muted-foreground hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /></a>}
                      {p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="rounded p-1 text-muted-foreground hover:text-foreground"><Github className="h-3.5 w-3.5" /></a>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link href={`/admin/projects/${p.id}/edit`} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></Link>
                      <button onClick={() => remove(p.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">پروژه‌ای ثبت نشده.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
