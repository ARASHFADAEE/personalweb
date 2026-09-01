# معماری پروژه — دِو‌نت (DevNet)

> وبلاگ شخصی RTL فارسی با پنل مدیریت کامل برای توسعه‌دهندگان

---

## نمای کلی پروژه

**دِو‌نت** یک وبلاگ/پورتفولیوی شخصی است که با Next.js 16 و React 19 ساخته شده. سایت به‌صورت کامل RTL و فارسی است و شامل این بخش‌ها می‌شود:

| بخش | مسیر | توضیح |
|-----|------|-------|
| صفحه اصلی | `/` | Hero، مقالات برجسته، دسته‌بندی‌ها، پروژه‌ها |
| وبلاگ | `/blog`, `/blog/[slug]` | لیست و جزئیات مقالات Markdown |
| پروژه‌ها | `/projects`, `/projects/[slug]` | پورتفولیوی پروژه‌ها |
| دسته‌بندی | `/categories/[slug]` | فیلتر مقالات بر اساس دسته |
| تگ | `/tags/[slug]` | فیلتر مقالات بر اساس تگ |
| درباره | `/about` | معرفی نویسنده |
| پنل مدیریت | `/admin/*` | CRUD مقالات، پروژه‌ها، رسانه، تنظیمات |
| ورود ادمین | `/admin/login` | صفحه احراز هویت |

---

## پشته فناوری

```
Frontend     Next.js 16 (App Router) + React 19 + TypeScript
Styling      Tailwind CSS 4 + shadcn/ui (Radix UI)
Database     SQLite + Prisma ORM 6
Auth         Session-based (Cookie + DB) — bcryptjs
Validation   Zod 4 + React Hook Form
Editor       MDXEditor (ادمین) / react-markdown (نمایش)
Charts       Recharts
Font         IRANYekanX (Variable Font)
Deploy       Next.js standalone output
Runtime      Bun (production) / Node (dev)
```

---

## ساختار پوشه‌ها

```
src/
├── app/                          # App Router — صفحات و API
│   ├── layout.tsx                # Root layout (RTL, فونت، Theme, Auth)
│   ├── page.tsx                  # صفحه اصلی
│   ├── blog/                     # وبلاگ عمومی
│   ├── projects/                 # پورتفولیو
│   ├── categories/               # صفحات دسته‌بندی
│   ├── tags/                     # صفحات تگ
│   ├── about/                    # درباره
│   ├── admin/
│   │   ├── layout.tsx            # Layout خالی (passthrough)
│   │   ├── login/page.tsx        # ورود — بدون احراز هویت
│   │   └── (dashboard)/          # Route Group — صفحات محافظت‌شده
│   │       ├── layout.tsx        # Sidebar + Topbar + Auth guard
│   │       ├── page.tsx          # داشبورد
│   │       ├── posts/            # مدیریت مقالات
│   │       ├── projects/         # مدیریت پروژه‌ها
│   │       ├── categories/       # مدیریت دسته‌بندی
│   │       ├── tags/             # مدیریت تگ
│   │       ├── media/            # کتابخانه رسانه
│   │       └── settings/         # تنظیمات سایت
│   └── api/
│       ├── auth/                 # signin, signout, me
│       ├── admin/                # CRUD ادمین (محافظت‌شده)
│       ├── posts/                # API عمومی
│       ├── search/               # جستجو
│       ├── views/                # ثبت بازدید
│       └── newsletter/           # خبرنامه
├── components/
│   ├── admin/                    # کامپوننت‌های پنل (sidebar, editor, ...)
│   ├── ui/                       # shadcn/ui primitives
│   ├── site-header.tsx           # هدر عمومی
│   ├── site-footer.tsx           # فوتر
│   ├── article-card.tsx          # کارت مقاله
│   ├── markdown-renderer.tsx     # رندر Markdown
│   └── auth-provider.tsx         # Context احراز هویت کلاینت
├── lib/
│   ├── auth.ts                   # Session, bcrypt, cookie
│   ├── db.ts                     # Prisma client singleton
│   ├── data/
│   │   ├── posts.ts              # Query layer — مقالات و آمار
│   │   └── settings.ts           # تنظیمات key-value با cache
│   ├── validations/schema.ts     # Zod schemas
│   ├── jalali.ts                 # تاریخ شمسی
│   └── slug.ts                   # slugify + formatCount
└── hooks/                        # useToast, useMobile
prisma/
├── schema.prisma                 # مدل دیتابیس
└── seed.ts                       # داده اولیه فارسی
public/
└── fonts/                        # IRANYekanXVF.woff2
```

