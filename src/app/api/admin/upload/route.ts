import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { storeUploadedFile } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("files");
  if (!files.length) return NextResponse.json({ error: "فایلی ارسال نشد" }, { status: 422 });

  const created: string[] = [];

  try {
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!ALLOWED.includes(file.type)) {
        return NextResponse.json({ error: `نوع فایل مجاز نیست: ${file.type}` }, { status: 422 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "حجم فایل بیش از حد است (حداکثر ۵MB)" }, { status: 422 });
      }

      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const stored = await storeUploadedFile(file, ext);

      const media = await db.media.create({
        data: {
          filename: stored.filename,
          originalName: file.name,
          url: stored.url,
          mimeType: file.type,
          size: file.size,
        },
      });
      created.push(media.url);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "آپلود ناموفق بود";
    console.error("[upload]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ urls: created });
}
