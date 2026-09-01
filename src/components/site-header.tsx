import Link from "next/link";
import { Settings } from "@/lib/data/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTriggerButton } from "@/components/search-trigger";

const NAV = [
  { label: "وبلاگ", href: "/blog" },
  { label: "پروژه‌ها", href: "/projects" },
  { label: "درباره", href: "/about" },
];

export async function SiteHeader({ settings }: { settings: Settings }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5" aria-label={settings.siteName}>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold transition-transform group-hover:scale-105">
              {"</>"}
            </span>
            <span className="font-mono text-lg font-semibold tracking-tight">
              {settings.logoText}
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          <SearchTriggerButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
