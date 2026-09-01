import crypto from "crypto";
import { NextRequest } from "next/server";

export function hashIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  const salt = process.env.COMMENT_HASH_SALT || "devnet-comments";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function serializeComment(c: {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
}) {
  return {
    id: c.id,
    authorName: c.authorName,
    content: c.content,
    createdAt: c.createdAt.toISOString(),
  };
}
