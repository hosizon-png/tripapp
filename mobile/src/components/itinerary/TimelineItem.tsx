import { View, Text, Pressable } from "react-native";
import { Plane, Building, Ticket, UtensilsCrossed, Train, StickyNote } from "lucide-react-native";
import { ItemColors, Colors } from "@/lib/constants";

const icons: Record<string, any> = { flight: Plane, hotel: Building, activity: Ticket, restaurant: UtensilsCrossed, transport: Train, note: StickyNote };

interface Props {
  item: { id: string; type: string; title: string; description?: string; startTime?: string; endTime?: string; locationName?: string; bookingRef?: string; notes?: string };
  isLast?: boolean;
  onPress?: () => void;
}

export function TimelineItem({ item, isLast, onPress }: Props) {
  const c = Colors.light;
  const morandi = ItemColors[item.type as keyof typeof ItemColors] || ItemColors.note;
  const Icon = icons[item.type] || StickyNote;

  return (
    <View style={{ flexDirection: "row" }}>
      <View style={{ width: 44, alignItems: "center" }}>
        <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: morandi.bg, alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={morandi.fg} />
        </View>
        {!isLast && <View style={{ width: 1.5, flex: 1, backgroundColor: c.separator }} />}
      </View>
      <Pressable onPress={onPress} style={{ flex: 1, marginBottom: isLast ? 0 : 10 }}>
        {item.startTime ? (
          <Text style={{ fontSize: 12, color: c.textTertiary, marginBottom: 6, fontWeight: "500" }}>
            {item.startTime}{item.endTime ? ` - ${item.endTime}` : ""}
          </Text>
        ) : null}
        <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: c.textPrimary }} numberOfLines={1}>{item.title}</Text>
          {item.locationName ? <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4 }} numberOfLines={1}>📍 {item.locationName}</Text> : null}
          {item.bookingRef ? (
            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ height: 4, width: 4, borderRadius: 2, backgroundColor: morandi.fg }} />
              <Text style={{ fontSize: 12, color: morandi.fg, fontWeight: "500" }}>预订号: {item.bookingRef}</Text>
            </View>
          ) : null}
          {item.notes ? <Text style={{ fontSize: 12, color: c.textTertiary, marginTop: 8, lineHeight: 17 }} numberOfLines={2}>{item.notes}</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}
