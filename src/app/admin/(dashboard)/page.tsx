import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  Eye,
  FolderTree,
  Hash,
  FolderGit2,
  Image as ImageIcon,
  PenLine,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { getDashboardStats } from "@/lib/data/posts";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/slug";
import { formatJalali, formatJalaliShort } from "@/lib/jalali";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "کل مقالات", value: stats.total, icon: FileText, color: "text-primary", href: "/admin/posts" },
    { label: "منتشرشده", value: stats.published, icon: CheckCircle2, color: "text-success", href: "/admin/posts?status=PUBLISHED" },
    { label: "پیش‌نویس", value: stats.drafts, icon: PenLine, color: "text-muted-foreground", href: "/admin/posts?status=DRAFT" },
    { label: "زمان‌بندی‌شده", value: stats.scheduled, icon: Clock, color: "text-warning", href: "/admin/posts?status=SCHEDULED" },
    { label: "دسته‌بندی‌ها", value: stats.categories, icon: FolderTree, color: "text-info", href: "/admin/categories" },
    { label: "تگ‌ها", value: stats.tags, icon: Hash, color: "text-info", href: "/admin/tags" },
    { label: "پروژه‌ها", value: stats.projects, icon: FolderGit2, color: "text-primary", href: "/admin/projects" },
    { label: "رسانه‌ها", value: stats.media, icon: ImageIcon, color: "text-muted-foreground", href: "/admin/media" },
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">داشبورد</h1>
          <p className="mt-1 text-sm text-muted-foreground">نمای کلی از وضعیت وبلاگ</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/posts/new">
            <PenLine className="h-4 w-4" />
            نوشتن مقاله‌ی جدید
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} href={c.href}>
              <Card className="group flex items-center justify-between p-4 transition-colors hover:border-primary/40">
                <div>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                  <p className="mt-1.5 font-mono text-2xl font-bold">{formatCount(c.value)}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Views + recent */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">بازدیدها — ۷ روز گذشته</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">جمع: {formatCount(stats.totalViews)} بازدید کل</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              {formatCount(stats.viewsByDay.reduce((s, d) => s + d.count, 0))} در ۷ روز
            </Badge>
          </div>
          <DashboardChart data={stats.viewsByDay} />
        </Card>

        <Card className="p-5 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">آخرین مقالات</h2>
            <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
              <Link href="/admin/posts">همه</Link>
            </Button>
          </div>
          <ul className="space-y-1">
            {stats.recentPosts.length === 0 && (
              <li className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                هنوز مقاله‌ای ایجاد نشده است.
              </li>
            )}
            {stats.recentPosts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/posts/${p.id}/edit`}
                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      {p.category && <span>{p.category.name}</span>}
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatJalaliShort(p.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {p.status === "PUBLISHED" ? "منتشرشده" : p.status === "DRAFT" ? "پیش‌نویس" : "زمان‌بندی"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
