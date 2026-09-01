"use client";

import * as React from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Heading = { id: string; text: string; level: number };

function TocList({
  headings,
  activeId,
}: {
  headings: Heading[];
  activeId: string;
}) {
  return (
    <ul className="space-y-0.5">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            className={cn(
              "block border-r-2 py-1.5 pr-3 text-muted-foreground transition-colors hover:text-foreground",
              h.level === 2 && "text-sm font-medium",
              h.level === 3 && "pr-5 text-sm",
              h.level === 4 && "pr-8 text-xs",
              activeId === h.id
                ? "border-primary font-medium text-foreground"
                : "border-transparent"
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({
  headings,
  variant = "sidebar",
}: {
  headings: Heading[];
  variant?: "sidebar" | "card";
}) {
  const [activeId, setActiveId] = React.useState<string>("");
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 1] }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  if (variant === "card") {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-2xl border border-border/80 bg-muted/30">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-right transition-colors hover:bg-muted/40">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <ListTree className="h-4 w-4 text-primary" />
              فهرست مطالب
              <span className="font-normal text-muted-foreground">
                ({headings.length} بخش)
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <nav
              className="border-t border-border/70 px-4 py-3"
              aria-label="فهرست مطالب"
            >
              <TocList headings={headings} activeId={activeId} />
            </nav>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <nav
      className="rounded-2xl border border-border/70 bg-card/60 p-4 text-sm backdrop-blur-sm"
      aria-label="فهرست مطالب"
    >
      <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ListTree className="h-3.5 w-3.5 text-primary" />
        فهرست مطالب
      </p>
      <TocList headings={headings} activeId={activeId} />
    </nav>
  );
}
