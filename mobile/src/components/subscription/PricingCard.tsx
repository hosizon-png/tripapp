import { View, Text, Pressable } from "react-native";
import { Check } from "lucide-react-native";
import { Colors } from "@/lib/constants";

interface Props {
  tier: "free" | "pro" | "plus";
  name: string;
  price: number;
  yearlyPrice: number;
  isCurrent: boolean;
  isRecommended?: boolean;
  features: Record<string, any>;
  onSelect?: () => void;
}

const featureLabels: Record<string, string> = {
  maxTrips: "个行程",
  maxItemsPerTrip: "条日程/行程",
  maxStorageMB: "MB 存储",
  weatherDays: "天气预报",
  calendarExport: "日历导出",
  sharePoster: "分享海报",
  noAds: "无广告",
  prioritySupport: "优先客服",
};

function formatFeature(key: string, val: any): string {
  if (typeof val === "boolean") return val ? "✓" : "✗";
  if (key === "maxTrips" || key === "maxItemsPerTrip") {
    return val === Infinity ? "无限" : `${val}${featureLabels[key] || ""}`;
  }
  if (key === "maxStorageMB") return `${val}${featureLabels[key] || ""}`;
  if (key === "weatherDays") return `最多${val}天`;
  return `${val}`;
}

export function PricingCard({ tier, name, price, yearlyPrice, isCurrent, isRecommended, features, onSelect }: Props) {
  const colors = Colors.light;
  const isFree = tier === "free";

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        borderWidth: isCurrent ? 2 : isRecommended ? 2 : 0,
        borderColor: isCurrent ? colors.tint : isRecommended ? "#AF52DE" : "transparent",
      }}
    >
      {isRecommended && (
        <View
          style={{
            position: "absolute",
            top: -12,
            alignSelf: "center",
            backgroundColor: "#AF52DE",
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 13, fontWeight: "600" }}>推荐</Text>
        </View>
      )}

      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>
        {name}
      </Text>

      <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 12 }}>
        <Text style={{ fontSize: 36, fontWeight: "800", color: colors.textPrimary }}>
          ¥{price}
        </Text>
        {!isFree && (
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 4 }}>
            /月
          </Text>
        )}
        {isFree && (
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginLeft: 4 }}>
            永久免费
          </Text>
        )}
      </View>

      {!isFree && (
        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
          年付 ¥{yearlyPrice}/年 (省 ¥{Math.round(price * 12 - yearlyPrice)})
        </Text>
      )}

      {/* Feature list */}
      <View style={{ marginTop: 20, gap: 10 }}>
        {Object.entries(features).filter(([k]) => ["maxTrips", "maxItemsPerTrip", "maxStorageMB", "weatherDays", "calendarExport", "sharePoster", "noAds", "prioritySupport"].includes(k)).map(([key, val]) => {
          const boolVal = typeof val === "boolean";
          return (
            <View key={key} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Check
                size={16}
                color={boolVal && val ? "#34C759" : key === "maxTrips" || key === "maxItemsPerTrip" ? "#34C759" : colors.textSecondary}
              />
              <Text style={{ fontSize: 14, color: colors.textPrimary }}>
                {formatFeature(key, val)}
              </Text>
            </View>
          );
        })}
      </View>

      {!isCurrent && (
        <Pressable
          onPress={onSelect}
          style={{
            marginTop: 20,
            backgroundColor: isRecommended ? "#AF52DE" : colors.tint,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
            {isFree ? "当前方案" : `选择 ${name}`}
          </Text>
        </Pressable>
      )}

      {isCurrent && (
        <View
          style={{
            marginTop: 20,
            backgroundColor: colors.separator,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 16, fontWeight: "600" }}>
            当前方案
          </Text>
        </View>
      )}
    </View>
  );
}
