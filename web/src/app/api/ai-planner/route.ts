import { NextResponse } from "next/server";

// ========== Types ==========
interface Place {
  placeName: string;
  description: string;
  lat: number | null;
  lng: number | null;
  coverImage: string | null;
  transportationToNext: string;
}
interface CostItem { category: string; amount: number; currency: string; note: string; }
interface DayPlan { day: number; theme: string; places: Place[]; }
interface TripPlan { title: string; totalDays: number; summary: string; days: DayPlan[]; costBreakdown: CostItem[]; }

const SYSTEM_PROMPT = `You are a professional trip planner. Output STRICT JSON:
{
  "title": "行程标题",
  "totalDays": N,
  "summary": "一句话概括",
  "costBreakdown": [
    { "category": "交通", "amount": 800, "currency": "CNY", "note": "往返高铁" },
    { "category": "住宿", "amount": 1500, "currency": "CNY", "note": "4晚经济型酒店" },
    { "category": "餐饮", "amount": 600, "currency": "CNY", "note": "每日三餐+小吃" },
    { "category": "门票", "amount": 300, "currency": "CNY", "note": "景点门票合计" }
  ],
  "days": [{
    "day": 1, "theme": "主题",
    "places": [{
      "placeName": "地点名", "description": "一句话亮点",
      "lat": 35.0116, "lng": 135.7681, "coverImage": null,
      "transportationToNext": "步行10分钟"
    }]
  }]
}
Rules: Real lat/lng for every place. Real cost estimates in CNY based on destination prices. 3-5 places/day max. Chinese text. JSON only, no markdown.`;

// ========== Fallback generator ==========
function fallbackPlan(request: string): TripPlan {
  const days = parseInt(request.match(/(\d+)天/)?.[1] || "3");
  const isJapan = /日本|关西|东京|大阪|京都|奈良/.test(request);
  const themes = isJapan
    ? ["抵达与探索", "古寺巡礼", "奈良一日", "美食购物", "告别"]
    : ["城市探索", "文化体验", "美食之旅", "自然风光", "购物休闲"];

  return {
    title: isJapan ? "日本关西深度游" : "探索之旅",
    totalDays: Math.min(days, 5),
    summary: isJapan ? "探索古都京都、美食大阪与奈良的鹿群" : `${days}天定制行程`,
    days: Array.from({ length: Math.min(days, 5) }, (_, i) => ({
      day: i + 1, theme: themes[i],
      places: [
        { placeName: ["道顿堀", "清水寺", "奈良公园", "大阪城", "黑门市场"][i], description: ["美食天堂", "世界文化遗产", "与小鹿亲密接触", "日本名城", "海鲜市场"][i], lat: [34.6687, 34.9948, 34.6851, 34.6873, 34.6672][i], lng: [135.5014, 135.785, 135.8324, 135.526, 135.5026][i], coverImage: null, transportationToNext: i < 4 ? ["地铁", "近铁", "JR线", "步行"][i] : "" },
        { placeName: ["心斋桥", "二年坂三年坂", "东大寺", "天守阁", "关西机场"][i], description: ["购物街", "古街风情", "世界最大木造建筑", "俯瞰全景", "满载而归"][i], lat: [34.6721, 34.9931, 34.6889, 34.6873, 34.4354][i], lng: [135.5007, 135.7836, 135.8339, 135.526, 135.2441][i], coverImage: null, transportationToNext: "" },
        { placeName: ["法善寺横丁", "花见小路", "春日大社", "道顿堀游船", ""][i], description: ["幽静小巷", "艺伎文化", "万灯笼神社", "水上观景", ""][i], lat: [34.6679, 35.0038, 34.6818, 34.6687, 0][i], lng: [135.5017, 135.7785, 135.8485, 135.5014, 0][i], coverImage: null, transportationToNext: "" },
      ].filter(p => p.placeName),
    })),
  };
}

// ========== DeepSeek API call ==========
async function callDeepSeek(prompt: string): Promise<TripPlan | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 4000,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]) as TripPlan;
  } catch (e) {
    console.error("[deepseek]", e);
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const { prompt, context } = await request.json();
    const fullPrompt = context
      ? `${context} ${prompt?.trim() || ""}`.trim()
      : prompt?.trim();

    if (!fullPrompt) return NextResponse.json({ error: "请输入行程需求" }, { status: 400 });

    // All prompts go directly to DeepSeek — no gate
    const aiPlan = await callDeepSeek(fullPrompt);
    if (aiPlan) {
      return NextResponse.json({
        status: "complete",
        plan: aiPlan,
        aiGenerated: true,
        provider: "deepseek",
        categories: buildCategories(aiPlan),
      });
    }

    // Fallback (no API key / API error)
    const plan = fallbackPlan(fullPrompt);
    return NextResponse.json({
      status: "complete",
      plan,
      aiGenerated: false,
      categories: buildCategories(plan),
    });
  } catch (error) {
    console.error("[ai-planner]", error);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}

// ========== Build categorized display from AI data ==========
function buildCategories(plan: TripPlan) {
  const places = plan.days.flatMap((d) => d.places.map((p) => ({ ...p, day: d.day, theme: d.theme })));

  // Use AI-generated cost breakdown if available, otherwise estimate
  const cost = (plan.costBreakdown?.length || 0) > 0
    ? plan.costBreakdown.map((c) => ({
        item: c.category,
        amount: `¥${c.amount}`,
        note: c.note,
      }))
    : [
        { item: "交通", amount: `¥${plan.totalDays * 150}` },
        { item: "住宿", amount: `¥${plan.totalDays * 250}` },
        { item: "餐饮", amount: `¥${plan.totalDays * 120}` },
        { item: "门票", amount: "¥300" },
      ];

  return {
    spots: places.map((p) => ({ name: p.placeName, desc: p.description, day: p.day })),
    food: places.map((p) => ({ name: `${p.placeName}附近美食`, desc: p.description })),
    weather: plan.days.map((d) => ({
      day: `第${d.day}天`,
      desc: "请查看当地实时天气",
      icon: "🌤️",
    })),
    cost,
    routes: plan.days.map((d, i) => ({
      from: d.places[0]?.placeName || "出发地",
      to: d.places[d.places.length - 1]?.placeName || "目的地",
      transport: d.places[d.places.length - 1]?.transportationToNext || (i < plan.days.length - 1 ? "公共交通" : ""),
    })),
  };
}
