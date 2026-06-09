import { NextResponse } from "next/server";
import { createAdminSession, getAdminCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "").trim();
  const admin = getAdminCredentials();

  if (email !== admin.email || password !== admin.password) {
    return NextResponse.json(
      { success: false, message: "E-mail ou senha inválidos." },
      { status: 401 },
    );
  }

  await createAdminSession();

  return NextResponse.json({ success: true });
}
