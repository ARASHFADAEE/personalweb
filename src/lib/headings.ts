// Extract heading structure from markdown (h2 and h3 only)
export type Heading = { id: string; text: string; level: number };

export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "section"
  );
}

export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n");
  const headings: Heading[] = [];
  const usedSlugs = new Set<string>();

  let inCodeBlock = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const m = /^(#{2,4})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/[#*_`~]/g, "").trim();
    let id = slugifyHeading(text);
    if (usedSlugs.has(id)) {
      let i = 2;
      while (usedSlugs.has(`${id}-${i}`)) i += 1;
      id = `${id}-${i}`;
    }
    usedSlugs.add(id);
    headings.push({ id, text, level });
  }
  return headings;
}

// Adds id attributes to headings in the rendered markdown content
export function addHeadingIds(html: string, headings: Heading[]): string {
  let result = html;
  for (const h of headings) {
    const re = new RegExp(
      `<h${h.level}([^>]*)>([^<]*)</h${h.level}>`,
      "i"
    );
    result = result.replace(re, `<h${h.level}$1 id="${h.id}">$2</h${h.level}>`);
  }
  return result;
}
