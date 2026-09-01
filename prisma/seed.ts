// Seed script — Persian tech content for the developer blog
// Run with: bun run db:seed
// Usage: `node --import tsx prisma/seed.ts` OR `bun run prisma/seed.ts`

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Reset (dev only)
  await prisma.postView.deleteMany();
  await prisma.postTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.project.deleteMany();
  await prisma.media.deleteMany();
  await prisma.session.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  // ---- User / Admin ----
  const passwordHash = await bcrypt.hash("admin12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@devnet.local" },
    update: {
      name: "آرش فدایی",
      passwordHash,
      role: "ADMIN",
      bio: "توسعه‌دهنده ارشد وب و متخصص PHP",
    },
    create: {
      email: "admin@devnet.local",
      name: "آرش فدایی",
      passwordHash,
      role: "ADMIN",
      bio: "توسعه‌دهنده ارشد وب و متخصص PHP",
    },
  });
  console.log(`✓ Admin user ready (admin@devnet.local / admin12345) [id=${admin.id}]`);

  // ---- Categories ----
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Next.js",
        slug: "nextjs",
        description: "تمام آنچه باید درباره‌ی Next.js و App Router بدانید.",
        color: "emerald",
        seoTitle: "مقالات Next.js",
        metaDescription: "آموزش‌ها و تجربه‌های واقعی با Next.js، Server Components و App Router.",
      },
    }),
    prisma.category.create({
      data: {
        name: "React",
        slug: "react",
        description: "الگوهای پیشرفته‌ی React و مدیریت state.",
        color: "sky",
      },
    }),
    prisma.category.create({
      data: {
        name: "DevOps",
        slug: "devops",
        description: "CI/CD، Docker و استقرار در محیط Production.",
        color: "amber",
      },
    }),
    prisma.category.create({
      data: {
        name: "هوش مصنوعی",
        slug: "ai",
        description: "ادغام مدل‌های زبانی در محصولات واقعی.",
        color: "violet",
      },
    }),
    prisma.category.create({
      data: {
        name: "طراحی نرم‌افزار",
        slug: "architecture",
        description: "معماری، الگوهای طراحی و کد قابل نگهداری.",
        color: "rose",
      },
    }),
  ]);
  console.log("✓ Categories created");

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  // ---- Tags ----
  const tagNames = [
    "Server Components", "App Router", "TypeScript", "Performance",
    "SEO", "Accessibility", "Docker", "PostgreSQL", "Caching",
    "Streaming", "Edge", "Security",
  ];
  const tags = await Promise.all(
    tagNames.map((name) => {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      return prisma.tag.create({ data: { name, slug } });
    })
  );
  const tagBySlug = Object.fromEntries(tags.map((t) => [t.slug, t]));
  console.log("✓ Tags created");

  // ---- Posts ----
  const postsData = [
    {
      title: "Server Actions در Next.js: راهنمای کامل و کاربردی",
      slug: "nextjs-server-actions-guide",
      excerpt:
        "Server Actions چطور کار می‌کنند، کجاها نباید از آن‌ها استفاده کرد و چطور با Zod اعتبارسنجی کنیم.",
      categorySlug: "nextjs",
      tagSlugs: ["server-components", "app-router", "typescript"],
      featured: true,
      publishedAtDaysAgo: 3,
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
      content: `## مقدمه

Server Actions یکی از مهم‌ترین قابلیت‌های Next.js 16 است که به ما اجازه می‌دهد بدون نوشتن API route دستی، مستقیماً روی سرور کد اجرا کنیم. در این مقاله، از صفر تا یک فرم Production-ready پیش می‌رویم.

## Server Action چیست؟

Server Action یک تابع async است که روی سرور اجرا می‌شود و از کلاینت فراخوانی می‌شود. نوع آن با directive \`"use server"\` مشخص می‌شود.

\`\`\`tsx
async function createPost(formData: FormData) {
  "use server";
  const title = formData.get("title");
  // ذخیره در دیتابیس
}
\`\`\`

## اعتبارسنجی با Zod

هیچ‌وقت به ورودی کاربر اعتماد نکنید. همیشه با Zod اعتبارسنجی کنید:

\`\`\`ts
const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
});
\`\`\`

> نکته: Server Actionها به‌صورت پیش‌فرض در فرم‌ها progressive enhancement دارند. اگر JavaScript بارگذاری نشد، فرم همچنان کار می‌کند.

## خطاهای رایج

1. فراموش کردن \`"use server"\`
2. بازگرداندن شیء‌های non-serializable
3. عدم اعتبارسنجی ورودی

## جمع‌بندی

Server Actions ابزار قدرتمندی است، ولی برای همه‌ی سناریوها مناسب نیست. برای منطق پیچیده یا endpoint‌های عمومی، همچنان Route Handler بهتر است.`,
    },
    {
      title: "مدیریت State در React: راهنمای 2025",
      slug: "react-state-management-2025",
      excerpt:
        "از useState تا Zustand و TanStack Query — کجاها از کدام استفاده کنیم؟",
      categorySlug: "react",
      tagSlugs: ["typescript", "performance"],
      featured: true,
      publishedAtDaysAgo: 7,
      coverImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80",
      content: `## مقدمه

مدیریت state در React همیشه بحث جذابی بوده. در 2025 ما ابزارهای متنوعی داریم و انتخاب درست سخت شده.

## سلسله‌مراتب ابزارها

1. **useState** برای state محلی کامپوننت
2. **useContext** برای state سراسری ساده
3. **Zustand** برای state کلاینت پیچیده‌تر
4. **TanStack Query** برای state سرور

## قانون طلایی

> State سرور و state کلاینت را جدا کنید. TanStack Query برای داده‌های سرور، Zustand برای UI state.

\`\`\`ts
// Zustand store ساده
const useStore = create<State>((set) => ({
  theme: "system",
  setTheme: (t) => set({ theme: t }),
}));
\`\`\`

## جمع‌بندی

هیچ راه‌حل یکسانی وجود ندارد. نیاز خود را تحلیل کنید، سپس ابزار را انتخاب کنید.`,
    },
    {
      title: "Docker برای توسعه‌دهنده‌های Next.js",
      slug: "docker-for-nextjs-developers",
      excerpt:
        "یک Dockerfile Production-ready برای Next.js با standalone output و چند-مرحله‌ای.",
      categorySlug: "devops",
      tagSlugs: ["docker", "performance"],
      featured: true,
      publishedAtDaysAgo: 12,
      coverImage: "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=1200&q=80",
      content: `## چرا Docker؟

محیط توسعه و Production یکسان، deployment ساده و مقیاس‌پذیری راحت.

## Dockerfile چندمرحله‌ای

\`\`\`dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
\`\`\`

## نکات بهینه‌سازی

- از \`output: "standalone"\` استفاده کنید
- حجم image را با alpine کم کنید
- \`.dockerignore\` را فراموش نکنید

## جمع‌بندی

با standalone output می‌توان image‌ای زیر 200MB ساخت.`,
    },
    {
      title: "ادغام LLM در محصول: تجربه‌ی واقعی",
      slug: "integrating-llm-into-product",
      excerpt:
        "چطور چت‌بات واقعی بسازیم — از prompt engineering تا streaming و error handling.",
      categorySlug: "ai",
      tagSlugs: ["streaming", "typescript", "performance"],
      featured: false,
      publishedAtDaysAgo: 18,
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
      content: `## مقدمه

اضافه کردن یک مدل زبانی به محصول، فقط فراخوانی API نیست. تجربه‌ی کاربر، هزینه و reliability باید مدیریت شوند.

## Streaming

برای تجربه‌ی بهتر، از streaming استفاده کنید:

\`\`\`ts
const stream = await openai.chat.completions.create({
  model: "gpt-4o",
  messages,
  stream: true,
});
for await (const chunk of stream) {
  // yield به کاربر
}
\`\`\`

## Prompt Engineering

> System prompt شما مهم‌ترین بخش است. نقش، محدودیت‌ها و فرمت خروجی را واضح تعریف کنید.

## جمع‌بندی

با streaming و error handling مناسب، تجربه‌ی پخش می‌شود.`,
    },
    {
      title: "معماری قابل نگهداری: اصول SOLID در TypeScript",
      slug: "solid-principles-typescript",
      excerpt:
        "پنج اصل SOLID را با مثال‌های واقعی TypeScript بررسی می‌کنیم.",
      categorySlug: "architecture",
      tagSlugs: ["typescript", "security"],
      featured: false,
      publishedAtDaysAgo: 25,
      coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa43?w=1200&q=80",
      content: `## مقدمه

SOLID پنج اصل طراحی است که کد ما را قابل‌تغییر و قابل‌تست می‌کند.

## Single Responsibility

هر کلاس فقط یک دلیل برای تغییر داشته باشد.

## Open/Closed

بسته برای تغییر، باز برای توسعه. از strategy pattern استفاده کنید.

## Dependency Inversion

به abstraction وابسته باشید، نه implementation.

\`\`\`ts
interface NotificationService {
  send(to: string, body: string): Promise<void>;
}
\`\`\`

## جمع‌بندی

SOLID قانون نیست، راهنماست. بیش‌ازحد پیچیده نکنید.`,
    },
    {
      title: "SEO فنی در Next.js: از metadata تا sitemap",
      slug: "technical-seo-nextjs",
      excerpt:
        "همه‌چیز درباره‌ی metadata، JSON-LD، sitemap و robots.txt در App Router.",
      categorySlug: "nextjs",
      tagSlugs: ["seo", "app-router", "edge"],
      featured: false,
      publishedAtDaysAgo: 30,
      coverImage: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1200&q=80",
      content: `## مقدمه

SEO فنی زیربنای هر سایت موفقی است. در Next.js ابزار قدرتمندی داریم.

## Metadata API

\`\`\`tsx
export const metadata: Metadata = {
  title: { default: "...", template: "%s — DevNet" },
  openGraph: { type: "website", locale: "fa_IR" },
};
\`\`\`

## JSON-LD

Structured data برای موتورهای جستجو ضروری است:

\`\`\`tsx
<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: title,
})}} />
\`\`\`

## Sitemap و robots

از \`app/sitemap.ts\` و \`app/robots.ts\` استفاده کنید.

## جمع‌بندی

SEO فنی = metadata + structured data + sitemap + سرعت.`,
    },
    {
      title: "Caching در Next.js: تمام چیزهایی که باید بدانید",
      slug: "nextjs-caching-complete-guide",
      excerpt:
        "Data Cache، Full Route Cache و Router Cache — تفاوت‌ها و کاربردها.",
      categorySlug: "nextjs",
      tagSlugs: ["caching", "performance", "edge"],
      featured: false,
      publishedAtDaysAgo: 40,
      coverImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&q=80",
      content: `## مقدمه

Caching در Next.js 16 پیچیده است ولی وقتی درکش کنید، فوق‌العاده قدرتمند.

## چهار لایه‌ی Cache

1. **Data Cache** — برای fetch‌ها
2. **Full Route Cache** — کل صفحه
3. **Router Cache** — کلاینت
4. **ISP/CDN** — شبکه

\`\`\`ts
fetch(url, { next: { revalidate: 3600 } });
\`\`\`

## revalidate vs no-store

> \`revalidate\` زمان‌دار، \`no-store\` کاملاً داینامیک.

## جمع‌بندی

درست caching کنید، ولی نه بیش‌ازحد.`,
    },
    {
      title: "Accessibility: ساختن وب برای همه",
      slug: "web-accessibility-for-all",
      excerpt:
        "WCAG، ARIA و الگوهای دسترسی‌پذیر — چون همه‌ی کاربران مهم هستند.",
      categorySlug: "architecture",
      tagSlugs: ["accessibility", "seo"],
      featured: false,
      publishedAtDaysAgo: 50,
      coverImage: "https://images.unsplash.com/photo-1553877522-43269d44598b?w=1200&q=80",
      content: `## مقدمه

دسترسی‌پذیری فقط برای کاربران ناتوان نیست — برای همه بهتر است.

## اصول پایه

- semantic HTML
- keyboard navigation
- focus states واضح
- color contrast کافی

\`\`\`html
<button aria-label="بستن">✕</button>
\`\`\`

## WCAG

چهار اصل: قابل‌درک، قابل‌استفاده، قابل‌رویت و مستحکم.

## جمع‌بندی

دسترسی‌پذیری مسئولیت ماست، نه feature.`,
    },
  ];

  for (const p of postsData) {
    const category = catBySlug[p.categorySlug];
    const postTags = p.tagSlugs.map((s) => tagBySlug[s]).filter(Boolean);
    const publishedAt = new Date(Date.now() - p.publishedAtDaysAgo * 24 * 60 * 60 * 1000);
    const words = p.content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    await prisma.post.create({
      data: {
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        content: p.content,
        coverImage: p.coverImage,
        status: "PUBLISHED",
        featured: p.featured,
        publishedAt,
        authorId: admin.id,
        categoryId: category.id,
        readingTime,
        viewsCount: Math.floor(Math.random() * 800),
        seoTitle: p.title,
        metaDescription: p.excerpt,
        tags: {
          create: postTags.map((t) => ({ tagId: t.id })),
        },
      },
    });
  }
  console.log("✓ Posts created (8)");

  // Add some views for analytics
  const allPosts = await prisma.post.findMany();
  for (const post of allPosts) {
    const n = Math.floor(Math.random() * 25);
    for (let i = 0; i < n; i++) {
      await prisma.postView.create({
        data: {
          postId: post.id,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log("✓ Views seeded");

  // ---- Projects ----
  const projectsData = [
    {
      title: "دِو‌نت — وبلاگ شخصی",
      slug: "devnet-blog",
      description: "یک پلتفرم وبلاگ فارسی و RTL ساخته‌شده با Next.js و Prisma.",
      technologies: ["Next.js", "TypeScript", "Prisma", "Tailwind"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/",
      featured: true,
      sortOrder: 0,
    },
    {
      title: "تبدیل صوت به متن",
      slug: "speech-to-text",
      description: "ابزار آنلاین تبدیل گفتار فارسی به متن با ASR.",
      technologies: ["Next.js", "Web Audio API", "TypeScript"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/",
      featured: true,
      sortOrder: 1,
    },
    {
      title: "تقویم شمسی React",
      slug: "persian-react-calendar",
      description: "کامپوننت تقویم جلالی سبک و قابل‌تنظیم.",
      technologies: ["React", "TypeScript"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/",
      featured: false,
      sortOrder: 2,
    },
    {
      title: "داشبورد SEO",
      slug: "seo-dashboard",
      description: "تحلیل خودکار سئو و Core Web Vitals برای سایت‌های فارسی.",
      technologies: ["Next.js", "PostgreSQL", "Recharts"],
      demoUrl: "https://example.com",
      repoUrl: "https://github.com/",
      featured: false,
      sortOrder: 3,
    },
  ];

  for (const proj of projectsData) {
    await prisma.project.create({
      data: {
        ...proj,
        technologies: JSON.stringify(proj.technologies),
        status: "PUBLISHED",
      },
    });
  }
  console.log("✓ Projects created (4)");

  // ---- Settings ----
  await prisma.setting.createMany({
    data: [
      { key: "siteName", value: "دِو‌نت" },
      { key: "logoText", value: "dev.net" },
      { key: "authorName", value: "آرش فدایی" },
      { key: "newsletterEnabled", value: "true" },
    ],
  });
  console.log("✓ Settings seeded");

  console.log("\n✅ Seeding complete!");
  console.log("   Login: admin@devnet.local / admin12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
