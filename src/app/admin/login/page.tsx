import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { getSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "ورود به پنل مدیریت",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-mono font-bold">
            {"</>"}
          </div>
          <h1 className="text-xl font-bold">ورود به پنل مدیریت</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{settings.siteName}</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-xs text-muted-foreground">
          برای تست: admin@devnet.local / admin12345
        </p>
      </div>
    </div>
  );
}
