import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { getSubscription } from "@/lib/db-helpers";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";

export async function GET(req: Request) {
  const auth = authenticateRequest(req);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const sub = getSubscription(auth.userId);
  const tier = sub?.tier || "free";
  const limits = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

  return NextResponse.json({
    subscription: sub || { tier: "free" },
    limits,
    tiers: Object.entries(SUBSCRIPTION_TIERS).map(([key, val]) => ({
      id: key, name: key === "free" ? "Free" : key === "pro" ? "Pro" : "Plus",
      price: key === "free" ? 0 : key === "pro" ? 9.9 : 19.9,
      yearlyPrice: key === "free" ? 0 : key === "pro" ? 68 : 138,
      features: val,
    })),
  });
}
