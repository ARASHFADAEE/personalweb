"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Hash,
  Image as ImageIcon,
  MessageSquare,
  FolderGit2,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import type { Settings as SiteSettings } from "@/lib/data/settings";

const NAV = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "مقالات", icon: FileText },
  { href: "/admin/comments", label: "نظرات", icon: MessageSquare },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { href: "/admin/tags", label: "تگ‌ها", icon: Hash },
  { href: "/admin/media", label: "رسانه‌ها", icon: ImageIcon },
  { href: "/admin/projects", label: "پروژه‌ها", icon: FolderGit2 },
  { href: "/admin/settings", label: "تنظیمات", icon: Settings },
];

export function AdminSidebar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { signOut } = useAuth();

  React.useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    document.addEventListener("toggle-admin-sidebar", onToggle);
    return () => document.removeEventListener("toggle-admin-sidebar", onToggle);
  }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-sidebar-border bg-sidebar transition-transform md:translate-x-0",
          open ? "translate-x-0" : "translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold">
              {"</>"}
            </span>
            <span className="font-mono text-sm font-semibold">{settings.logoText}</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="ناوبری مدیریت">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            مشاهده سایت
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            خروج
          </button>
        </div>
      </aside>
    </>
  );
}
