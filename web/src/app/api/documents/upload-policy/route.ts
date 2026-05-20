import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-middleware";
import { generateUploadPolicy } from "@/lib/oss";
import { getSubscription, totalUserStorage, createDocument } from "@/lib/db-helpers";
import { SUBSCRIPTION_TIERS } from "@/lib/constants";

export async function POST(request: Request) {
  const auth = authenticateRequest(request);
  if (!auth) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { fileName, fileType, tripId, category, itineraryItemId } = await request.json();
  if (!fileName || !tripId) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

  const sub = getSubscription(auth.userId);
  const tier = sub?.tier || "free";
  const limits = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];

  const usedMB = totalUserStorage(auth.userId) / (1024 * 1024);
  if (usedMB >= limits.maxStorageMB) {
    return NextResponse.json({ error: `存储空间已满（${limits.maxStorageMB}MB），请升级订阅`, code: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  const policy = generateUploadPolicy(auth.userId, fileName, fileType);
  const doc = createDocument({ tripId, itineraryItemId: itineraryItemId || undefined, name: fileName, fileUrl: policy.cdnUrl, fileType, category: category || "other" });

  return NextResponse.json({ ...policy, documentId: (doc as any).id });
}
