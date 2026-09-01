/**
 * Import posts from a Virgool RSS feed into the local blog database.
 * Downloads all images locally — no external source URLs kept.
 * Run: npm run db:import-virgool
 */

import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const prisma = new PrismaClient();

const FEED_URL = "https://virgool.io/feed/@m_28031645";
const CATEGORY_SLUG = "virgool";
const CATEGORY_NAME = "ویرگول";
const AUTHOR_NAME = "آرش فدایی";
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const imageCache = new Map<string, string>();

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

function slugify(input: string): string {
  if (!input) return "";
  const map: Record<string, string> = {
    ا: "a", آ: "a", ب: "b", پ: "p", ت: "t", ث: "th",
    ج: "j", چ: "ch", ح: "h", خ: "kh", د: "d", ذ: "z",
    ر: "r", ز: "z", ژ: "zh", س: "s", ش: "sh", ص: "s",
    ض: "z", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f",
    ق: "gh", ک: "k", گ: "g", ل: "l", م: "m", ن: "n",
    و: "v", ه: "h", ی: "y",
    " ": "-", _: "-",
  };

  const mapped = input
    .trim()
    .toLowerCase()
    .replace(/[\u0621-\u064A\u067E\u0686\u0698\u06AF]/g, (c) => map[c] ?? c);

  return mapped
    .replace(/[^a-z0-9\u0621-\u064A\u067E\u0686\u0698\u06AF-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readingTime(content: string): number {
  const words = content
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function excerptFromContent(content: string, length = 160): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`~\-\[\]\(\)!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= length) return plain;
  return plain.slice(0, length).trim() + "…";
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&zwnj;/g, "\u200c")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function cleanImageUrl(url: string): string {
  return url.split("?")[0].split("#")[0];
}

function isRemoteImageUrl(url: string): boolean {
  if (!url || url.startsWith("/uploads/")) return false;
  return /^https?:\/\//i.test(url) && (
    /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(url) ||
    url.includes("files.virgool.io") ||
    url.includes("static.virgool.io/upload")
  );
}

function mimeFromExt(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    svg: "image/svg+xml",
  };
  return map[ext.toLowerCase()] ?? "image/png";
}

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function downloadImage(remoteUrl: string, prefix: string): Promise<string | null> {
  const clean = cleanImageUrl(remoteUrl);
  if (!isRemoteImageUrl(clean)) return clean.startsWith("/") ? clean : null;

  const cached = imageCache.get(clean);
  if (cached) return cached;

  try {
    const res = await fetch(clean, {
      headers: { "User-Agent": "DevNetBlogImporter/1.0" },
    });
    if (!res.ok) {
      console.warn(`   ⚠ Image download failed (${res.status}): ${clean}`);
      return null;
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) return null;

    const contentType = res.headers.get("content-type") ?? "";
    let ext = "png";
    if (contentType.includes("jpeg")) ext = "jpg";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("gif")) ext = "gif";
    else if (contentType.includes("svg")) ext = "svg";
    else {
      const fromUrl = clean.split(".").pop()?.toLowerCase();
      if (fromUrl && ["png", "jpg", "jpeg", "webp", "gif", "avif", "svg"].includes(fromUrl)) {
        ext = fromUrl === "jpeg" ? "jpg" : fromUrl;
      }
    }

    const hash = crypto.createHash("sha256").update(clean).digest("hex").slice(0, 20);
    const safePrefix = prefix.replace(/[^a-z0-9-]/gi, "").slice(0, 24) || "import";
    const filename = `${safePrefix}-${hash}.${ext}`;
    const fullPath = path.join(UPLOAD_DIR, filename);

    if (!existsSync(fullPath)) {
      await ensureUploadDir();
      await writeFile(fullPath, buf);
    }

    const localUrl = `/uploads/${filename}`;
    imageCache.set(clean, localUrl);

    const existingMedia = await prisma.media.findFirst({ where: { url: localUrl } });
    if (!existingMedia) {
      await prisma.media.create({
        data: {
          filename,
          originalName: path.basename(new URL(clean).pathname) || filename,
          url: localUrl,
          mimeType: mimeFromExt(ext),
          size: buf.length,
        },
      });
    }

    return localUrl;
  } catch (err) {
    console.warn(`   ⚠ Image download error: ${clean}`, err);
    return null;
  }
}

async function localizeImages(content: string, prefix: string): Promise<string> {
  let result = content;
  const urls = new Set<string>();

  for (const m of content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    if (isRemoteImageUrl(m[1])) urls.add(cleanImageUrl(m[1]));
  }

  for (const m of content.matchAll(/https?:\/\/[^\s)\]"'<>]+/g)) {
    const url = cleanImageUrl(m[0]);
    if (isRemoteImageUrl(url)) urls.add(url);
  }

  for (const url of urls) {
    const local = await downloadImage(url, prefix);
    if (!local) continue;

    const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(escaped, "g"), local);
    result = result.replace(new RegExp(escaped.replace(/\//g, "\\/"), "g"), local);
  }

  return result;
}

async function localizeCoverImage(url: string | null, prefix: string): Promise<string | null> {
  if (!url) return null;
  if (!isRemoteImageUrl(url)) return url.startsWith("/") ? url : null;
  return downloadImage(url, `${prefix}-cover`);
}

// ---------------------------------------------------------------------------
// RSS parsing
// ---------------------------------------------------------------------------

type RssItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
};

function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");
    if (title && link) {
      items.push({ title, link, pubDate, description });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const cdata = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i").exec(xml);
  if (cdata) return cdata[1].trim();

  const plain = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i").exec(xml);
  if (!plain) return "";
  return decodeHtmlEntities(plain[1].trim());
}

// ---------------------------------------------------------------------------
// Virgool page scraping → Markdown
// ---------------------------------------------------------------------------

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`property="${property}" content="([^"]+)"`, "i"),
    new RegExp(`name="${property}" content="([^"]+)"`, "i"),
  ];
  for (const re of patterns) {
    const m = re.exec(html);
    if (m) return m[1];
  }
  return null;
}

