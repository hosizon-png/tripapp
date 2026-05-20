import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByPhone, createUser, createFreeSubscription, createRefreshToken } from "@/lib/db-helpers";
import { verifySmsCode } from "@/lib/sms";

const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const JWT_REFRESH = process.env.AUTH_REFRESH_SECRET || "dev-refresh-change-me";

export async function POST(request: Request) {
  try {
    const { phone, code, password, name } = await request.json();
    if (!phone || !code) return NextResponse.json({ error: "手机号和验证码不能为空" }, { status: 400 });
    if (findUserByPhone(phone)) return NextResponse.json({ error: "该手机号已注册" }, { status: 409 });

    const v = await verifySmsCode(phone, code, "register");
    if (!v.success) return NextResponse.json({ error: v.message }, { status: 400 });

    const user = createUser({ phone, name, passwordHash: password ? bcrypt.hashSync(password, 12) : undefined });
    createFreeSubscription(user.id);

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH, { expiresIn: "30d" });
    createRefreshToken(user.id, refreshToken);

    return NextResponse.json({
      user: { id: user.id, phone: user.phone, name: user.name, tier: "free" },
      tokens: { accessToken, refreshToken },
    });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
