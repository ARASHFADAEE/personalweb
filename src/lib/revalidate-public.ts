import { revalidatePath } from "next/cache";

/** Bust ISR cache for public project pages after admin changes. */
export function revalidateProjectPages(slug?: string) {
  revalidatePath("/projects");
  revalidatePath("/");
  if (slug) revalidatePath(`/projects/${slug}`);
}
