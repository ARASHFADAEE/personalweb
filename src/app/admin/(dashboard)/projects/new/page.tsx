import type { Metadata } from "next";
import { ProjectEditor } from "@/components/admin/project-editor";

export const metadata: Metadata = { title: "پروژه‌ی جدید", robots: { index: false } };

export default async function NewProjectPage() {
  return <ProjectEditor initial={null} />;
}
