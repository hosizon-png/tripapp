/**
 * ====== CREATE TRIP DEBUG GUIDE ======
 *
 * 当"新建行程"失败时，按以下 Checklist 逐项排查：
 *
 * CHECKLIST:
 * □ 1. 前端请求是否发出？
 *    → 打开浏览器 F12 → Network 标签 → 查找 POST /api/trips
 *    → 查看 Request Payload：应包含 { title, destination, startDate }
 *    → 查看 Response：状态码 201=成功, 400=参数错误, 401=未登录, 500=服务端错误
 *
 * □ 2. 用户是否已登录？
 *    → Network 中查看请求是否有 Authorization: Bearer <token>
 *    → 无 Token → 检查 authStore 中 isAuthenticated 状态
 *    → Token 过期 → 检查 /api/auth/refresh 是否返回新 Token
 *
 * □ 3. 免费档是否超限？
 *    → Response 中是否有 code: "UPGRADE_REQUIRED"
 *    → 免费版最多 3 个行程 → 升级到 Pro 或删除旧行程
 *
 * □ 4. 后端 API 是否正常？
 *    → console.log 后端 /api/trips POST handler 的请求体
 *    → 检查 SQLite 数据库：sqlite3 dev.db "SELECT COUNT(*) FROM Trip"
 *
 * □ 5. CORS 问题？
 *    → 前端 origin (localhost:19001) 是否在 CORS 白名单
 *    → 检查 middleware.ts 中 Access-Control-Allow-Origin 配置
 */

// ========== Frontend Debug Interceptor ==========
export function debugCreateTrip() {
  if (typeof window === "undefined") return;

  const orig = window.fetch;
  window.fetch = async function (...args: any[]) {
    const [url, options] = args;
    const isCreateTrip = typeof url === "string" && url.includes("/api/trips") && options?.method === "POST";

    if (isCreateTrip) {
      console.group("🔍 [DEBUG] Create Trip Request");
      console.log("URL:", url);
      console.log("Payload:", options?.body ? JSON.parse(options.body as string) : "empty");
      console.log("Token:", options?.headers?.["Authorization"] ? "✓ present" : "✗ MISSING");
    }

    try {
      const res = await orig.apply(window, args as any);
      if (isCreateTrip) {
        const clone = res.clone();
        const data = await clone.json();
        console.log("Status:", res.status, res.statusText);
        console.log("Response:", data);
        if (res.status >= 400) console.error("❌ Create trip FAILED:", data.error || data.message);
        else console.log("✅ Create trip SUCCESS:", data.trip?.id);
        console.groupEnd();
        return res;
      }
      return res;
    } catch (e) {
      if (isCreateTrip) {
        console.error("❌ Network error:", e);
        console.groupEnd();
      }
      throw e;
    }
  };

  console.log("✅ Debug interceptor installed. Check F12 Console for create-trip logs.");
}

// ========== Backend Debug Logger ==========
// Add to /api/trips/route.ts POST handler:
/*
export async function POST(request: Request) {
  console.log("[DEBUG] POST /api/trips - Body:", await request.clone().text());
  // ... rest of handler
}
*/

// ========== Quick DB Check ==========
// Run in terminal:
//   cd /Users/heshuaizhen/tripapp/web
//   sqlite3 dev.db "SELECT id, title, destination, userId FROM Trip ORDER BY createdAt DESC LIMIT 5;"
//   sqlite3 dev.db "SELECT COUNT(*) FROM User;"
//   sqlite3 dev.db "SELECT tier FROM Subscription LIMIT 5;"
