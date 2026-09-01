"use client";

import * as React from "react";
import { Check, Share2, Twitter, Linkedin, Link as LinkIcon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function ShareButtons({ title }: { title: string; slug?: string }) {
  const [url, setUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encoded = encodeURIComponent(shareUrl);
  const encTitle = encodeURIComponent(title);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "لینک کپی شد" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast({ variant: "destructive", title: "کپی نشد" });
    }
  };

  const nativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        /* user cancelled or unsupported */
      }
    }
    await copyLink();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">اشتراک‌گذاری</span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 rounded-xl lg:hidden"
        onClick={nativeShare}
        aria-label="اشتراک‌گذاری"
      >
        <Share2 className="h-3.5 w-3.5" />
        اشتراک
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="hidden h-9 gap-1.5 rounded-xl lg:inline-flex"
        aria-label="کپی لینک"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <LinkIcon className="h-3.5 w-3.5" />}
        {copied ? "کپی شد" : "کپی لینک"}
      </Button>

      <a
        href={`https://t.me/share/url?url=${encoded}&text=${encTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اشتراک در تلگرام"
        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
      >
        <TelegramIcon className="h-4 w-4" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${encTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اشتراک در ایکس"
        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
      >
        <Twitter className="h-4 w-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="اشتراک در لینکدین"
        className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
      >
        <Linkedin className="h-4 w-4" />
      </a>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="h-9 gap-1.5 rounded-xl lg:hidden"
        aria-label="کپی لینک"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Send className="h-3.5 w-3.5" />}
        {copied ? "کپی شد" : "کپی لینک"}
      </Button>
    </div>
  );
}
