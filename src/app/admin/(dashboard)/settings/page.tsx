import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = { title: "تنظیمات", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تنظیمات سایت</h1>
        <p className="mt-1 text-sm text-muted-foreground">پیکربندی برند، نویسنده و سئو</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
