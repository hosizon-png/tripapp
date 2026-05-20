import { NextResponse } from "next/server";
import { listUsers } from "@/lib/db-helpers";

export async function GET() {
  const users = listUsers(50).map((u: any) => ({
    ...u,
    phone: u.phone ? u.phone.slice(0, 3) + "****" + u.phone.slice(7) : null,
  }));
  return NextResponse.json({ users });
}
