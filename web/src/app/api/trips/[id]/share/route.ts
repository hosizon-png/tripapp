import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { findTrip, setShareToken, disableShare } from "@/lib/db-helpers";
import crypto from "crypto";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const trip = findTrip(id, auth.userId);
  if (!trip) return NextResponse.json({ error: "行程不存在" }, { status: 404 });

  const token = trip.shareToken || crypto.randomBytes(8).toString("hex");
  if (!trip.shareToken) setShareToken(id, token);

  return NextResponse.json({
    shareToken: token,
    shareUrl: `${process.env.AUTH_URL || "http://localhost:3001"}/s/${token}`,
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  if (!findTrip(id, auth.userId)) return NextResponse.json({ error: "行程不存在" }, { status: 404 });
  disableShare(id);
  return NextResponse.json({ success: true });
}
