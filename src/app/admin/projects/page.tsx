import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProjectsTable } from "@/components/admin/projects-table";

export const metadata: Metadata = { title: "پروژه‌ها", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await db.project.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">پروژه‌ها</h1>
          <p className="mt-1 text-sm text-muted-foreground">{projects.length} پروژه در مجموع</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/projects/new"><Plus className="h-4 w-4" /> پروژه‌ی جدید</Link>
        </Button>
      </div>
      <ProjectsTable initial={projects} />
    </div>
  );
}
