import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { PricingCard } from "@/components/subscription/PricingCard";
import { Colors } from "@/lib/constants";

export default function SubscriptionScreen() {
  const colors = Colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => apiRequest("/api/subscription"),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  const currentTier = data?.subscription?.tier || "free";
  const tiers = data?.tiers || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textPrimary }}>
          选择你的计划
        </Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22 }}>
          比 Tripsy 便宜 70% 以上。所有计划均包含核心行程管理功能。
        </Text>

        {tiers.map((tier: any) => (
          <PricingCard
            key={tier.id}
            tier={tier.id}
            name={tier.name}
            price={tier.price}
            yearlyPrice={tier.yearlyPrice}
            isCurrent={currentTier === tier.id}
            isRecommended={tier.id === "pro"}
            features={tier.features}
            onSelect={() => {
              if (tier.id === "free") return;
              Alert.alert(
                "升级订阅",
                `确认升级到 ${tier.name}？¥${tier.price}/月`,
                [
                  { text: "取消", style: "cancel" },
                  {
                    text: "确认",
                    onPress: () => Alert.alert("提示", "支付功能即将上线，敬请期待"),
                  },
                ]
              );
            }}
          />
        ))}

        <View style={{ marginTop: 20, padding: 16, backgroundColor: colors.surface, borderRadius: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 }}>
            为什么比 Tripsy 便宜？
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
            Tripsy Pro 定价 $4.99/月（约 ¥36/月），我们的 Pro 只要 ¥9.9/月，便宜 72%。我们希望让更多国内用户用上好用的行程管理工具。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
