import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/db-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let orderId, tradeNo, isPaid = false;
    if (body.out_trade_no) { orderId = body.out_trade_no; tradeNo = body.trade_no; isPaid = body.trade_status === "TRADE_SUCCESS"; }
    else if (body.out_trade_no_wx) { orderId = body.out_trade_no_wx; tradeNo = body.transaction_id; isPaid = body.result_code === "SUCCESS"; }
    if (!orderId) return NextResponse.json({ error: "Invalid" }, { status: 400 });
    if (isPaid) markOrderPaid(orderId, tradeNo || "unknown");
    return NextResponse.json({ message: "success" });
  } catch (e) { console.error("[payment]", e); return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
