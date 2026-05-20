export default function LandingPage() {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", backgroundColor: "#F8F7F4", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🌍</div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#1C1C1E", margin: 0, lineHeight: 1.2 }}>
          行程助手
        </h1>
        <p style={{ fontSize: 20, color: "#8E8E93", marginTop: 16, lineHeight: 1.6 }}>
          一站式行程管理工具，让你的每次旅行井井有条<br />
          时间线 · 天气 · 文档 · 3D 地球 · 分享
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 40 }}>
          <a href="#" style={{ backgroundColor: "#007AFF", color: "#FFF", padding: "16px 36px", borderRadius: 14, fontSize: 17, fontWeight: 600, textDecoration: "none" }}>
            下载 App
          </a>
          <a href="#features" style={{ backgroundColor: "#FFFFFF", color: "#007AFF", padding: "16px 36px", borderRadius: 14, fontSize: 17, fontWeight: 600, textDecoration: "none" }}>
            了解更多
          </a>
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ backgroundColor: "#FFFFFF", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#1C1C1E", textAlign: "center", marginBottom: 48 }}>功能一览</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { icon: "📅", title: "时间线日程", desc: "按天组织航班、酒店、景点，彩色卡片清晰展示" },
              { icon: "🌤️", title: "天气预报", desc: "目的地实时天气 + 7天预报，出行无忧" },
              { icon: "📎", title: "文档管理", desc: "机票、护照、签证文件一站式收纳" },
              { icon: "🗺️", title: "3D 地球", desc: "行程目的地在地球上直观呈现" },
              { icon: "🔗", title: "一键分享", desc: "生成分享链接，朋友家人随时查看你的行程" },
              { icon: "📋", title: "出行清单", desc: "待办事项检查清单，告别遗漏" },
            ].map((f) => (
              <div key={f.title} style={{ backgroundColor: "#F8F7F4", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1C1C1E", margin: 0 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#8E8E93", marginTop: 8, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#1C1C1E", marginBottom: 12 }}>定价</h2>
        <p style={{ fontSize: 17, color: "#8E8E93", marginBottom: 40 }}>比 Tripsy Pro ($4.99/月) 便宜 72%</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { name: "Free", price: "¥0", period: "永久", features: ["3个行程", "基础日程管理", "当天天气", "基本地球视图"], color: "#8E8E93" },
            { name: "Pro", price: "¥9.9", period: "/月", features: ["无限行程", "7天天气", "1GB存储", "日历导出", "分享海报"], color: "#007AFF", recommended: true },
            { name: "Plus", price: "¥19.9", period: "/月", features: ["Pro全部功能", "15天天气", "5GB存储", "AI行程建议", "优先客服"], color: "#AF52DE" },
          ].map((p) => (
            <div key={p.name} style={{ backgroundColor: "#FFF", borderRadius: 16, padding: 28, textAlign: "center", border: p.recommended ? "2px solid #007AFF" : "1px solid #E5E5EA", position: "relative" }}>
              {p.recommended && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", backgroundColor: "#007AFF", color: "#FFF", padding: "4px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                  推荐
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1C1C1E", marginTop: 8 }}>{p.name}</h3>
              <div style={{ fontSize: 36, fontWeight: 800, color: p.color, marginTop: 12 }}>
                {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: "#8E8E93" }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 24, textAlign: "left" }}>
                {p.features.map((f) => <li key={f} style={{ padding: "6px 0", fontSize: 14, color: "#1C1C1E" }}>✓ {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ backgroundColor: "#1C1C1E", padding: "40px 24px", textAlign: "center" }}>
        <p style={{ color: "#8E8E93", fontSize: 14 }}>行程助手 · 规划你的每一次旅行</p>
        <p style={{ color: "#48484A", fontSize: 12, marginTop: 8 }}>© 2025 TripApp. All rights reserved.</p>
      </div>
    </div>
  );
}
