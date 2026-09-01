"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchCommand } from "@/components/search-command-provider";
import { cn } from "@/lib/utils";

export function SearchTriggerButton({ className }: { className?: string }) {
  const { open } = useSearchCommand();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={open}
      className={cn(
        "group h-9 gap-2 border-border/60 bg-muted/40 px-3 text-muted-foreground hover:bg-muted",
        className
      )}
      aria-label="جستجو (⌘K)"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline text-sm">جستجو</span>
      <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </Button>
  );
}
