import { useState } from "react";
import { View, Text, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Copy, Link, Share2, Image } from "lucide-react-native";
import { Colors } from "@/lib/constants";
import { apiRequest } from "@/lib/api";
import * as Clipboard from "expo-clipboard";

interface Props {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

export function ShareSheet({ visible, onClose, tripId, tripTitle }: Props) {
  const colors = Colors.light;
  const [shareUrl, setShareUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateLink() {
    if (shareUrl) {
      await Clipboard.setStringAsync(shareUrl);
      Alert.alert("已复制", "分享链接已复制到剪贴板");
    } else {
      setLoading(true);
      try {
        const data = await apiRequest(`/api/trips/${tripId}/share`, {
          method: "POST",
        });
        setShareUrl(data.shareUrl);
        await Clipboard.setStringAsync(data.shareUrl);
        Alert.alert("已复制", "分享链接已生成并复制到剪贴板");
      } catch (e: any) {
        Alert.alert("错误", e.message || "生成分享链接失败");
      } finally {
        setLoading(false);
      }
    }
  }

  async function disableShare() {
    try {
      await apiRequest(`/api/trips/${tripId}/share`, { method: "DELETE" });
      setShareUrl("");
      Alert.alert("已取消", "行程分享已关闭");
    } catch (e: any) {
      Alert.alert("错误", e.message || "操作失败");
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}>
        <SafeAreaView
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 36,
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.separator,
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.textPrimary }}>
              分享行程
            </Text>
            <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.separator, alignItems: "center", justifyContent: "center" }}>
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Text style={{ fontSize: 15, color: colors.textPrimary, fontWeight: "500", marginBottom: 8 }}>
            {tripTitle}
          </Text>

          {/* Share options */}
          <View style={{ gap: 12, marginTop: 16 }}>
            <Pressable
              onPress={generateLink}
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: colors.background,
                borderRadius: 14,
              }}
            >
              <Link size={22} color={colors.tint} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 17, color: colors.textPrimary, fontWeight: "500" }}>
                  {shareUrl ? "复制分享链接" : loading ? "生成中..." : "生成分享链接"}
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  任何拥有链接的人都可以查看
                </Text>
              </View>
              <Copy size={18} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: colors.background,
                borderRadius: 14,
              }}
            >
              <Image size={22} color="#FF9500" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 17, color: colors.textPrimary, fontWeight: "500" }}>
                  生成分享海报
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  Pro/Plus 专享
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
                backgroundColor: colors.background,
                borderRadius: 14,
              }}
            >
              <Share2 size={22} color="#34C759" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 17, color: colors.textPrimary, fontWeight: "500" }}>
                  分享到微信
                </Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                  发送给微信好友
                </Text>
              </View>
            </Pressable>
          </View>

          {shareUrl && (
            <Pressable
              onPress={disableShare}
              style={{ alignItems: "center", marginTop: 24, paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 15, color: "#FF3B30" }}>取消分享</Text>
            </Pressable>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}
