import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { findItemOwner, updateItem, deleteItem } from "@/lib/db-helpers";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id, itemId } = await params;
  const ownerId = findItemOwner(itemId, id);
  if (!ownerId || ownerId !== auth.userId) return NextResponse.json({ error: "日程不存在" }, { status: 404 });

  const data = await req.json();
  updateItem(itemId, data);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id, itemId } = await params;
  const ownerId = findItemOwner(itemId, id);
  if (!ownerId || ownerId !== auth.userId) return NextResponse.json({ error: "日程不存在" }, { status: 404 });
  deleteItem(itemId);
  return NextResponse.json({ success: true });
}
