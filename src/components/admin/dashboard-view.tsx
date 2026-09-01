"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  FolderGit2,
  FolderTree,
  Hash,
  Image as ImageIcon,
  LayoutDashboard,
  PenLine,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { DashboardChart } from "@/components/admin/dashboard-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatJalaliShort } from "@/lib/jalali";
import { formatCount, toPersianDigits } from "@/lib/slug";
import { cn } from "@/lib/utils";

type DashboardStats = {
  total: number;
  published: number;
  drafts: number;
  scheduled: number;
  categories: number;
  tags: number;
  projects: number;
  media: number;
  totalViews: number;
  viewsByDay: { date: string; count: number }[];
  recentPosts: {
    id: string;
    title: string;
    status: string;
    createdAt: Date | string;
    category: { name: string } | null;
  }[];
};

type StatCard = {
  label: string;
  value: number;
  icon: LucideIcon;
  href: string;
  accent: "primary" | "success" | "warning" | "muted" | "info";
  featured?: boolean;
};

const ACCENT_STYLES: Record<StatCard["accent"], { icon: string; glow: string; ring: string }> = {
  primary: {
    icon: "bg-primary/12 text-primary group-hover:bg-primary/18",
    glow: "from-primary/20 via-primary/5 to-transparent",
    ring: "group-hover:border-primary/35",
  },
  success: {
    icon: "bg-success/12 text-success group-hover:bg-success/18",
    glow: "from-success/20 via-success/5 to-transparent",
    ring: "group-hover:border-success/35",
  },
  warning: {
    icon: "bg-warning/12 text-warning group-hover:bg-warning/18",
    glow: "from-warning/20 via-warning/5 to-transparent",
    ring: "group-hover:border-warning/35",
  },
  info: {
    icon: "bg-info/12 text-info group-hover:bg-info/18",
    glow: "from-info/20 via-info/5 to-transparent",
    ring: "group-hover:border-info/35",
  },
  muted: {
    icon: "bg-muted text-muted-foreground group-hover:bg-muted/80",
    glow: "from-muted/40 via-transparent to-transparent",
    ring: "group-hover:border-border",
  },
};

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: "منتشرشده",
  DRAFT: "پیش‌نویس",
  SCHEDULED: "زمان‌بندی",
};

const STATUS_BADGE: Record<string, string> = {
  PUBLISHED: "border-success/30 bg-success/10 text-success",
  DRAFT: "border-border bg-muted/50 text-muted-foreground",
  SCHEDULED: "border-warning/30 bg-warning/10 text-warning",
};

const QUICK_ACTIONS = [
  { href: "/admin/posts/new", label: "مقاله جدید", icon: PenLine, primary: true },
  { href: "/admin/posts", label: "مدیریت مقالات", icon: FileText },
  { href: "/admin/media", label: "رسانه‌ها", icon: ImageIcon },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings },
];

