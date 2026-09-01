"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@/lib/data/settings";

export function SettingsForm({ initial }: { initial: Settings }) {
  const [data, setData] = React.useState<Settings>(initial);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();
  const update = (patch: Partial<Settings>) => setData((p) => ({ ...p, ...patch }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) toast({ title: "تنظیمات ذخیره شد" });
      else toast({ variant: "destructive", title: "خطا" });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">عمومی</TabsTrigger>
          <TabsTrigger value="author">نویسنده</TabsTrigger>
          <TabsTrigger value="seo">سئو</TabsTrigger>
          <TabsTrigger value="analytics">تحلیل</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <Field label="نام سایت"><Input value={data.siteName} onChange={(e) => update({ siteName: e.target.value })} /></Field>
            <Field label="متن لوگو"><Input value={data.logoText} onChange={(e) => update({ logoText: e.target.value })} className="font-mono text-left" dir="ltr" /></Field>
            <Field label="توضیحات سایت"><Textarea value={data.siteDescription} onChange={(e) => update({ siteDescription: e.target.value })} rows={3} /></Field>
            <Field label="متن فوتر"><Input value={data.footerNote} onChange={(e) => update({ footerNote: e.target.value })} /></Field>
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="nl">خبرنامه فعال</Label>
              <Switch id="nl" checked={data.newsletterEnabled} onCheckedChange={(c) => update({ newsletterEnabled: Boolean(c) })} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="author" className="space-y-4">
          <Card>
            <Field label="نام نویسنده"><Input value={data.authorName} onChange={(e) => update({ authorName: e.target.value })} /></Field>
            <Field label="بیوگرافی"><Textarea value={data.authorBio} onChange={(e) => update({ authorBio: e.target.value })} rows={4} /></Field>
            <Field label="آواتار (URL)"><Input dir="ltr" value={data.authorAvatar} onChange={(e) => update({ authorAvatar: e.target.value })} className="text-left" placeholder="https://…" /></Field>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <Field label="گیت‌هاب"><Input dir="ltr" value={data.socialGithub} onChange={(e) => update({ socialGithub: e.target.value })} className="text-left" placeholder="https://github.com/…" /></Field>
              <Field label="لینکدین"><Input dir="ltr" value={data.socialLinkedin} onChange={(e) => update({ socialLinkedin: e.target.value })} className="text-left" placeholder="https://linkedin.com/…" /></Field>
              <Field label="ایکس (توییتر)"><Input dir="ltr" value={data.socialX} onChange={(e) => update({ socialX: e.target.value })} className="text-left" /></Field>
              <Field label="ایمیل"><Input dir="ltr" value={data.socialEmail} onChange={(e) => update({ socialEmail: e.target.value })} className="text-left" /></Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card>
            <Field label="عنوان سئو پیش‌فرض"><Input value={data.defaultSeoTitle} onChange={(e) => update({ defaultSeoTitle: e.target.value })} /></Field>
            <Field label="توضیحات متا پیش‌فرض"><Textarea value={data.defaultSeoDescription} onChange={(e) => update({ defaultSeoDescription: e.target.value })} rows={2} /></Field>
            <Field label="تصویر OG پیش‌فرض"><Input dir="ltr" value={data.defaultOgImage} onChange={(e) => update({ defaultOgImage: e.target.value })} className="text-left" placeholder="https://…" /></Field>
            <Field label="کد تأیید گوگل (Google Search Console)"><Input dir="ltr" value={data.googleVerification} onChange={(e) => update({ googleVerification: e.target.value })} className="text-left" placeholder="google-site-verification=…" /></Field>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                در حال حاضر هیچ سرویس آنالیتیکس متصل نیست. زیرساخت برای اضافه‌کردن Plausible، Umami یا Google Analytics آماده است.
              </p>
              <Field label="پروایدر"><Input dir="ltr" value={data.analyticsProvider} onChange={(e) => update({ analyticsProvider: e.target.value })} className="text-left" placeholder="plausible | umami | ga" /></Field>
              <Field label="اسکریپت"><Textarea dir="ltr" value={data.analyticsScript} onChange={(e) => update({ analyticsScript: e.target.value })} rows={3} className="text-left font-mono text-xs" placeholder="<script defer src=...></script>" /></Field>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          ذخیره‌ی تنظیمات
        </Button>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4 rounded-xl border border-border bg-card p-5">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
