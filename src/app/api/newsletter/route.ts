import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema } from "@/lib/validations/schema";

// Currently logs to console — provider can be added later via settings.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "ورودی نامعتبر" }, { status: 400 });
  }
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "ایمیل معتبر نیست" }, { status: 422 });
  }
  // Persist to Setting table as a simple list log (no dedicated model yet)
  console.log("[newsletter] subscribe:", parsed.data.email);
  return NextResponse.json({ ok: true });
}
