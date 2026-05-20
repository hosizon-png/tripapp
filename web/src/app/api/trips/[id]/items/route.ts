import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { findTrip, createItem, countTripItems, getSubscription, findTripItems } from "@/lib/db-helpers";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  if (!findTrip(id, auth.userId)) return NextResponse.json({ error: "行程不存在" }, { status: 404 });
  return NextResponse.json({ items: findTripItems(id) });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  if (!findTrip(id, auth.userId)) return NextResponse.json({ error: "行程不存在" }, { status: 404 });

  const sub = getSubscription(auth.userId);
  const tier = sub?.tier || "free";
  const limits = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
  if (countTripItems(id) >= limits.maxItemsPerTrip)
    return NextResponse.json({ error: `免费版每个行程最多${limits.maxItemsPerTrip}条日程`, code: "UPGRADE_REQUIRED" }, { status: 403 });

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "请输入日程标题" }, { status: 400 });

  const item = createItem({
    tripId: id, dayNumber: body.dayNumber || 1, type: body.type || "note",
    title: body.title.trim(), startTime: body.startTime, endTime: body.endTime,
    locationName: body.locationName, bookingRef: body.bookingRef, notes: body.notes,
  });
  return NextResponse.json({ item }, { status: 201 });
}
