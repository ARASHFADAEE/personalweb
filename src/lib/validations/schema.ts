import { z } from "zod";

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const categorySchema = z.object({
  name: z.string().min(1, "نام دسته‌بندی الزامی است").max(80),
  slug: z.string().min(1).max(100).optional().or(z.literal("")),
  description: z.string().max(500).optional().or(z.literal("")),
  color: z.string().max(40).optional().or(z.literal("")),
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
});
export type CategoryInput = z.infer<typeof categorySchema>;

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

export const tagSchema = z.object({
  name: z.string().min(1, "نام تگ الزامی است").max(60),
  slug: z.string().max(80).optional().or(z.literal("")),
});
export type TagInput = z.infer<typeof tagSchema>;

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export const postSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").max(200),
  slug: z.string().max(200).optional().or(z.literal("")),
  excerpt: z.string().max(400).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  coverImage: z.string().url("آدرس کاور معتبر نیست").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  featured: z.boolean().default(false),
  publishedAt: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.string()).default([]),
  // SEO
  seoTitle: z.string().max(120).optional().or(z.literal("")),
  metaDescription: z.string().max(300).optional().or(z.literal("")),
  canonicalUrl: z.string().url().optional().or(z.literal("")),
  ogTitle: z.string().max(120).optional().or(z.literal("")),
  ogDescription: z.string().max(300).optional().or(z.literal("")),
  ogImage: z.string().url().optional().or(z.literal("")),
  focusKeyword: z.string().max(120).optional().or(z.literal("")),
  robotsNoindex: z.boolean().default(false),
  robotsNofollow: z.boolean().default(false),
});
export type PostInput = z.infer<typeof postSchema>;

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const projectSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است").max(200),
  slug: z.string().max(200).optional().or(z.literal("")),
  description: z.string().min(1, "توضیحات الزامی است").max(400),
  content: z.string().optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
  technologies: z.array(z.string()).default([]),
  demoUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  sortOrder: z.number().int().default(0),
});
export type ProjectInput = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------------
// Media
// ---------------------------------------------------------------------------

export const mediaSchema = z.object({
  altText: z.string().max(300).optional().or(z.literal("")),
  caption: z.string().max(500).optional().or(z.literal("")),
});
export type MediaInput = z.infer<typeof mediaSchema>;

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  siteName: z.string().min(1).max(80),
  siteDescription: z.string().max(400),
  logoText: z.string().max(40),
  authorName: z.string().max(120),
  authorBio: z.string().max(1000),
  authorAvatar: z.string().url().optional().or(z.literal("")),
  socialGithub: z.string().url().optional().or(z.literal("")),
  socialLinkedin: z.string().url().optional().or(z.literal("")),
  socialX: z.string().max(200).optional().or(z.literal("")),
  socialEmail: z.string().email().optional().or(z.literal("")),
  defaultSeoTitle: z.string().max(120),
  defaultSeoDescription: z.string().max(300),
  defaultOgImage: z.string().url().optional().or(z.literal("")),
  googleVerification: z.string().max(200).optional().or(z.literal("")),
  newsletterEnabled: z.boolean(),
  analyticsProvider: z.string().max(40).optional().or(z.literal("")),
  analyticsScript: z.string().max(2000).optional().or(z.literal("")),
  footerNote: z.string().max(300),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const newsletterSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;
