export type ProjectRecord = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  technologies: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  featured?: boolean;
};

export function parseProjectTechnologies(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((t): t is string => typeof t === "string") : [];
  } catch {
    return [];
  }
}

export function collectProjectStats(projects: ProjectRecord[]) {
  const techSet = new Set<string>();
  let withDemo = 0;
  let withRepo = 0;
  let featured = 0;

  for (const p of projects) {
    if (p.featured) featured += 1;
    if (p.demoUrl) withDemo += 1;
    if (p.repoUrl) withRepo += 1;
    parseProjectTechnologies(p.technologies).forEach((t) => techSet.add(t));
  }

  return {
    total: projects.length,
    featured,
    withDemo,
    withRepo,
    techCount: techSet.size,
    topTech: [...techSet].slice(0, 8),
  };
}
