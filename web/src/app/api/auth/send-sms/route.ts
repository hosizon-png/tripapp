import { NextResponse } from "next/server";
import { sendSmsCode } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const { phone, type = "login" } = await request.json();

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "请输入正确的手机号" },
        { status: 400 }
      );
    }

    if (!["login", "register", "bind", "reset_password"].includes(type)) {
      return NextResponse.json({ error: "无效的验证类型" }, { status: 400 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const result = await sendSmsCode({ phone, type, ip });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 429 });
    }

    return NextResponse.json({ message: result.message });
  } catch (error) {
    console.error("[send-sms]", error);
    return NextResponse.json({ error: "发送失败，请稍后再试" }, { status: 500 });
  }
}
