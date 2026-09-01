"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Heading = { id: string; text: string; level: number };

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = React.useState<string>("");

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

  return (
    <nav className="space-y-1 text-sm" aria-label="فهرست مطالب">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        فهرست مطالب
      </p>
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                "block border-r-2 py-1 pr-3 text-muted-foreground transition-colors hover:text-foreground",
                h.level === 3 && "pr-6 text-xs",
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
    </nav>
  );
}
