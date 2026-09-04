"use client";

import * as React from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ChangePasswordForm() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "تغییر رمز ناموفق",
          description: typeof data.error === "string" ? data.error : "خطایی رخ داد",
        });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "رمز عبور با موفقیت تغییر کرد" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <p className="text-sm font-medium">تغییر رمز عبور</p>
        <p className="mt-1 text-sm text-muted-foreground">
          بعد از تغییر رمز، نشست‌های دیگر خارج می‌شوند؛ همین مرورگر وارد می‌ماند.
        </p>
      </div>

      <div>
        <Label htmlFor="current-password" className="text-xs">
          رمز فعلی
        </Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1.5"
          required
        />
      </div>

      <div>
        <Label htmlFor="new-password" className="text-xs">
          رمز جدید
        </Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mt-1.5"
          minLength={8}
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">حداقل ۸ کاراکتر</p>
      </div>

      <div>
        <Label htmlFor="confirm-password" className="text-xs">
          تأیید رمز جدید
        </Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1.5"
          minLength={8}
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          تغییر رمز
        </Button>
      </div>
    </form>
  );
}
