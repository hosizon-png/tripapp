import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { CheckSquare, Plus, Check } from "lucide-react-native";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Colors } from "@/lib/constants";

export default function ChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const colors = Colors.light;
  const [newItem, setNewItem] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["trips", id, "checklists"],
    queryFn: () => apiRequest(`/api/trips/${id}`),
    enabled: !!id,
    select: (d: any) => d.trip?.checklists?.[0]?.items || [],
  });

  const items = data || [];

  async function handleAdd() {
    if (!newItem.trim()) return;
    try {
      await apiRequest(`/api/trips/${id}/checklists`, {
        method: "POST",
        body: { title: "出行清单", items: [{ content: newItem.trim() }] },
      });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
      setNewItem("");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", padding: 16, gap: 8 }}>
        <TextInput
          placeholder="添加待办事项..."
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAdd}
          style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14, fontSize: 15, color: colors.textPrimary }}
          placeholderTextColor={colors.textSecondary}
        />
        <Pressable
          onPress={handleAdd}
          style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" }}
        >
          <Plus size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {items.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <CheckSquare size={40} color={colors.textSecondary} />
              <Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 12 }}>
                清单是空的，开始添加吧
              </Text>
            </View>
          ) : (
            items.map((item: any) => (
              <Pressable
                key={item.id}
                style={{ flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: colors.surface, borderRadius: 12, gap: 12 }}
              >
                <View style={{
                  width: 24, height: 24, borderRadius: 6, borderWidth: 2,
                  borderColor: item.isCompleted ? "#34C759" : colors.separator,
                  backgroundColor: item.isCompleted ? "#34C759" : "transparent",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {item.isCompleted && <Check size={14} color="#FFF" />}
                </View>
                <Text style={{
                  fontSize: 15, color: item.isCompleted ? colors.textSecondary : colors.textPrimary,
                  textDecorationLine: item.isCompleted ? "line-through" : "none", flex: 1,
                }}>
                  {item.content}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
