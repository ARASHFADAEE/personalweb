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

- `DATABASE_URL` — اتصال pooled به Postgres (روی Vercel: مقدار `arsh_DATABASE_URL`)
- `DIRECT_URL` — اتصال مستقیم برای migrate/push (روی Vercel: مقدار `arsh_POSTGRES_URL`)
- `NEXT_PUBLIC_SITE_URL` — آدرس عمومی سایت (برای sitemap و OG)

### Vercel Postgres

Vercel متغیرهای `arsh_*` را می‌سازد؛ Prisma به نام‌های استاندارد نیاز دارد. در **Settings → Environment Variables** این دو را اضافه کن:

| Name | Value |
|------|--------|
| `DATABASE_URL` | همان مقدار `arsh_DATABASE_URL` |
| `DIRECT_URL` | همان مقدار `arsh_POSTGRES_URL` |

بعد از اولین deploy موفق، دیتابیس را seed کن:

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
