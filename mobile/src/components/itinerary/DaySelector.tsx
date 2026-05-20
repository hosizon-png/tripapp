import { ScrollView, View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { Colors } from "@/lib/constants";

interface Props { totalDays: number; selectedDay: number; onSelectDay: (d: number) => void; startDate?: string; }

export function DaySelector({ totalDays, selectedDay, onSelectDay, startDate }: Props) {
  const c = Colors.light;
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <View style={{ paddingVertical: 10 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {days.map((day) => {
          const sel = day === selectedDay;
          return (
            <Pressable key={day} onPress={() => onSelectDay(day)}>
              <BlurView intensity={sel ? 80 : 40} tint="light" style={{ borderRadius: 18, overflow: "hidden", backgroundColor: sel ? Colors.light.tint + "18" : "rgba(255,255,255,0.5)", borderWidth: sel ? 0.5 : 0, borderColor: sel ? Colors.light.tint + "30" : "transparent", paddingHorizontal: 16, paddingVertical: 10, minWidth: 72, alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontWeight: "600", color: sel ? Colors.light.tint : c.textSecondary }}>第{day}天</Text>
                <Text style={{ fontSize: 10, color: sel ? Colors.light.tint : c.textTertiary, marginTop: 2 }}>
                  {(() => { if (!startDate) return ""; const d = new Date(startDate); d.setDate(d.getDate() + day - 1); return `${d.getMonth() + 1}/${d.getDate()}`; })()}
                </Text>
              </BlurView>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
