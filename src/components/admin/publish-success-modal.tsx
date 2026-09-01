"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/lib/slug";
import { cn } from "@/lib/utils";

const RING_RADIUS = 36;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type PublishSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  duration?: number;
};

export function PublishSuccessModal({
  open,
  onClose,
  title = "منتشر شد!",
  description = "مقاله با موفقیت منتشر شد و اکنون در سایت قابل مشاهده است.",
  duration = 5,
}: PublishSuccessModalProps) {
  const [remaining, setRemaining] = React.useState(duration);
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    setRemaining(duration);
    const showTimer = window.setTimeout(() => setVisible(true), 10);

    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          onCloseRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearInterval(interval);
    };
  }, [open, duration]);

  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!mounted || !open) return null;

  const progress = ((duration - remaining) / duration) * 100;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="publish-success-title"
    >
      <button
        type="button"
        className="publish-success-backdrop absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={() => onCloseRef.current()}
        aria-label="بستن"
      />

      <div
        className={cn(
          "publish-success-card relative w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/15 bg-background/70 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-500 ease-out",
          visible ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0"
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-primary/10" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border/60 bg-background/60 backdrop-blur-sm hover:bg-background/80"
          onClick={() => onCloseRef.current()}
          aria-label="بستن"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 h-24 w-24 -rotate-90" viewBox="0 0 80 80" aria-hidden>
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/25"
            />
            <circle
              cx="40"
              cy="40"
              r={RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              className="text-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
            />
          </svg>
          <div className="publish-success-icon flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
        </div>

        <h2 id="publish-success-title" className="relative text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>
        <p className="relative mt-2 text-sm leading-7 text-muted-foreground text-pretty">{description}</p>

        <p className="relative mt-5 font-mono text-xs text-muted-foreground">
          بسته شدن خودکار تا{" "}
          <span className="font-semibold text-foreground">{toPersianDigits(remaining)}</span>{" "}
          ثانیه
        </p>

        <Button type="button" className="relative mt-6 rounded-xl px-8" onClick={() => onCloseRef.current()}>
          متوجه شدم
        </Button>
      </div>
    </div>,
    document.body
  );
}
