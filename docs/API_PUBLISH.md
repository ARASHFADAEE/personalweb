# Publish API (v1) — مستندات اتصال سیستم خارجی

این API برای انتشار / به‌روزرسانی مقالات از یک سیستم دیگر طراحی شده است.  
احراز هویت: **OAuth2-style Client Credentials + JWT (HS256)**.

Base URL (Production):

```text
https://fadaee-dev.ir
```

Base path:

```text
/api/v1
```

---

## ۱) پیش‌نیاز امنیتی (سمت سایت)

در Vercel / `.env` این متغیرها را ست کنید (هرگز در فرانت یا ریپوی عمومی قرار ندهید):

| متغیر | توضیح |
|--------|--------|
| `PUBLISH_API_JWT_SECRET` | رمز امضای JWT — حداقل ۳۲ کاراکتر تصادفی قوی |
| `PUBLISH_API_CLIENT_ID` | شناسه کلاینت سیستم خارجی |
| `PUBLISH_API_CLIENT_SECRET` | رمز کلاینت — قوی و محرمانه |
| `PUBLISH_API_AUTHOR_EMAIL` | (اختیاری) ایمیل نویسنده مقالات در سایت؛ پیش‌فرض اولین ادمین |
| `PUBLISH_API_TOKEN_TTL_SECONDS` | (اختیاری) عمر توکن به ثانیه — پیش‌فرض `900` (۱۵ دقیقه)، حداکثر `3600` |
| `NEXT_PUBLIC_SITE_URL` | دامنه عمومی برای ساخت URL مقاله |

تولید نمونه Secret:

```bash
openssl rand -base64 48
```

---

## ۲) جریان احراز هویت

```text
1) سیستم شما → POST /api/v1/auth/token  (client_id + client_secret)
2) سایت → access_token (JWT کوتاه‌عمر)
3) سیستم شما → درخواست‌های بعدی با هدر:
   Authorization: Bearer <access_token>
```

### گرفتن توکن

`POST /api/v1/auth/token`

```http
POST /api/v1/auth/token HTTP/1.1
Host: fadaee-dev.ir
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET"
}
```

پاسخ موفق `200`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 900,
  "scope": "posts:write posts:read"
}
```

نکات:

- توکن را **کش کنید** تا نزدیک انقضا؛ برای هر مقاله دوباره token نگیرید مگر لازم باشد.
- قبل از انقضا (`expires_in`) توکن جدید بگیرید.
- `client_secret` فقط سمت سرور سیستم شما نگهداری شود.

---

## ۳) انتشار مقاله

`POST /api/v1/posts`  
Scope لازم: `posts:write`

```http
POST /api/v1/posts HTTP/1.1
Host: fadaee-dev.ir
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "عنوان مقاله",
  "slug": "optional-custom-slug",
  "excerpt": "خلاصه کوتاه",
  "content": "## تیتر\n\nمتن مارک‌داون مقاله...",
  "coverImage": "https://cdn.example.com/cover.jpg",
  "status": "PUBLISHED",
  "featured": false,
  "categorySlug": "laravel",
  "tags": ["Laravel", "API"],
  "upsert": true,
  "seoTitle": "عنوان سئو",
  "metaDescription": "توضیح متا حداکثر حدود ۱۶۰ کاراکتر",
  "focusKeyword": "کلمه کلیدی"
}
```

### فیلدها

| فیلد | نوع | الزامی | توضیح |
|------|-----|--------|--------|
| `title` | string | بله | حداکثر ۲۰۰ |
| `content` | string (Markdown) | بله | بدنه مقاله |
| `slug` | string | خیر | اگر خالی باشد از عنوان ساخته می‌شود |
| `excerpt` | string | خیر | خلاصه |
| `coverImage` | string | خیر | URL مطلق `http(s)` یا مسیر نسبی `/...` |
| `status` | enum | خیر | `DRAFT` \| `PUBLISHED` \| `SCHEDULED` — پیش‌فرض `DRAFT` |
| `featured` | boolean | خیر | مقاله برتر |
| `publishedAt` | ISO datetime | خیر | برای انتشار زمان‌دار/سفارشی |
| `scheduledAt` | ISO datetime | برای SCHEDULED | الزامی وقتی status=`SCHEDULED` |
| `categoryId` | string | خیر | شناسه دسته |
| `categorySlug` | string | خیر | اسلاگ دسته (راحت‌تر از id) |
| `tagIds` | string[] | خیر | شناسه تگ‌ها |
| `tags` | string[] | خیر | نام تگ‌ها — در صورت نبود، ساخته می‌شوند |
| `upsert` | boolean | خیر | اگر `true` و slug وجود داشته باشد، به‌روزرسانی می‌شود |
| `seoTitle` / `metaDescription` / `og*` / `focusKeyword` | string | خیر | سئو |
| `robotsNoindex` / `robotsNofollow` | boolean | خیر | پیش‌فرض false |

پاسخ ایجاد `201` / به‌روزرسانی `200`:

```json
{
  "data": {
    "id": "clx...",
    "title": "عنوان مقاله",
    "slug": "optional-custom-slug",
    "status": "PUBLISHED",
    "url": "https://fadaee-dev.ir/blog/optional-custom-slug",
    "category": { "id": "...", "name": "...", "slug": "laravel" },
    "tags": [{ "id": "...", "name": "Laravel", "slug": "laravel" }],
    "createdAt": "2026-09-04T12:00:00.000Z",
    "updatedAt": "2026-09-04T12:00:00.000Z"
  },
  "meta": { "created": true }
}
```

اگر slug تکراری باشد و `upsert=false` → `409 SLUG_EXISTS`.

---

## ۴) دریافت یک مقاله

`GET /api/v1/posts/{idOrSlug}`  
Scope: `posts:read`

```http
GET /api/v1/posts/optional-custom-slug HTTP/1.1
Authorization: Bearer <access_token>
```

---

## ۵) لیست دسته‌ها و تگ‌ها

برای مپ کردن دسته‌بندی سمت سیستم مبدأ:

- `GET /api/v1/categories` — scope `posts:read`
- `GET /api/v1/tags` — scope `posts:read`

---

## ۶) نمونه کد PHP (Laravel HTTP Client)

```php
$tokenResponse = Http::asJson()->post('https://fadaee-dev.ir/api/v1/auth/token', [
    'client_id' => config('services.blog.client_id'),
    'client_secret' => config('services.blog.client_secret'),
]);

