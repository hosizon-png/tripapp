import { NextResponse } from "next/server";
import { verifySmsCode } from "@/lib/sms";

export async function POST(request: Request) {
  try {
    const { phone, code, type = "login" } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "手机号和验证码不能为空" },
        { status: 400 }
      );
    }

    const result = await verifySmsCode(phone, code, type);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ message: result.message, verified: true });
  } catch (error) {
    console.error("[verify-sms]", error);
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}
