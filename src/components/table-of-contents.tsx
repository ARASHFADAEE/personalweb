"use client";

import * as React from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/slug";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Heading = { id: string; text: string; level: number };

function getSectionNumber(headings: Heading[], index: number) {
  let h2Count = 0;
  for (let i = 0; i <= index; i += 1) {
    if (headings[i].level === 2) h2Count += 1;
  }
  return headings[index].level === 2 ? h2Count : null;
}

function TocList({
  headings,
  activeId,
  numbered = false,
  onNavigate,
}: {
  headings: Heading[];
  activeId: string;
  numbered?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {headings.map((h, index) => {
        const sectionNo = numbered ? getSectionNumber(headings, index) : null;
        return (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={onNavigate}
              className={cn(
                "flex items-start gap-2 border-r-2 py-1.5 pr-3 text-muted-foreground transition-colors hover:text-foreground",
                h.level === 2 && "text-sm font-medium",
                h.level === 3 && "pr-5 text-sm",
                h.level === 4 && "pr-8 text-xs",
                activeId === h.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent"
              )}
            >
              {sectionNo != null && (
                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-primary/70">
                  {toPersianDigits(sectionNo).padStart(2, "۰")}
                </span>
              )}
              <span className="min-w-0">{h.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function TableOfContents({
  headings,
  variant = "sidebar",
  defaultOpen = false,
}: {
  headings: Heading[];
  variant?: "sidebar" | "card";
  defaultOpen?: boolean;
}) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [open, setOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -72% 0px", threshold: [0, 0.25, 1] }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  const closeMobile = () => {
    if (variant === "card") setOpen(false);
  };

  if (variant === "card") {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-2xl border border-border/80 bg-card">
          <CollapsibleTrigger
            className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition-colors hover:bg-muted/40"
            aria-expanded={open}
            aria-controls="mobile-toc-panel"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <ListTree className="h-4 w-4 text-primary" aria-hidden />
              فهرست مطالب
              <span className="font-normal text-muted-foreground">({headings.length})</span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none",
                open && "rotate-180"
              )}
              aria-hidden
            />
          </CollapsibleTrigger>
          <CollapsibleContent id="mobile-toc-panel">
            <nav className="max-h-64 overflow-y-auto border-t border-border/70 px-4 py-3" aria-label="فهرست مطالب">
              <TocList headings={headings} activeId={activeId} onNavigate={closeMobile} />
            </nav>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <nav
      className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm"
      aria-label="فهرست مطالب"
    >
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ListTree className="h-3.5 w-3.5 text-primary" aria-hidden />
        فهرست مطالب
      </p>
      <TocList headings={headings} activeId={activeId} numbered />
    </nav>
  );
}