$tokenResponse->throw();
$accessToken = $tokenResponse->json('access_token');

$publish = Http::withToken($accessToken)
    ->asJson()
    ->post('https://fadaee-dev.ir/api/v1/posts', [
        'title' => $article->title,
        'slug' => $article->slug,
        'excerpt' => $article->excerpt,
        'content' => $article->markdown,
        'status' => 'PUBLISHED',
        'categorySlug' => 'laravel',
        'tags' => ['Laravel', 'PHP'],
        'upsert' => true,
    ]);

$publish->throw();
$publicUrl = $publish->json('data.url');
```

---

## ۷) نمونه cURL

```bash
# 1) Token
TOKEN=$(curl -s -X POST https://fadaee-dev.ir/api/v1/auth/token \
  -H 'Content-Type: application/json' \
  -d '{"client_id":"YOUR_ID","client_secret":"YOUR_SECRET"}' \
  | jq -r .access_token)

# 2) Publish
curl -s -X POST https://fadaee-dev.ir/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"تست API",
    "content":"## سلام\n\nمقاله از API",
    "status":"PUBLISHED",
    "upsert":true
  }'
```

---

## ۸) کدهای خطا

| HTTP | code | معنی |
|------|------|------|
| 400 | `INVALID_JSON` / `MISSING_CREDENTIALS` | بدنه یا فیلدهای لازم |
| 401 | `INVALID_CLIENT` / `INVALID_TOKEN` / `MISSING_TOKEN` | احراز هویت |
| 403 | `INSUFFICIENT_SCOPE` | scope کافی نیست |
| 404 | `NOT_FOUND` | مقاله پیدا نشد |
| 409 | `SLUG_EXISTS` | اسلاگ تکراری بدون upsert |
| 422 | `VALIDATION_ERROR` / `INVALID_CATEGORY` / ... | اعتبارسنجی |
| 429 | `RATE_LIMITED` | محدودیت نرخ |
| 503 | `API_NOT_CONFIGURED` / `AUTHOR_NOT_FOUND` | پیکربندی سرور |

فرمت خطا:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "داده‌ی ورودی نامعتبر است",
    "details": { "issues": [{ "path": "title", "message": "..." }] }
  }
}
```

---

## ۹) اصول امنیتی (اجباری برای تیم)

1. فقط از **HTTPS** استفاده کنید.
2. `client_secret` و `JWT_SECRET` را در env/secret manager نگه دارید — نه در گیت.
3. توکن را لاگ نکنید.
4. برای هر محیط (staging/production) credential جدا بسازید.
5. `upsert=true` فقط وقتی مطمئنید همان مقاله باید بازنویسی شود.
6. محتوا Markdown است؛ HTML خام خطرناک را تزریق نکنید مگر فیلتر شده باشد.
7. IP سیستم مبدأ را در صورت امکان در فایروال/WAF محدود کنید.
8. Rate limit فعلی در سطح اپلیکیشن است؛ روی Production توصیه می‌شود محدودیت Edge/WAF هم داشته باشید.

---

## ۱۰) چک‌لیست تست قبل از اتصال Production

- [ ] گرفتن توکن با credential درست → 200
- [ ] credential اشتباه → 401
- [ ] درخواست بدون Bearer → 401
- [ ] ایجاد مقاله DRAFT → 201 و در پنل ادمین دیده شود
- [ ] ایجاد PUBLISHED → در `/blog/{slug}` باز شود
- [ ] همان slug با `upsert=true` → 200 و محتوا آپدیت شود
- [ ] `categorySlug` نامعتبر → 422
- [ ] توکن منقضی → 401 و تمدید توکن

---

## ۱۱) پشتیبانی

در صورت خطا، پاسخ کامل JSON (`error.code` + `message`) و زمان درخواست را برای تیم سایت ارسال کنید.
