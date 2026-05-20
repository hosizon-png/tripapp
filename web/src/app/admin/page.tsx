"use client";

import { useState, useEffect } from "react";

interface Stats {
  totalUsers: number;
  totalTrips: number;
  proUsers: number;
  plusUsers: number;
  revenue: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTrips: 0,
    proUsers: 0,
    plusUsers: 0,
    revenue: 0,
  });

  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "orders">("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetch("/api/admin/users").then((r) => r.json()),
          fetch("/api/admin/orders").then((r) => r.json()),
        ]);
        const u = usersRes.users || [];
        const o = ordersRes.orders || [];
        setUsers(u);
        setOrders(o);
        setStats({
          totalUsers: u.length,
          totalTrips: 0,
          proUsers: u.filter((x: any) => x.subscription?.tier === "pro").length,
          plusUsers: u.filter((x: any) => x.subscription?.tier === "plus").length,
          revenue: o
            .filter((x: any) => x.status === "paid")
            .reduce((s: number, x: any) => s + x.amount, 0),
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "system-ui" }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>行程助手 · 后台管理</h1>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, margin: "24px 0" }}>
        {[
          { label: "总用户", value: stats.totalUsers, color: "#007AFF" },
          { label: "Pro 用户", value: stats.proUsers, color: "#AF52DE" },
          { label: "Plus 用户", value: stats.plusUsers, color: "#FF9500" },
          { label: "总收入", value: `¥${stats.revenue.toFixed(2)}`, color: "#34C759" },
        ].map((s) => (
          <div key={s.label} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 20, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 13, color: "#8E8E93" }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#1C1C1E", marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #E5E5EA" }}>
        {(["users", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              padding: "10px 24px",
              border: "none",
              background: "none",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              color: activeTab === t ? "#007AFF" : "#8E8E93",
              borderBottom: activeTab === t ? "2px solid #007AFF" : "2px solid transparent",
              marginBottom: -2,
            }}
          >
            {t === "users" ? "用户列表" : "订单列表"}
          </button>
        ))}
      </div>

      {/* Users table */}
      {activeTab === "users" && (
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8F7F4", textAlign: "left" }}>
              <th style={{ padding: 12 }}>手机号</th>
              <th style={{ padding: 12 }}>昵称</th>
              <th style={{ padding: 12 }}>订阅</th>
              <th style={{ padding: 12 }}>注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} style={{ borderTop: "1px solid #E5E5EA" }}>
                <td style={{ padding: 12, fontSize: 14 }}>{u.phone || "-"}</td>
                <td style={{ padding: 12, fontSize: 14 }}>{u.name || "-"}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor:
                      u.subscription?.tier === "plus" ? "#AF52DE20" :
                      u.subscription?.tier === "pro" ? "#007AFF20" : "#E5E5EA",
                    color:
                      u.subscription?.tier === "plus" ? "#AF52DE" :
                      u.subscription?.tier === "pro" ? "#007AFF" : "#8E8E93",
                  }}>
                    {(u.subscription?.tier || "free").toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: 12, fontSize: 13, color: "#8E8E93" }}>
                  {new Date(u.createdAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Orders table */}
      {activeTab === "orders" && (
        <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8F7F4", textAlign: "left" }}>
              <th style={{ padding: 12 }}>订单 ID</th>
              <th style={{ padding: 12 }}>方案</th>
              <th style={{ padding: 12 }}>金额</th>
              <th style={{ padding: 12 }}>状态</th>
              <th style={{ padding: 12 }}>时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} style={{ borderTop: "1px solid #E5E5EA" }}>
                <td style={{ padding: 12, fontSize: 12, fontFamily: "monospace" }}>{o.id.slice(0, 8)}...</td>
                <td style={{ padding: 12, fontSize: 14, fontWeight: 600 }}>{o.tier.toUpperCase()} ({o.period})</td>
                <td style={{ padding: 12, fontSize: 14 }}>¥{o.amount}</td>
                <td style={{ padding: 12 }}>
                  <span style={{
                    padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                    backgroundColor: o.status === "paid" ? "#34C75920" : o.status === "refunded" ? "#FF3B3020" : "#FF950020",
                    color: o.status === "paid" ? "#34C759" : o.status === "refunded" ? "#FF3B30" : "#FF9500",
                  }}>
                    {{ paid: "已支付", pending: "待支付", cancelled: "已取消", refunded: "已退款" }[o.status as string] || o.status}
                  </span>
                </td>
                <td style={{ padding: 12, fontSize: 13, color: "#8E8E93" }}>
                  {new Date(o.createdAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === "orders" && orders.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#8E8E93" }}>暂无订单</div>
      )}
    </div>
  );
}
