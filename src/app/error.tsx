"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-5xl font-bold text-destructive">۵۰۰</p>
      <h1 className="mt-4 text-xl font-bold">خطایی رخ داد</h1>
      <p className="mt-2 max-w-md text-balance text-sm text-muted-foreground text-pretty">
        مشکلی پیش آمد. می‌توانید دوباره تلاش کنید یا به خانه برگردید.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" /> تلاش مجدد
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/"><Home className="h-4 w-4" /> خانه</Link>
        </Button>
      </div>
    </div>
  );
}
