import { View, Text, Pressable } from "react-native";
import { BlurView } from "expo-blur";
import { TimelineItem } from "./TimelineItem";
import { Colors } from "@/lib/constants";

interface ItineraryItem { id: string; tripId: string; dayNumber: number; type: string; title: string; description?: string; startTime?: string; endTime?: string; locationName?: string; address?: string; bookingRef?: string; notes?: string; orderIndex: number; }

interface Props { items: ItineraryItem[]; selectedDay: number; onAddItem: () => void; onItemPress: (item: ItineraryItem) => void; }

export function Timeline({ items, selectedDay, onAddItem, onItemPress }: Props) {
  const c = Colors.light;
  const dayItems = items.filter((i) => i.dayNumber === selectedDay);

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 4 }}>
      {dayItems.length === 0 ? (
        <View style={{ alignItems: "center", paddingVertical: 48 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
          <Text style={{ fontSize: 17, fontWeight: "600", color: c.textPrimary }}>还没有日程</Text>
          <Text style={{ fontSize: 14, color: c.textSecondary, marginTop: 4, textAlign: "center" }}>点击下方添加第{selectedDay}天的安排</Text>
        </View>
      ) : (
        dayItems.map((item, index) => (
          <TimelineItem key={item.id} item={item} isLast={index === dayItems.length - 1} onPress={() => onItemPress(item)} />
        ))
      )}

      <Pressable onPress={onAddItem} style={{ flexDirection: "row", alignItems: "center", paddingLeft: 44, paddingTop: dayItems.length === 0 ? 0 : 16, paddingBottom: 40 }}>
        <BlurView intensity={30} tint="light" style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.3)", borderWidth: 1, borderColor: c.separator, borderStyle: "dashed" }}>
          <Text style={{ fontSize: 16, color: c.textTertiary }}>+</Text>
        </BlurView>
        <Text style={{ fontSize: 14, color: c.textTertiary, marginLeft: 10 }}>添加日程</Text>
      </Pressable>
    </View>
  );
}
