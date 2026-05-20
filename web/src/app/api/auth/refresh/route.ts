import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findRefreshToken, deleteRefreshToken, createRefreshToken } from "@/lib/db-helpers";

const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const JWT_REFRESH = process.env.AUTH_REFRESH_SECRET || "dev-refresh-change-me";

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) return NextResponse.json({ error: "缺少 token" }, { status: 400 });
    let payload: any;
    try { payload = jwt.verify(refreshToken, JWT_REFRESH); } catch { return NextResponse.json({ error: "Token已过期" }, { status: 401 }); }
    const s = findRefreshToken(refreshToken);
    if (!s || new Date(s.expiresAt) < new Date()) { deleteRefreshToken(refreshToken); return NextResponse.json({ error: "Token已失效" }, { status: 401 }); }
    deleteRefreshToken(refreshToken);
    const na = jwt.sign({ userId: payload.userId }, JWT_SECRET, { expiresIn: "15m" });
    const nr = jwt.sign({ userId: payload.userId }, JWT_REFRESH, { expiresIn: "30d" });
    createRefreshToken(payload.userId, nr);
    return NextResponse.json({ accessToken: na, refreshToken: nr });
  } catch (e) { console.error("[refresh]", e); return NextResponse.json({ error: "刷新失败" }, { status: 500 }); }
}
