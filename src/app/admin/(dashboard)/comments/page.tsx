import { CommentsManager } from "@/components/admin/comments-manager";

export default function AdminCommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">نظرات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          بررسی، تأیید و مدیریت نظرات مقالات
        </p>
      </div>
      <CommentsManager />
    </div>
  );
}
