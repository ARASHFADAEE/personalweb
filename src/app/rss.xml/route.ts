import { db } from "@/lib/db";
import { publishedIndexableWhere } from "@/lib/data/posts";
import { getSettings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  const baseUrl = getSiteUrl();
  const settings = await getSettings();

  const posts = await db.post.findMany({
    where: publishedIndexableWhere(),
    orderBy: { publishedAt: "desc" },
    take: 30,
    include: { category: true, author: { select: { name: true } } },
  });

  const items = posts
    .map((p) => {
      const url = `${baseUrl}/blog/${p.slug}`;
      const date = (p.publishedAt ?? new Date()).toISOString();
      return `    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${date}</pubDate>
      <description>${escape(p.excerpt ?? "")}</description>
      <dc:creator>${escape(p.author.name)}</dc:creator>
      ${p.category ? `<category>${escape(p.category.name)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(settings.siteName)}</title>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape(settings.siteDescription)}</description>
    <language>fa-IR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>dev.net — Next.js blog</generator>
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
