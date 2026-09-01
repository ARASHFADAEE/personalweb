import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data/settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const settings = await getSettings();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
    ...(settings.googleVerification
      ? { headers: { "X-Google-Verify": settings.googleVerification } }
      : {}),
  };
}
