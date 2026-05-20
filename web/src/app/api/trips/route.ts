import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { findUserTrips, createTrip, countUserTrips, getSubscription } from "@/lib/db-helpers";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";

export async function GET(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const trips = findUserTrips(auth.userId);
  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const sub = getSubscription(auth.userId);
  const tier = sub?.tier || "free";
  const limits = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  if (countUserTrips(auth.userId) >= limits.maxTrips)
    return NextResponse.json({ error: `免费版最多${limits.maxTrips}个行程，请升级`, code: "UPGRADE_REQUIRED" }, { status: 403 });

  const { title, description, destination, coverImage, startDate, endDate, lat, lng } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: "请输入行程标题" }, { status: 400 });

  const trip = createTrip({ userId: auth.userId, title: title.trim(), description, destination, coverImage, startDate, endDate, lat, lng });
  return NextResponse.json({ trip }, { status: 201 });
}
