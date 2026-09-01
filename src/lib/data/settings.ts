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

    const pick = <K extends keyof Settings>(key: K): Settings[K] => {
      if (!(key in map)) return DEFAULTS[key];
      const raw = map[key as string];
      if (key === "newsletterEnabled") return (raw === "true") as Settings[K];
      return raw as Settings[K];
    };

    const result: Settings = {
      siteName: pick("siteName"),
      siteDescription: pick("siteDescription"),
      logoText: pick("logoText"),
      heroBadge: pick("heroBadge"),
      heroTagline: pick("heroTagline"),
      homeAboutTitle: pick("homeAboutTitle"),
      homeAboutText: pick("homeAboutText"),
      authorName: pick("authorName"),
      authorBio: pick("authorBio"),
      authorAvatar: pick("authorAvatar"),
      socialGithub: pick("socialGithub"),
      socialLinkedin: pick("socialLinkedin"),
      socialX: pick("socialX"),
      socialEmail: pick("socialEmail"),
      defaultSeoTitle: pick("defaultSeoTitle"),
      defaultSeoDescription: pick("defaultSeoDescription"),
      defaultOgImage: pick("defaultOgImage"),
      googleVerification: pick("googleVerification"),
      newsletterEnabled: pick("newsletterEnabled"),
      analyticsProvider: pick("analyticsProvider"),
      analyticsScript: pick("analyticsScript"),
      footerNote: pick("footerNote"),
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
