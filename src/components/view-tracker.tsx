"use client";

import * as React from "react";

// Fires a one-shot view-track when an article mounts
export function ViewTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    const key = `viewed:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);
  return null;
}