function virgoolSlugFromUrl(url: string, title: string): string {
  const path = decodeURIComponent(new URL(url).pathname);
  const last = path.split("/").pop() || "";
  const idMatch = last.match(/([a-z0-9]{10,})$/i);
  const id = idMatch?.[1] ?? "";
  const base = last.replace(/-[a-z0-9]{10,}$/i, "").replace(/^-+|-+$/g, "");

  if (base && /^[a-z0-9-]+$/i.test(base)) {
    return base.slice(0, 80);
  }

  const fromTitle = slugify(title);
  if (fromTitle && id) return `${fromTitle}-${id}`.slice(0, 80);
  if (fromTitle) return fromTitle;
  return id || slugify(title) || "post";
}

function inlineHtmlToMarkdown(html: string): string {
  let text = html;

  text = text.replace(
    /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi,
    (_, src, alt) => `![${decodeHtmlEntities(alt || "تصویر")}](${cleanImageUrl(src)})`
  );
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");
  text = text.replace(
    /<code[^>]*>([\s\S]*?)<\/code>/gi,
    (_, code) => `\`${decodeHtmlEntities(code.replace(/<[^>]+>/g, "")).trim()}\``
  );
  text = text.replace(
    /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href, label) => {
      const t = decodeHtmlEntities(label.replace(/<[^>]+>/g, "").trim());
      return `[${t}](${href})`;
    }
  );
  text = decodeHtmlEntities(text.replace(/<[^>]+>/g, ""));
  return text.replace(/\s+\n/g, "\n").trim();
}

function listToMarkdown(html: string, ordered: boolean): string {
  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  let index = 1;

  while ((match = liRegex.exec(html)) !== null) {
    const inner = match[1].replace(/<\/?p[^>]*>/gi, " ").trim();
    const line = inlineHtmlToMarkdown(inner);
    if (line) {
      items.push(ordered ? `${index}. ${line}` : `- ${line}`);
      index += 1;
    }
  }

  return items.join("\n");
}

