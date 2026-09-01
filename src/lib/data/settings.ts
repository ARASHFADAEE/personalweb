import { db } from "@/lib/db";

export type Settings = {
  siteName: string;
  siteDescription: string;
  logoText: string;
  heroBadge: string;
  heroTagline: string;
  homeAboutTitle: string;
  homeAboutText: string;
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  socialGithub: string;
  socialLinkedin: string;
  socialX: string;
  socialEmail: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImage: string;
  googleVerification: string;
  newsletterEnabled: boolean;
  analyticsProvider: string; // '' | 'plausible' | 'umami' | 'ga'
  analyticsScript: string;
  footerNote: string;
};

const DEFAULTS: Settings = {
  siteName: "دِو‌نت",
  siteDescription:
    "وبلاگ شخصی یک توسعه‌دهنده — مقالات تخصصی درباره‌ی Next.js، React، طراحی نرم‌افزار، DevOps و هوش مصنوعی.",
  logoText: "dev.net",
  heroBadge: "توسعه‌دهنده فول‌استک · کانال تخصصی",
  heroTagline: "درباره‌ی کد و معماری می‌نویسم",
  homeAboutTitle: "درباره‌ی من",
  homeAboutText:
    "من علاقه‌مند به ساخت محصول‌های سریع، قابل‌نگهداری و با تجربه‌ی کاربری خوبم. در اینجا درباره‌ی چالش‌های واقعی و راه‌حل‌هایی که پیدا می‌کنم می‌نویسم — نه چیزهای تئوریک و بی‌کاربرد.",
  authorName: "آرش فدایی",
  authorBio:
    "توسعه‌دهنده ارشد وب و متخصص PHP — درباره‌ی Laravel، Next.js و معماری نرم‌افزار می‌نویسم.",
  authorAvatar: "",
  socialGithub: "https://github.com/",
  socialLinkedin: "https://linkedin.com/",
  socialX: "",
  socialEmail: "hi@example.com",
  defaultSeoTitle: "دِو‌نت — وبلاگ توسعه‌دهنده",
  defaultSeoDescription:
    "مقالات تخصصی درباره‌ی Next.js، React و معماری نرم‌افزار، نوشته‌ی یک توسعه‌دهنده.",
  defaultOgImage: "/og-default.png",
  googleVerification: "",
  newsletterEnabled: true,
  analyticsProvider: "",
  analyticsScript: "",
  footerNote: "ساخته‌شده با Next.js و عشق به کد تمیز.",
};

let cache: Settings | null = null;
let cacheAt = 0;
const TTL = 60_000; // 1 minute

export async function getSettings(): Promise<Settings> {
  const now = Date.now();
  if (cache && now - cacheAt < TTL) return cache;
  try {
    const rows = await db.setting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    const result: Settings = {
      ...DEFAULTS,
      ...(map.siteName ? { siteName: map.siteName } : {}),
      ...(map.siteDescription ? { siteDescription: map.siteDescription } : {}),
      ...(map.logoText ? { logoText: map.logoText } : {}),
      ...(map.heroBadge ? { heroBadge: map.heroBadge } : {}),
      ...(map.heroTagline ? { heroTagline: map.heroTagline } : {}),
      ...(map.homeAboutTitle ? { homeAboutTitle: map.homeAboutTitle } : {}),
      ...(map.homeAboutText ? { homeAboutText: map.homeAboutText } : {}),
      ...(map.authorName ? { authorName: map.authorName } : {}),
      ...(map.authorBio ? { authorBio: map.authorBio } : {}),
      ...(map.authorAvatar ? { authorAvatar: map.authorAvatar } : {}),
      ...(map.socialGithub ? { socialGithub: map.socialGithub } : {}),
      ...(map.socialLinkedin ? { socialLinkedin: map.socialLinkedin } : {}),
      ...(map.socialX ? { socialX: map.socialX } : {}),
      ...(map.socialEmail ? { socialEmail: map.socialEmail } : {}),
      ...(map.defaultSeoTitle ? { defaultSeoTitle: map.defaultSeoTitle } : {}),
      ...(map.defaultSeoDescription ? { defaultSeoDescription: map.defaultSeoDescription } : {}),
      ...(map.defaultOgImage ? { defaultOgImage: map.defaultOgImage } : {}),
      ...(map.googleVerification ? { googleVerification: map.googleVerification } : {}),
      ...(map.newsletterEnabled ? { newsletterEnabled: map.newsletterEnabled === "true" } : {}),
      ...(map.analyticsProvider ? { analyticsProvider: map.analyticsProvider } : {}),
      ...(map.analyticsScript ? { analyticsScript: map.analyticsScript } : {}),
      ...(map.footerNote ? { footerNote: map.footerNote } : {}),
    };
    cache = result;
    cacheAt = now;
    return result;
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(values: Partial<Settings>): Promise<void> {
  const ops = Object.entries(values).map(([key, value]) =>
    db.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );
  await db.$transaction(ops);
  cache = null; // invalidate
}

export async function getSetting(key: keyof Settings): Promise<string | boolean | undefined> {
  const all = await getSettings();
  return all[key];
}
