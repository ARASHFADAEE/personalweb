# Dev.net — Persian RTL Developer Blog (Project Worklog)

---
Task ID: 1
Agent: main (orchestrator)
Task: Build a premium Persian RTL Full-Stack Developer Blog + Admin CMS with Next.js 16

Work Log:
- Phase 1-4 (Setup + Design System + DB + Auth):
  - Designed Prisma schema: User, Session, Post, Category, Tag, PostTag, PostView, Project, Media, Setting (SQLite).
  - Pushed schema & seeded 8 Persian tech posts, 5 categories, 12 tags, 4 projects, admin user.
  - Built design system: emerald accent, warm neutral surfaces, RTL, Vazirmatn + JetBrains Mono fonts, dark mode w/o flash.
  - Auth: bcrypt password hashing, DB-backed sessions, httpOnly cookies, rate-limited login.
- Phase 5-13 (Admin + Public + SEO):
  - Public: home (hero, featured, latest, topics, projects, about, newsletter), blog listing w/ search/filter/sort/pagination, article page w/ TOC + code blocks + share + prev/next + related + JSON-LD, category/tag pages, projects list + detail, about page, 404/500/loading/error.
  - Admin: login, layout w/ sidebar + topbar, dashboard w/ stats + area chart, posts list w/ bulk actions + filters, post editor w/ @mdxeditor/editor + SEO panel + Google preview, categories manager, tags manager, media library (upload/preview/alt/copy/delete), projects table + editor, settings (general/author/seo/analytics tabs).
  - Search: command palette (⌘K) hitting /api/search.
  - SEO: generateMetadata w/ templates, sitemap.ts, robots.ts, rss.xml, JSON-LD (TechArticle, Person, SoftwareApplication, WebSite via layout).
- API routes: auth (signin/signout/me), posts, views, search, newsletter, admin posts (+bulk +[id]), admin categories, admin tags, admin media (+[id]), admin projects (+[id]), admin settings, admin upload (multipart → /public/uploads).

Stage Summary:
- Stack: Next.js 16 App Router, TypeScript, Tailwind 4, shadcn/ui, Prisma+SQLite, react-hook-form + zod, @mdxeditor/editor, recharts, next-themes.
- Login: admin@devnet.local / admin12345
- All pages connected to real DB — no mocks.

Unresolved / Next:
- Need to run lint, start dev server, verify with agent-browser, fix any runtime/hydration issues.
- next.config has typescript.ignoreBuildErrors=true (left intentionally; should re-enable for prod).
- Image domains: currently allowing any via remote cover images (unsplash seed). Add next.config images config for prod.
