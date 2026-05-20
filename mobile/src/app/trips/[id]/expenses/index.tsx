import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Banknote } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Colors } from "@/lib/constants";

export default function ExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = Colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["trips", id, "expenses"],
    queryFn: () => apiRequest(`/api/trips/${id}`),
    enabled: !!id,
    select: (d: any) => d.trip?.expenses || [],
  });

  const expenses = data || [];
  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 20, alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.separator }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>总花费</Text>
        <Text style={{ fontSize: 36, fontWeight: "700", color: colors.textPrimary, marginTop: 4 }}>
          ¥{total.toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Banknote size={40} color={colors.textSecondary} />
            <Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 12 }}>还没有费用记录</Text>
          </View>
        }
        renderItem={({ item }: any) => (
          <View style={{ flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: colors.surface, borderRadius: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "500", color: colors.textPrimary }}>
                {item.description || item.category}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {item.category} · {item.date ? new Date(item.date).toLocaleDateString("zh-CN") : ""}
              </Text>
            </View>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary }}>
              {item.currency} {item.amount}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
