import type { Metadata } from "next";
import type { Settings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/site-url";

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  settings: Pick<Settings, "siteName" | "defaultOgImage">;
};

/** Absolute page metadata so admin-controlled titles are not rewritten by the layout template. */
export function buildPageMetadata({
  title,
  description,
  path,
  settings,
}: PageSeoInput): Metadata {
  const base = getSiteUrl();
  const canonicalPath = path === "/" ? "/" : path;
  const url = path === "/" ? base : `${base}${path}`;
  const images = settings.defaultOgImage
    ? [{ url: settings.defaultOgImage }]
    : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url,
      siteName: settings.siteName,
      locale: "fa_IR",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.defaultOgImage ? [settings.defaultOgImage] : undefined,
    },
  };
}
