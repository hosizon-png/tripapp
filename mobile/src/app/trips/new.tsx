import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Calendar, MapPin } from "lucide-react-native";
import { Colors } from "@/lib/constants";
import { useCreateTrip } from "@/hooks/useTrips";

export default function NewTripScreen() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const colors = Colors.light;

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!title.trim()) { Alert.alert("提示", "请输入行程标题"); return; }
    if (!destination.trim()) { Alert.alert("提示", "请输入目的地"); return; }
    if (!startDate) { Alert.alert("提示", "请选择开始日期"); return; }

    setLoading(true);
    try {
      const result: any = await createTrip.mutateAsync({
        title: title.trim(),
        destination: destination.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
      });
      if (result?.trip?.id) {
        router.replace(`/trips/${result.trip.id}`);
      } else {
        console.error("Create trip missing id:", result);
        Alert.alert("创建成功", "行程已创建");
        router.back();
      }
    } catch (e: any) {
      console.error("[create-trip]", e);
      Alert.alert("创建失败", e?.message || e?.error || "请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textPrimary, fontFamily: Platform.OS === "ios" ? "System" : "sans-serif" }}>
          新建行程
        </Text>

        {/* Title */}
        <View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>
            行程标题 *
          </Text>
          <TextInput
            placeholder="例如：东京美食之旅"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              fontSize: 17,
              color: colors.textPrimary,
              fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
            }}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Destination */}
        <View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>目的地</Text>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16 }}>
            <MapPin size={18} color={colors.textSecondary} />
            <TextInput
              placeholder="城市名称"
              value={destination}
              onChangeText={setDestination}
              style={{
                flex: 1,
                padding: 16,
                fontSize: 17,
                color: colors.textPrimary,
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Dates */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>开始日期</Text>
            <TextInput
              placeholder="2025-05-20"
              value={startDate}
              onChangeText={setStartDate}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: colors.textPrimary,
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>结束日期</Text>
            <TextInput
              placeholder="2025-05-25"
              value={endDate}
              onChangeText={setEndDate}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                fontSize: 15,
                color: colors.textPrimary,
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Description */}
        <View>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>描述（选填）</Text>
          <TextInput
            placeholder="这次旅行有什么特别的..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              fontSize: 17,
              minHeight: 80,
              textAlignVertical: "top",
              color: colors.textPrimary,
              fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
            }}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Create button */}
        <Pressable
          onPress={handleCreate}
          disabled={loading || !title.trim()}
          style={{
            backgroundColor: title.trim() ? colors.tint : colors.separator,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 12,
          }}
        >
          <Text style={{
            fontSize: 17,
            fontWeight: "600",
            color: title.trim() ? "#FFFFFF" : colors.textSecondary,
          }}>
            {loading ? "创建中..." : "创建行程"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