export function DashboardView({
  stats,
  authorName,
}: {
  stats: DashboardStats;
  authorName: string;
}) {
  const viewsLast7 = stats.viewsByDay.reduce((sum, d) => sum + d.count, 0);
  const publishRate = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;

  const featuredCards: StatCard[] = [
    { label: "کل مقالات", value: stats.total, icon: FileText, href: "/admin/posts", accent: "primary", featured: true },
    { label: "منتشرشده", value: stats.published, icon: CheckCircle2, href: "/admin/posts?status=PUBLISHED", accent: "success", featured: true },
    { label: "بازدید کل", value: stats.totalViews, icon: Eye, href: "/admin/posts", accent: "info", featured: true },
    { label: "بازدید ۷ روز", value: viewsLast7, icon: TrendingUp, href: "/admin/posts", accent: "primary", featured: true },
  ];

  const secondaryCards: StatCard[] = [
    { label: "پیش‌نویس", value: stats.drafts, icon: PenLine, href: "/admin/posts?status=DRAFT", accent: "muted" },
    { label: "زمان‌بندی‌شده", value: stats.scheduled, icon: Clock, href: "/admin/posts?status=SCHEDULED", accent: "warning" },
    { label: "دسته‌بندی‌ها", value: stats.categories, icon: FolderTree, href: "/admin/categories", accent: "info" },
    { label: "تگ‌ها", value: stats.tags, icon: Hash, href: "/admin/tags", accent: "info" },
    { label: "پروژه‌ها", value: stats.projects, icon: FolderGit2, href: "/admin/projects", accent: "primary" },
    { label: "رسانه‌ها", value: stats.media, icon: ImageIcon, href: "/admin/media", accent: "muted" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Hero */}
      <section
        className="admin-dashboard-hero relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-card via-card to-primary/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-8"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-0 h-56 w-56 rounded-full bg-primary/12 blur-[80px]" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-primary/8 blur-[60px]" />
          <div
            className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Badge variant="outline" className="mb-4 gap-1.5 bg-background/70 py-1 backdrop-blur-sm">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
              پنل مدیریت
            </Badge>
            <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
              سلام، {authorName}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground text-pretty sm:text-base">
              نمای کلی از محتوا، بازدیدها و وضعیت انتشار — همه‌چیز یک‌جا.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <MiniStat label="نرخ انتشار" value={`${toPersianDigits(publishRate)}٪`} />
              <MiniStat label="پیش‌نویس" value={formatCount(stats.drafts)} />
              <MiniStat label="پروژه فعال" value={formatCount(stats.projects)} />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <Button asChild size="lg" className="h-11 gap-2 rounded-xl px-6 shadow-md shadow-primary/15">
              <Link href="/admin/posts/new">
                <PenLine className="h-4 w-4" />
                نوشتن مقاله‌ی جدید
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-xl bg-background/60 backdrop-blur-sm">
              <Link href="/" target="_blank">
                مشاهده سایت
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="admin-dashboard-item flex flex-wrap gap-2" style={{ animationDelay: "80ms" }}>
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              asChild
              variant={action.primary ? "default" : "outline"}
              size="sm"
              className={cn("h-9 gap-1.5 rounded-xl", !action.primary && "bg-background/60 backdrop-blur-sm")}
            >
              <Link href={action.href}>
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </section>

      {/* Featured stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {featuredCards.map((card, index) => (
          <StatCardLink key={card.label} card={card} index={index} large />
        ))}
      </section>

      {/* Secondary stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {secondaryCards.map((card, index) => (
          <StatCardLink key={card.label} card={card} index={index + 4} />
        ))}
      </section>

      {/* Chart + recent */}
      <section className="grid gap-5 lg:grid-cols-12">
        <div
          className="admin-dashboard-item overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-7"
          style={{ animationDelay: "220ms" }}
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
                تحلیل بازدید
              </div>
              <h2 className="text-lg font-bold tracking-tight">بازدیدها — ۷ روز گذشته</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                جمع کل: {formatCount(stats.totalViews)} بازدید در تمام مقالات
              </p>
            </div>
            <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(viewsLast7)} در ۷ روز
            </Badge>
          </div>
          <DashboardChart data={stats.viewsByDay} />
        </div>

        <div
          className="admin-dashboard-item overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-sm lg:col-span-5"
          style={{ animationDelay: "280ms" }}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                فعالیت اخیر
              </div>
              <h2 className="text-lg font-bold tracking-tight">آخرین مقالات</h2>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 rounded-lg text-xs">
              <Link href="/admin/posts">
                همه
                <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {stats.recentPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/60" />
              <p className="mt-3 text-sm text-muted-foreground">هنوز مقاله‌ای ایجاد نشده است.</p>
              <Button asChild size="sm" className="mt-4 rounded-xl">
                <Link href="/admin/posts/new">اولین مقاله را بنویسید</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {stats.recentPosts.map((post, index) => (
                <li
                  key={post.id}
                  className="admin-dashboard-item"
                  style={{ animationDelay: `${320 + index * 60}ms` }}
                >
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-all duration-300 hover:border-border/80 hover:bg-muted/40 hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/80 font-mono text-xs font-bold text-primary/50 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      {toPersianDigits(String(index + 1).padStart(2, "0"))}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                        {post.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        {post.category && <span>{post.category.name}</span>}
                        {post.category && <span aria-hidden>·</span>}
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatJalaliShort(post.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0 text-[11px]", STATUS_BADGE[post.status] ?? STATUS_BADGE.DRAFT)}
                    >
                      {STATUS_LABEL[post.status] ?? post.status}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 px-3.5 py-2 backdrop-blur-sm">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-bold">{value}</p>
    </div>
  );
}

function StatCardLink({
  card,
  index,
  large = false,
}: {
  card: StatCard;
  index: number;
  large?: boolean;
}) {
  const Icon = card.icon;
  const styles = ACCENT_STYLES[card.accent];

  return (
    <Link
      href={card.href}
      className={cn(
        "admin-dashboard-item group relative block overflow-hidden rounded-[1.25rem] border border-border/70 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        styles.ring,
        large ? "p-5" : "p-4"
      )}
      style={{ animationDelay: `${100 + index * 50}ms` }}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          styles.glow
        )}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className={cn("mt-1.5 font-mono font-bold tracking-tight", large ? "text-3xl" : "text-2xl")}>
            {formatCount(card.value)}
          </p>
        </div>
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
            styles.icon,
            large ? "h-12 w-12" : "h-10 w-10"
          )}
        >
          <Icon className={cn(large ? "h-5 w-5" : "h-4 w-4")} />
        </div>
      </div>
      <div className="relative mt-3 flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100">
        مشاهده
        <ArrowLeft className="h-3 w-3" />
      </div>
    </Link>
  );
}