function blockToMarkdown(tag: string, inner: string): string {
  switch (tag) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const level = Number(tag[1]);
      const text = inlineHtmlToMarkdown(inner);
      return text ? `${"#".repeat(level)} ${text}` : "";
    }
    case "p": {
      return inlineHtmlToMarkdown(inner);
    }
    case "pre": {
      const codeMatch = /<code[^>]*>([\s\S]*?)<\/code>/i.exec(inner);
      const code = decodeHtmlEntities((codeMatch?.[1] ?? inner).replace(/<[^>]+>/g, "")).trim();
      return code ? "```\n" + code + "\n```" : "";
    }
    case "ul":
      return listToMarkdown(inner, false);
    case "ol":
      return listToMarkdown(inner, true);
    case "blockquote": {
      const text = inlineHtmlToMarkdown(inner);
      return text
        .split("\n")
        .map((l) => (l ? `> ${l}` : ">"))
        .join("\n");
    }
    case "figure": {
      const imgMatch = /<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?/i.exec(inner);
      if (!imgMatch) return "";
      const alt = decodeHtmlEntities(imgMatch[2] || "تصویر");
      return `![${alt}](${cleanImageUrl(imgMatch[1])})`;
    }
    default:
      return "";
  }
}

function extractVirgoolMarkdown(html: string): string {
  const start = html.search(/class="v-block v-(?:paragraph|heading|code|quote|list)|class="md-block-image/);
  if (start === -1) return "";

  const slice = html.slice(start, start + 250_000);
  const blocks: { index: number; md: string }[] = [];

  const vBlockRegex =
    /<(h[1-6]|p|pre|ul|ol|blockquote|figure)\b[^>]*class="[^"]*v-block[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = vBlockRegex.exec(slice)) !== null) {
    const md = blockToMarkdown(match[1].toLowerCase(), match[2]);
    if (md) blocks.push({ index: match.index, md });
  }

  const imageDivRegex = /<img[^>]+src="(https:\/\/files\.virgool\.io\/upload\/users\/\d+\/posts\/[^"?]+)[^"]*"[^>]*(?:alt="([^"]*)")?[^>]*>/gi;
  while ((match = imageDivRegex.exec(slice)) !== null) {
    const alt = decodeHtmlEntities(match[2] || "تصویر");
    const md = `![${alt}](${cleanImageUrl(match[1])})`;
    blocks.push({ index: match.index, md });
  }

  blocks.sort((a, b) => a.index - b.index);

  const seen = new Set<string>();
  const parts: string[] = [];
  for (const block of blocks) {
    if (seen.has(block.md)) continue;
    seen.add(block.md);
    parts.push(block.md);
  }

  return parts.join("\n\n").trim();
}

function rssDescriptionToMarkdown(description: string, title: string): string {
  let text = description.trim();
  if (text.startsWith(title)) {
    text = text.slice(title.length).trim();
  }
  return text
    .replace(/\r\n/g, "\n")
    .replace(/([^\n]{3,80}؟)(?=[A-Z\u0621-\u06FF])/g, "$1\n\n")
    .trim();
}

async function fetchArticleContent(
  url: string,
  title: string,
  rssDescription: string,
  slugPrefix: string
): Promise<{ content: string; coverImage: string | null }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "DevNetBlogImporter/1.0" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }

  const html = await res.text();
  const coverRemote = extractMetaContent(html, "og:image");
  let content = extractVirgoolMarkdown(html);

  if (content.length < rssDescription.length * 0.5) {
    content = rssDescriptionToMarkdown(rssDescription, title);
  }

  content = await localizeImages(content, slugPrefix);
  const coverImage = await localizeCoverImage(
    coverRemote ? cleanImageUrl(coverRemote) : null,
    slugPrefix
  );

  return { content, coverImage };
}

