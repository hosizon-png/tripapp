import { NextResponse } from "next/server";
import { getCityId, getCurrentWeather, getDailyWeather } from "@/lib/weather";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");
  const cityId = searchParams.get("cityId");
  try {
    let cid = cityId;
    if (!cid && location) {
      cid = await getCityId(location);
    }
    if (!cid) {
      return NextResponse.json({ error: "未找到该城市" }, { status: 404 });
    }

    const [current, daily] = await Promise.all([
      getCurrentWeather(cid),
      getDailyWeather(cid),
    ]);

    return NextResponse.json({ current, daily, cityId: cid });
  } catch (error) {
    console.error("[weather]", error);
    return NextResponse.json({ error: "获取天气失败" }, { status: 500 });
  }
}
