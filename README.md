# personalweb

وبلاگ شخصی فارسی (Next.js + Prisma + SQLite) — مقالات، پروژه‌ها، پنل مدیریت، نظرات، RSS و sitemap.

## راه‌اندازی

```bash
npm install
cp .env.example .env
npx prisma db push
npx prisma generate
npm run dev
```

## متغیرهای محیطی

- `DATABASE_URL` — مسیر SQLite (مثلاً `file:../db/custom.db`)
- `NEXT_PUBLIC_SITE_URL` — آدرس عمومی سایت (برای sitemap و OG)

## اسکریپت‌ها

- `npm run dev` — توسعه
- `npm run build` / `npm start` — production
- `npm run db:import-virgool` — import مقالات از ویرگول

## ورود ادمین

پس از seed: `admin@devnet.local` / `admin12345`
