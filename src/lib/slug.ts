// Slug + text utilities (Persian-aware, URL-safe ASCII slugs)

export function slugify(input: string): string {
  if (!input) return "";
  // Normalize Persian/Arabic characters to ASCII equivalents for URLs
  const map: Record<string, string> = {
    "ا": "a", "آ": "a", "ب": "b", "پ": "p", "ت": "t", "ث": "th",
    "ج": "j", "چ": "ch", "ح": "h", "خ": "kh", "د": "d", "ذ": "z",
    "ر": "r", "ز": "z", "ژ": "zh", "س": "s", "ش": "sh", "ص": "s",
    "ض": "z", "ط": "t", "ظ": "z", "ع": "a", "غ": "gh", "ف": "f",
    "ق": "gh", "ک": "k", "گ": "g", "ل": "l", "م": "m", "ن": "n",
    "و": "v", "ه": "h", "ی": "y",
    " ": "-", "_": "-",
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

export function readingTime(content: string): number {
  // Persian reading ~200 wpm for technical content
  const words = content
    .replace(/```[\s\S]*?```/g, " ") // remove code blocks from word count
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function excerptFromContent(content: string, length = 160): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*_>`~\-\[\]\(\)!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= length) return plain;
  return plain.slice(0, length).trim() + "…";
}

/** Plain text from markdown — useful for meta descriptions and validation. */
export function plainTextFromMarkdown(content: string, length = 160): string {
  return excerptFromContent(content, length);
}

export function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  return (async () => {
    let slug = slugify(base) || "post";
    let candidate = slug;
    let i = 2;
    while (await exists(candidate)) {
      candidate = `${slug}-${i}`;
      i += 1;
    }
    return candidate;
  })();
}

// Persian digit conversion
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

// Persian numbers with thousands separators
export function formatCount(n: number): string {
  return toPersianDigits(n.toLocaleString("en-US"));
}
