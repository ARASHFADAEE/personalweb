import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const files = formData.getAll("files");
  if (!files.length) return NextResponse.json({ error: "فایلی ارسال نشد" }, { status: 422 });

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const created: string[] = [];
  for (const file of files) {
    if (!(file instanceof File)) continue;
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: `نوع فایل مجاز نیست: ${file.type}` }, { status: 422 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `حجم فایل بیش از حد است (حداکثر ۵MB)` }, { status: 422 });
    }
    const ext = (file.name.split(".").pop() || "bin").toLowerCase();
    const name = `${crypto.randomBytes(12).toString("hex")}.${ext}`;
    const fullPath = path.join(UPLOAD_DIR, name);
    const bytes = await file.arrayBuffer();
    await writeFile(fullPath, Buffer.from(bytes));

    const url = `/uploads/${name}`;
    const media = await db.media.create({
      data: {
        filename: name,
        originalName: file.name,
        url,
        mimeType: file.type,
        size: file.size,
      },
    });
    created.push(media.url);
  }

  return NextResponse.json({ urls: created });
}
