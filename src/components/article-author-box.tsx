import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ArticleAuthorBox({
  name,
  bio,
  avatarUrl,
}: {
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
}) {
  const initials = name.slice(0, 2);

  return (
    <aside className="article-author-box mt-10 rounded-2xl border border-border/80 bg-card p-6" aria-label="درباره نویسنده">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">درباره نویسنده</p>
          <h2 className="mt-1 text-lg font-bold">{name}</h2>
          {bio && (
            <p className="mt-2 text-sm leading-7 text-muted-foreground text-pretty">{bio}</p>
          )}
          <Button asChild variant="outline" size="sm" className="mt-4 h-9 gap-1.5 rounded-xl">
            <Link href="/about">
              مشاهده پروفایل
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
