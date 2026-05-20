import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByPhone, createUser, createFreeSubscription, createRefreshToken, getSubscription } from "@/lib/db-helpers";
import { verifySmsCode } from "@/lib/sms";

const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const JWT_REFRESH = process.env.AUTH_REFRESH_SECRET || "dev-refresh-change-me";

export async function POST(request: Request) {
  try {
    const { phone, code, password } = await request.json();
    if (!phone) return NextResponse.json({ error: "请输入手机号" }, { status: 400 });
    let user = findUserByPhone(phone);

    if (code) {
      const v = await verifySmsCode(phone, code, user ? "login" : "register");
      if (!v.success) return NextResponse.json({ error: v.message }, { status: 400 });
    } else if (password) {
      if (!user?.passwordHash || !bcrypt.compareSync(password, user.passwordHash))
        return NextResponse.json({ error: "手机号或密码错误" }, { status: 401 });
    } else {
      return NextResponse.json({ error: "请提供验证码或密码" }, { status: 400 });
    }
    if (!user && code) { user = createUser({ phone }); createFreeSubscription(user.id); }
    if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

    const sub = getSubscription(user.id);
    const at = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "15m" });
    const rt = jwt.sign({ userId: user.id }, JWT_REFRESH, { expiresIn: "30d" });
    createRefreshToken(user.id, rt);

    return NextResponse.json({
      user: { id: user.id, phone: user.phone, name: user.name, avatarUrl: user.avatarUrl, tier: sub?.tier || "free" },
      tokens: { accessToken: at, refreshToken: rt },
    });
  } catch (e) { console.error("[login]", e); return NextResponse.json({ error: "登录失败" }, { status: 500 }); }
}
