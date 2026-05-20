import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { ItemTypeIcon } from "./ItemTypeIcon";
import { Colors, ItemLabels } from "@/lib/constants";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ItemFormData) => void;
  initialData?: ItemFormData;
  dayNumber: number;
}

export interface ItemFormData {
  type: string;
  title: string;
  startTime: string;
  endTime: string;
  locationName: string;
  bookingRef: string;
  notes: string;
  dayNumber: number;
}

const itemTypes = ["flight", "hotel", "activity", "restaurant", "transport", "note"] as const;

export function ItemForm({ visible, onClose, onSave, initialData, dayNumber }: Props) {
  const colors = Colors.light;
  const [type, setType] = useState(initialData?.type || "activity");
  const [title, setTitle] = useState(initialData?.title || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  const [locationName, setLocationName] = useState(initialData?.locationName || "");
  const [bookingRef, setBookingRef] = useState(initialData?.bookingRef || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  function handleSave() {
    if (!title.trim()) return;
    onSave({ type, title: title.trim(), startTime, endTime, locationName, bookingRef, notes, dayNumber: initialData?.dayNumber || dayNumber });
    // Reset form
    setTitle(""); setStartTime(""); setEndTime(""); setLocationName("");
    setBookingRef(""); setNotes("");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>
            {initialData ? "编辑日程" : "添加日程"}
          </Text>
          <Pressable
            onPress={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.separator,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
          {/* Type selector */}
          <View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 10 }}>
              类型
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {itemTypes.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: type === t ? colors.tint + "18" : colors.surface,
                    borderWidth: 1,
                    borderColor: type === t ? colors.tint : colors.separator,
                  }}
                >
                  <ItemTypeIcon type={t} size={14} />
                  <Text style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: type === t ? colors.tint : colors.textPrimary,
                  }}>
                    {ItemLabels[t]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Title */}
          <View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>标题 *</Text>
            <TextInput
              placeholder="例如：新宿格兰贝尔酒店"
              value={title}
              onChangeText={setTitle}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                fontSize: 17,
                color: colors.textPrimary,
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Time */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>开始时间</Text>
              <TextInput
                placeholder="09:00"
                value={startTime}
                onChangeText={setStartTime}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 17,
                  color: colors.textPrimary,
                  fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
                }}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>结束时间</Text>
              <TextInput
                placeholder="17:00"
                value={endTime}
                onChangeText={setEndTime}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 17,
                  color: colors.textPrimary,
                  fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
                }}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Location */}
          <View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>地点</Text>
            <TextInput
              placeholder="搜索地点或输入地址"
              value={locationName}
              onChangeText={setLocationName}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                fontSize: 17,
                color: colors.textPrimary,
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Booking Ref */}
          <View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>预订号</Text>
            <TextInput
              placeholder="航班号 / 酒店订单号"
              value={bookingRef}
              onChangeText={setBookingRef}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                fontSize: 17,
                color: colors.textPrimary,
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Notes */}
          <View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 8 }}>备注</Text>
            <TextInput
              placeholder="添加备注信息..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 14,
                fontSize: 17,
                minHeight: 80,
                color: colors.textPrimary,
                textAlignVertical: "top",
                fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
              }}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Save button */}
          <Pressable
            onPress={handleSave}
            disabled={!title.trim()}
            style={{
              backgroundColor: title.trim() ? colors.tint : colors.separator,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: title.trim() ? "#FFFFFF" : colors.textSecondary,
              }}
            >
              {initialData ? "保存修改" : "添加日程"}
            </Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
