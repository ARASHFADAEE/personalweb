"use client";

import Link from "next/link";
import { LayoutDashboard, Pencil } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";

function isStaff(user: { role: string } | null) {
  return user?.role === "ADMIN" || user?.role === "EDITOR";
}

export function AdminPanelLink() {
  const { user, loading } = useAuth();
  if (loading || !isStaff(user)) return null;

  return (
    <Button asChild size="sm" variant="outline" className="h-9 gap-1.5 px-2.5 sm:px-3">
      <Link href="/admin">
        <LayoutDashboard className="h-4 w-4" />
        <span className="hidden sm:inline">پنل مدیریت</span>
        <span className="sr-only sm:hidden">پنل مدیریت</span>
      </Link>
    </Button>
  );
}

export function AdminEditPostLink({ postId, title }: { postId: string; title: string }) {
  const { user, loading } = useAuth();
  if (loading || !isStaff(user)) return null;

  return (
    <Button
      asChild
      size="sm"
      variant="secondary"
      className="fixed bottom-5 left-5 z-50 h-10 gap-2 rounded-full border border-border/80 bg-background/95 px-4 shadow-lg backdrop-blur-sm sm:bottom-6 sm:left-6"
    >
      <Link href={`/admin/posts/${postId}/edit`} aria-label={`ویرایش مقاله: ${title}`}>
        <Pencil className="h-4 w-4" />
        <span className="hidden sm:inline">ویرایش سریع</span>
        <span className="sm:hidden">ویرایش</span>
      </Link>
    </Button>
  );
}
