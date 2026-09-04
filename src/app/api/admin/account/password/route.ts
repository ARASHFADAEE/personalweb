import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getSessionUser,
  hashPassword,
  verifyPassword,
  createSession,
} from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations/schema";

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "داده‌ی نامعتبر" },
      { status: 400 }
    );
  }

  const account = await db.user.findUnique({ where: { id: user.id } });
  if (!account) {
    return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    account.passwordHash
  );
  if (!valid) {
    return NextResponse.json({ error: "رمز فعلی نادرست است" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  // Invalidate every session, then keep this browser logged in.
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