---

## معماری لایه‌ای

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (RTL / fa)                    │
├─────────────────────────────────────────────────────────┤
│  Pages (RSC)          │  Client Components              │
│  - Server Components  │  - LoginForm, PostEditor          │
│  - generateMetadata   │  - AuthProvider, ThemeProvider    │
│  - revalidate/ISR     │  - SearchCommand, Charts          │
├───────────────────────┴─────────────────────────────────┤
│              API Routes (Route Handlers)                 │
│  /api/auth/*  /api/admin/*  /api/posts  /api/search     │
├─────────────────────────────────────────────────────────┤
│                    lib/ (Business Logic)                 │
│  auth.ts  │  data/posts.ts  │  data/settings.ts         │
├─────────────────────────────────────────────────────────┤
│              Prisma ORM  →  SQLite (custom.db)           │
└─────────────────────────────────────────────────────────┘
```

### الگوی داده

- **Server Components** برای صفحات عمومی و ادمین — fetch مستقیم از Prisma
- **API Routes** برای عملیات mutation (CRUD ادمین، login، upload)
- **lib/data/** به‌عنوان Data Access Layer — queryهای پیچیده و cache تنظیمات
- **Client Components** فقط جایی که تعامل لازم است (فرم‌ها، ادیتور، toast)

---

## مدل دیتابیس (Prisma)

| Model | نقش |
|-------|-----|
| `User` | ادمین/ویرایشگر — email, passwordHash, role |
| `Session` | توکن session با expiry |
| `Post` | مقاله — Markdown, SEO fields, status (DRAFT/PUBLISHED/SCHEDULED) |
| `Category` | دسته‌بندی با slug و SEO |
| `Tag` | تگ با slug |
| `PostTag` | Many-to-many Post ↔ Tag |
| `PostView` | آمار بازدید (ipHash برای حریم خصوصی) |
| `Project` | پروژه پورتفولیو |
| `Media` | فایل‌های آپلودشده |
| `Setting` | Key-Value store برای تنظیمات سایت |

---

## احراز هویت

سیستم auth سفارشی (بدون NextAuth در runtime، هرچند `next-auth` در package.json هست):

```
1. POST /api/auth/signin  →  verify bcrypt  →  createSession()
2. Cookie: devnet_session (httpOnly, 7 روز)
3. Session در DB ذخیره می‌شود (token + userId + expiresAt)
4. getSessionUser() در Server Components / API
5. requireAdmin() برای Route Handlers ادمین
6. POST /api/auth/signout → destroySession()
```

**نقش‌ها:** `ADMIN` | `EDITOR` — هر دو به پنل دسترسی دارند.

**کاربر تست (seed):**
- Email: `admin@devnet.local`
- Password: `admin12345`

---

## پنل مدیریت

| صفحه | قابلیت |
|------|--------|
| داشبورد | آمار، نمودار بازدید ۷ روز، آخرین مقالات |
| مقالات | CRUD، bulk actions، ویرایش MDX، SEO preview |
| پروژه‌ها | CRUD پورتفولیو |
| دسته‌بندی / تگ | مدیریت taxonomy |
| رسانه | آپلود، کتابخانه تصاویر |
| تنظیمات | siteName, SEO, شبکه‌های اجتماعی, analytics |

APIهای ادمین در `src/app/api/admin/*` با `requireAdmin()` محافظت می‌شوند.

---

## سایت عمومی — SEO و Performance

- **Metadata دینامیک** از `getSettings()` در root layout
- **ISR** — homepage با `revalidate = 3600`
- **RSS** — `/rss.xml`
- **Sitemap** — `/sitemap.ts`
- **robots.txt** — `/robots.ts`
- **Open Graph / Twitter Cards** per-post
- **فیلدهای SEO** در Post و Category (seoTitle, metaDescription, canonical, robots)

---

## جریان درخواست — مثال خواندن مقاله

```
GET /blog/my-post
  → blog/[slug]/page.tsx (RSC)
  → getPublishedPostBySlug(slug)  [lib/data/posts.ts]
  → db.post.findFirst({ where: { slug, status: PUBLISHED } })
  → MarkdownRenderer + TableOfContents + ShareButtons
```

---

## باگ صفحه لاگین ادمین — علت و راه‌حل

### علت

صفحه `/admin/login` داخل پوشه `admin/` بود و **همان layout ادمین** روی آن هم اعمال می‌شد:

```tsx
// src/app/admin/layout.tsx (قبل از اصلاح)
export default async function AdminLayout({ children }) {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");  // ← مشکل اینجا
  // ...
}
```

**جریان خطا:**

```
کاربر → /admin/login
  → AdminLayout اجرا می‌شود
  → user = null
  → redirect("/admin/login")
  → دوباره AdminLayout اجرا می‌شود
  → حلقه بی‌نهایت redirect
  → صفحه کرش / رفرش مداوم
```

در HTML پاسخ، این خطا دیده می‌شد:
```
NEXT_REDIRECT;replace;/admin/login;307;
<meta http-equiv="refresh" content="1;url=/admin/login"/>
```

### راه‌حل (اعمال‌شده)

با **Route Groups** در Next.js App Router، layout احراز هویت فقط روی صفحات محافظت‌شده اعمال می‌شود:

```
admin/
├── layout.tsx              # فقط {children} — بدون auth check
├── login/page.tsx          # خارج از (dashboard) — بدون sidebar
└── (dashboard)/
    ├── layout.tsx          # auth guard + sidebar + topbar
    ├── page.tsx
    ├── posts/
    └── ...
```

- `/admin/login` → فقط root layout + admin passthrough layout
- `/admin`, `/admin/posts`, ... → root + admin + **dashboard layout** (با auth)

---

## دستورات توسعه

```bash
# نصب
npm install   # یا bun install

# دیتابیس
npm run db:push      # sync schema
npm run db:generate  # prisma generate
bun run prisma/seed.ts   # seed داده فارسی

# اجرا
npm run dev          # http://localhost:3000
npm run build        # standalone build
npm run start        # production
```

---

## متغیرهای محیطی

| متغیر | کاربرد |
|-------|--------|
| `DATABASE_URL` | مسیر SQLite — **نسبت به `prisma/`** (مثلاً `file:../db/custom.db`) |
| `NEXT_PUBLIC_SITE_URL` | URL سایت برای metadata و OG |

---

## نکات معماری برای توسعه آینده

1. **Migration به PostgreSQL** — schema Prisma از ابتدا portable طراحی شده
2. **Middleware** — می‌توان auth redirect را به `middleware.ts` منتقل کرد
3. **next-auth** — در dependencies هست ولی استفاده نمی‌شود؛ auth فعلی سفارشی است
4. **Cache invalidation** — `getSettings()` TTL ۶۰ ثانیه دارد؛ بعد از save باطل می‌شود
5. **Rate limit** — signin در-memory per-process است؛ برای production باید Redis/shared store شود

---

*آخرین به‌روزرسانی: ۱۴۰۵/۰۶/۱۰*
