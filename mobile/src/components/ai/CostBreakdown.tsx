import { View, Text } from "react-native";

const COLORS: Record<string, string> = {
  "交通": "#007AFF", "住宿": "#AF52DE", "餐饮": "#FF9500", "门票": "#34C759",
};

export function CostBreakdown({ items }: { items: { item: string; amount: string }[] }) {
  if (!items?.length) return null;
  const totalMin = items.reduce((s, i) => s + parseInt(i.amount.replace(/[^0-9]/g, "")) || 300, 0);

  return (
    <View style={{ padding: 4 }}>
      <Text style={{ color: "#FFF", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, marginBottom: 8 }}>💰 预估花费</Text>
      <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>¥{totalMin}</Text>

      {/* Color progress bar */}
      <View style={{ flexDirection: "row", height: 4, borderRadius: 2, overflow: "hidden", marginTop: 10, gap: 2 }}>
        {items.map((it, i) => {
          const pct = Math.max(5, (items.length - i) * 22);
          const color = COLORS[it.item] || "#8E8E93";
          return <View key={i} style={{ flex: pct, backgroundColor: color, borderRadius: 2 }} />;
        })}
      </View>

      {/* Line items */}
      <View style={{ gap: 6, marginTop: 12 }}>
        {items.map((it, i) => (
          <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS[it.item] || "#8E8E93" }} />
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, flex: 1 }}>{it.item}</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "600" }}>{it.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
