import { ScrollView, View, Text } from "react-native";
import { BlurView } from "expo-blur";

interface DayItem { icon?: string; day?: string | number; desc: string; }

export function DayCardStrip({ title, icon, items, color }: {
  title: string; icon: string; items: DayItem[]; color: string;
}) {
  if (!items?.length) return null;

  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4, marginBottom: 6 }}>
        <Text style={{ fontSize: 14 }}>{icon}</Text>
        <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600", letterSpacing: 0.5 }}>{title}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {items.map((item, i) => (
          <BlurView key={i} intensity={50} tint="dark"
            style={{ borderRadius: 14, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)", padding: 12, minWidth: 120, maxWidth: 160 }}>
            {item.day && <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: "600", marginBottom: 4 }}>D{item.day}</Text>}
            {item.icon && <Text style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</Text>}
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, lineHeight: 18 }} numberOfLines={3}>{item.desc}</Text>
          </BlurView>
        ))}
      </ScrollView>
    </View>
  );
}
