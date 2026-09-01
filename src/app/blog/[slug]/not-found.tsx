import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedPostBySlug } from "@/lib/data/posts";
import { getSettings } from "@/lib/data/settings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: "مقاله یافت نشد", robots: { index: false, follow: true } };
}
