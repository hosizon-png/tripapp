import { NextResponse } from "next/server";
import { listOrders } from "@/lib/db-helpers";

export async function GET() {
  return NextResponse.json({ orders: listOrders(50) });
}
