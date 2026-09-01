import { del, put } from "@vercel/blob";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export type StoredFile = {
  url: string;
  filename: string;
};

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function isVercelRuntime() {
  return process.env.VERCEL === "1";
}

function isRemoteStorageUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function buildUploadFilename(ext: string) {
  return `${crypto.randomBytes(12).toString("hex")}.${ext.toLowerCase()}`;
}

export async function storeUploadedFile(file: File, ext: string): Promise<StoredFile> {
  const filename = buildUploadFilename(ext);

  if (hasBlobToken()) {
    const blob = await put(`uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || undefined,
    });
    return { url: blob.url, filename };
  }

  if (isVercelRuntime()) {
    throw new Error(
      "برای آپلود در Vercel باید Blob Storage فعال شود و متغیر BLOB_READ_WRITE_TOKEN تنظیم گردد."
    );
  }

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const fullPath = path.join(UPLOAD_DIR, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(fullPath, Buffer.from(bytes));

  return { url: `/uploads/${filename}`, filename };
}

export async function deleteStoredFile(url: string): Promise<void> {
  if (isRemoteStorageUrl(url)) {
    if (!hasBlobToken()) return;
    try {
      await del(url);
    } catch {
      /* best-effort */
    }
    return;
  }

  if (!url.startsWith("/uploads/")) return;

  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    /* best-effort */
  }
}
