import type { Metadata } from "next";
import { db } from "@/lib/db";
import { MediaLibrary } from "@/components/admin/media-library";

export const metadata: Metadata = { title: "رسانه‌ها", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const items = await db.media.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">رسانه‌ها</h1>
        <p className="mt-1 text-sm text-muted-foreground">{items.length} فایل در مجموع</p>
      </div>
      <MediaLibrary initial={items} />
    </div>
  );
}
