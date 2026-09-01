import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="mr-2 text-sm text-muted-foreground">در حال بارگذاری…</span>
    </div>
  );
}
