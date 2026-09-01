import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProjectEditor } from "@/components/admin/project-editor";

export const metadata: Metadata = { title: "ویرایش پروژه", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await db.project.findUnique({ where: { id } });
  if (!project) notFound();
  const techs: string[] = (() => { try { return JSON.parse(project.technologies) } catch { return [] } })();
  const initial = {
    id: project.id, title: project.title, slug: project.slug, description: project.description,
    content: project.content ?? "", coverImage: project.coverImage ?? "", technologies: techs,
    demoUrl: project.demoUrl ?? "", repoUrl: project.repoUrl ?? "", featured: project.featured,
    status: project.status, sortOrder: project.sortOrder,
  };
  return <ProjectEditor initial={initial} />;
}
