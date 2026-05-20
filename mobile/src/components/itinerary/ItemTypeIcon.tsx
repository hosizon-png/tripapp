import { View } from "react-native";
import { Plane, Building, Ticket, UtensilsCrossed, Train, StickyNote } from "lucide-react-native";
import { ItemColors } from "@/lib/constants";

const icons = { flight: Plane, hotel: Building, activity: Ticket, restaurant: UtensilsCrossed, transport: Train, note: StickyNote } as const;

export function ItemTypeIcon({ type, size = 16 }: { type: string; size?: number }) {
  const morandi = ItemColors[type as keyof typeof ItemColors] || ItemColors.note;
  const Icon = icons[type as keyof typeof icons] || StickyNote;
  return (
    <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: morandi.bg, alignItems: "center", justifyContent: "center" }}>
      <Icon size={size} color={morandi.fg} />
    </View>
  );
}
