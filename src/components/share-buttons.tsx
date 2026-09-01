"use client";

import * as React from "react";
import { Check, Twitter, Linkedin, Mail, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [url, setUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast({ title: "لینک کپی شد", description: "در کلیپ‌بورد ذخیره شد" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ variant: "destructive", title: "کپی نشد" });
    }
  };

  const encoded = typeof window !== "undefined" ? encodeURIComponent(window.location.href) : "";
  const encTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">اشتراک‌گذاری:</span>
      <Button variant="outline" size="sm" onClick={copyLink} className="h-8 gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <LinkIcon className="h-3.5 w-3.5" />}
        {copied ? "کپی شد" : "کپی لینک"}
      </Button>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اشتراک در ایکس"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Twitter className="h-3.5 w-3.5" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اشتراک در لینکدین"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Linkedin className="h-3.5 w-3.5" />
      </a>
      <a
        href={`mailto:?subject=${encTitle}&body=${encoded}`}
        aria-label="اشتراک با ایمیل"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Mail className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
