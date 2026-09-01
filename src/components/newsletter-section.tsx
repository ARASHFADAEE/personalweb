"use client";

import * as React from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Settings } from "@/lib/data/settings";

export function NewsletterSection({ settings }: { settings: Settings }) {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("ایمیل معتبر وارد کنید.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("ثبت شد! از خبرنامه باخبر خواهی شد.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "خطا رخ داد.");
      }
    } catch {
      setStatus("error");
      setMessage("ارتباط برقرار نشد.");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 lg:p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Mail className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-bold">خبرنامه‌ی دِو‌نت</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground text-pretty">
        هفته‌ای یک‌بار، جدیدترین مقالات و تجربه‌های توسعه را مستقیم در ایمیلتان دریافت کنید.
        بدون اسپم — هر زمان خواستید لغو کنید.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Input
          type="email"
          inputMode="email"
          dir="ltr"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
          placeholder="email@example.com"
          className="text-left"
          aria-label="ایمیل"
          required
        />
        <Button type="submit" disabled={status === "loading"} className="w-full gap-2">
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> در حال ثبت…</>
          ) : (
            "عضویت در خبرنامه"
          )}
        </Button>
      </form>
      {status === "success" && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" /> {message}
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-destructive">{message}</p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        {settings.authorName} · {settings.socialEmail}
      </p>
    </div>
  );
}
