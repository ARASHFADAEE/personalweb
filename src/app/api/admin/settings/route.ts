import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/data/settings";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await saveSettings(body);

  // Bust ISR/static cache so homepage, layout metadata, etc. pick up new settings.
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/blog");
  revalidatePath("/projects");
  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
  revalidatePath("/rss.xml");

  return NextResponse.json({ ok: true });
}
