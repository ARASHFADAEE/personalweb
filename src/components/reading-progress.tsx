"use client";

import * as React from "react";

export function ReadingProgress({ targetId = "article-content" }: { targetId?: string }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = target.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = window.scrollY - (target.offsetTop - 96);
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      setProgress(pct);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-150 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
