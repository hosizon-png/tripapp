import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { findTrip, updateTrip, deleteTrip, findTripItems, findTripDocuments, findTripChecklists, findTripExpenses } from "@/lib/db-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const trip = findTrip(id, auth.userId);
  if (!trip) return NextResponse.json({ error: "行程不存在" }, { status: 404 });

  const items = findTripItems(id);
  const documents = findTripDocuments(id);
  const checklists = (findTripChecklists(id) || []).map((cl: any) => ({
    ...cl,
    items: (require("@/lib/db-helpers") as any).findChecklistItems ? [] : [],
  }));
  const expenses = findTripExpenses(id);

  return NextResponse.json({ trip: { ...trip, items, documents, checklists, expenses } });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  if (!findTrip(id, auth.userId)) return NextResponse.json({ error: "行程不存在" }, { status: 404 });
  const data = await req.json();
  updateTrip(id, data);
  return NextResponse.json({ trip: findTrip(id) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  if (!findTrip(id, auth.userId)) return NextResponse.json({ error: "行程不存在" }, { status: 404 });
  deleteTrip(id);
  return NextResponse.json({ success: true });
}
