"use client";

import * as React from "react";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useSearchCommand } from "@/components/search-command-provider";

type User = { id: string; name: string; email: string; role: string };

export function AdminTopbar({ user }: { user: User }) {
  const { open } = useSearchCommand();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-lg md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => document.dispatchEvent(new Event("toggle-admin-sidebar"))}>
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          سلام، <span className="font-medium text-foreground">{user.name}</span> 👋
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={open} className="h-9 gap-2">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">جستجو</span>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
