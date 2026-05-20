import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { ChevronDown, ChevronUp, MapPin, UtensilsCrossed, Cloud, Banknote, Route } from "lucide-react-native";

const SECTIONS = [
  { key: "spots", icon: MapPin, label: "推荐景点", color: "#FF9500" },
  { key: "food", icon: UtensilsCrossed, label: "必吃美食", color: "#FF3B30" },
  { key: "weather", icon: Cloud, label: "当地天气", color: "#007AFF" },
  { key: "cost", icon: Banknote, label: "预估花费", color: "#34C759" },
  { key: "routes", icon: Route, label: "交通路线", color: "#AF52DE" },
];

interface Props {
  categories: Record<string, any[]>;
}

export function AccordionResult({ categories }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ spots: true });

  const toggle = (key: string) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  return (
    <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
      {SECTIONS.map((section) => {
        const items = categories[section.key];
        if (!items || items.length === 0) return null;
        const isOpen = expanded[section.key];

        return (
          <View key={section.key} style={{ marginBottom: 6 }}>
            <Pressable
              onPress={() => toggle(section.key)}
              style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 4, gap: 8 }}
            >
              <section.icon size={16} color={section.color} />
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "600", flex: 1 }}>{section.label}</Text>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{items.length}项</Text>
              {isOpen ? <ChevronUp size={14} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.4)" />}
            </Pressable>

            {isOpen && (
              <View style={{ paddingLeft: 24, gap: 6 }}>
                {section.key === "cost"
                  ? items.map((item: any, i: number) => (
                      <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                        <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{item.item}</Text>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" }}>{item.amount}</Text>
                      </View>
                    ))
                  : section.key === "weather"
                  ? items.map((item: any, i: number) => (
                      <Text key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{item.icon} {item.day}: {item.desc}</Text>
                    ))
                  : section.key === "routes"
                  ? items.map((item: any, i: number) => (
                      <Text key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                        {item.from} → {item.to} {item.transport ? `· ${item.transport}` : ""}
                      </Text>
                    ))
                  : items.map((item: any, i: number) => (
                      <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 3 }}>
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: section.color }} />
                        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, flex: 1 }} numberOfLines={1}>{item.name}</Text>
                        {item.day && <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>D{item.day}</Text>}
                      </View>
                    ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