function parsePubDate(pubDate: string): Date {
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base || "post";
  let i = 2;
  while (await prisma.post.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${i}`;
    i += 1;
  }
  return candidate;
}

async function findExistingPost(itemLink: string, title: string) {
  const baseSlug = virgoolSlugFromUrl(itemLink, title);
  return prisma.post.findFirst({
    where: {
      OR: [{ canonicalUrl: itemLink }, { slug: baseSlug }],
    },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("📥 Fetching Virgool feed…");
  const feedRes = await fetch(FEED_URL, {
    headers: { "User-Agent": "DevNetBlogImporter/1.0" },
  });
  if (!feedRes.ok) {
    throw new Error(`Failed to fetch feed: HTTP ${feedRes.status}`);
  }

  const items = parseRss(await feedRes.text());
  console.log(`   Found ${items.length} articles in feed`);
  await ensureUploadDir();

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    throw new Error("No admin user found. Run prisma/seed.ts first.");
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      name: AUTHOR_NAME,
      bio: "توسعه‌دهنده ارشد وب و متخصص PHP",
    },
  });

  const category = await prisma.category.upsert({
    where: { slug: CATEGORY_SLUG },
    update: {
      name: CATEGORY_NAME,
      description: "مقالات منتشر شده در ویرگول",
      color: "rose",
      seoTitle: "مقالات ویرگول",
      metaDescription: "مجموعه نوشته‌های آرش فدایی.",
    },
    create: {
      name: CATEGORY_NAME,
      slug: CATEGORY_SLUG,
      description: "مقالات منتشر شده در ویرگول",
      color: "rose",
      seoTitle: "مقالات ویرگول",
      metaDescription: "مجموعه نوشته‌های آرش فدایی.",
    },
  });

  console.log(`✓ Category «${category.name}» (${category.slug})`);

  await prisma.setting.upsert({
    where: { key: "authorName" },
    update: { value: AUTHOR_NAME },
    create: { key: "authorName", value: AUTHOR_NAME },
  });

  let imported = 0;
  let updated = 0;

  for (const item of items) {
    const title = item.title.replace(/\s*-\s*ویرگول\s*$/i, "").trim();
    const baseSlug = virgoolSlugFromUrl(item.link, title);
    console.log(`\n→ ${title}`);

    const { content, coverImage } = await fetchArticleContent(
      item.link,
      title,
      item.description,
      baseSlug
    );

    if (!content) {
      console.warn("   ⚠ Skipped — no content extracted");
      continue;
    }

    const publishedAt = parsePubDate(item.pubDate);
    const excerpt = excerptFromContent(content);
    const rt = readingTime(content);

    const existing = await findExistingPost(item.link, title);

    if (existing) {
      await prisma.post.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          excerpt,
          coverImage: coverImage ?? existing.coverImage,
          status: "PUBLISHED",
          publishedAt,
          readingTime: rt,
          categoryId: category.id,
          metaDescription: excerpt,
          ogImage: coverImage ?? existing.ogImage,
          canonicalUrl: null,
        },
      });
      updated += 1;
      console.log(`   ↻ Updated (${existing.slug}) — ${rt} min · images local`);
      continue;
    }

    const slug = await uniqueSlug(baseSlug);

    await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        status: "PUBLISHED",
        publishedAt,
        readingTime: rt,
        authorId: admin.id,
        categoryId: category.id,
        canonicalUrl: null,
        metaDescription: excerpt,
        ogImage: coverImage,
        seoTitle: title,
      },
    });

    imported += 1;
    console.log(`   ✓ Imported as /blog/${slug} — ${rt} min · images local`);
  }

  console.log(`\n✅ Done: ${imported} imported, ${updated} updated (${items.length} total in feed)`);
  console.log(`   📁 Images saved to public/uploads/`);
}

main()
  .catch((err) => {
    console.error("Import failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
