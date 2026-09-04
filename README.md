# personalweb

وبلاگ شخصی فارسی (Next.js + Prisma + PostgreSQL) — مقالات، پروژه‌ها، پنل مدیریت، نظرات، RSS و sitemap.

## راه‌اندازی

```bash
npm install
cp .env.example .env
npx prisma db push
npx prisma generate
npm run dev
```

## متغیرهای محیطی

- `DATABASE_URL` — اتصال **pooled** به Postgres (روی Vercel: `arsh_DATABASE_URL` یا `POSTGRES_PRISMA_URL`)
- `DIRECT_URL` — اتصال **مستقیم** فقط برای migrate/push (روی Vercel: `arsh_POSTGRES_URL` یا `POSTGRES_URL_NON_POOLING`)
- `NEXT_PUBLIC_SITE_URL` — آدرس عمومی سایت (برای sitemap و OG)

### Vercel Postgres

Vercel متغیرهای `arsh_*` / `POSTGRES_*` را می‌سازد؛ Prisma به نام‌های استاندارد نیاز دارد. در **Settings → Environment Variables**:

| Name | Value |
|------|--------|
| `DATABASE_URL` | همان مقدار **pooled** (`arsh_DATABASE_URL` / `POSTGRES_PRISMA_URL`) — معمولاً host شامل `-pooler` |
| `DIRECT_URL` | همان مقدار **direct** (`arsh_POSTGRES_URL` / `POSTGRES_URL_NON_POOLING`) |

اگر خطای `too many connections for role "prisma_migration"` دیدی، یعنی `DATABASE_URL` اشتباه روی URL مایگریشن/دایرکت ست شده — آن را با URL پول‌شده عوض کن و Redeploy بزن.

بعد از اولین deploy موفق، دیتابیس را seed کن:

> **توجه:** `prisma db push` فقط هنگام تغییر schema و به‌صورت دستی (`npm run db:push`) اجرا شود — در build روی Vercel اجرا نمی‌شود تا خطای `too many connections` رخ ندهد.

```bash
# با connection string مستقیم از Vercel
DIRECT_URL="..." DATABASE_URL="..." npm run db:seed
npm run db:import-virgool   # اختیاری — import ویرگول
```

## اسکریپت‌ها

- `npm run dev` — توسعه
- `npm run build` / `npm start` — production
- `npm run db:import-virgool` — import مقالات از ویرگول

## ورود ادمین

پس از seed: `admin@devnet.local` / `admin12345`
