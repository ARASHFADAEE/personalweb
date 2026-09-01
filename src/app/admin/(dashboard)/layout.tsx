import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getSettings } from "@/lib/data/settings";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <div dir="rtl" lang="fa" className="admin-panel flex min-h-screen bg-muted/30">
      <AdminSidebar settings={settings} />
      <div className="flex flex-1 flex-col md:mr-64">
        <AdminTopbar user={user} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
