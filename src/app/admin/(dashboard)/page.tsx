import type { Metadata } from "next";
import { getDashboardStats } from "@/lib/data/posts";
import { getSettings } from "@/lib/data/settings";
import { DashboardView } from "@/components/admin/dashboard-view";

export const metadata: Metadata = {
  title: "داشبورد مدیریت",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, settings] = await Promise.all([getDashboardStats(), getSettings()]);

  return (
    <DashboardView stats={stats} authorName={settings.authorName} />
  );
}
