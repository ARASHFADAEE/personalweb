import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/schema";

// Simple rate-limit (in-memory, per-process)
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW = 5 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" }, { status: 422 });
  }

  const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const entry = attempts.get(ip) ?? { count: 0, firstAt: Date.now() };
  if (Date.now() - entry.firstAt > WINDOW) {
    entry.count = 0;
    entry.firstAt = Date.now();
  }
  entry.count += 1;
  attempts.set(ip, entry);
  if (entry.count > MAX_ATTEMPTS) {
    return NextResponse.json({ error: "تلاش‌های بیش از حد. کمی بعد تلاش کنید." }, { status: 429 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user) {
    return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است" }, { status: 401 });
  }

  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
