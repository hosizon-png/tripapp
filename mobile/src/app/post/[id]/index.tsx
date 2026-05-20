import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { ChevronLeft, Heart, Star, MessageCircle, Share2 } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Colors } from "@/lib/constants";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = Colors.light;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 3000) + 500);
  const heartScale = useSharedValue(1);

  const heartAnim = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  function toggleLike() {
    setLiked((l) => {
      setLikes((c) => (l ? c - 1 : c + 1));
      return !l;
    });
    heartScale.value = withSpring(1.5, {}, () => { heartScale.value = withSpring(1); });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView style={{ flex: 1 }}>
        {/* Image swiper placeholder */}
        <View style={{ height: 420, backgroundColor: c.separator, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 80 }}>🏯</Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, position: "absolute", bottom: 16 }}>1 / 3</Text>
        </View>

        {/* Author + Content */}
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.tint, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "700" }}>旅</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: c.textPrimary, fontSize: 15, fontWeight: "600" }}>旅行家小陈</Text>
              <Text style={{ color: c.textTertiary, fontSize: 12, marginTop: 1 }}>2小时前</Text>
            </View>
            <Pressable style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: c.tint }}>
              <Text style={{ color: c.tint, fontSize: 13, fontWeight: "600" }}>关注</Text>
            </Pressable>
          </View>
          <Text style={{ color: c.textPrimary, fontSize: 15, lineHeight: 22, marginTop: 14 }}>东京七日深度游，从浅草寺到秋叶原，每一步都是风景。推荐住在银座附近，地铁去哪都方便。</Text>
        </View>
      </ScrollView>

      {/* Back button */}
      <Pressable onPress={() => router.back()} style={{ position: "absolute", top: 50, left: 16 }}>
        <BlurView intensity={70} tint="dark" style={{ width: 36, height: 36, borderRadius: 18, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)" }}>
          <ChevronLeft size={20} color="#FFF" />
        </BlurView>
      </Pressable>

      {/* Right action bar */}
      <View style={{ position: "absolute", right: 16, bottom: 120, gap: 20, alignItems: "center" }}>
        <Pressable onPress={toggleLike} style={{ alignItems: "center" }}>
          <Animated.View style={heartAnim}>
            <Heart size={30} color={liked ? "#FF3B30" : "#FFF"} fill={liked ? "#FF3B30" : "transparent"} />
          </Animated.View>
          <Text style={{ color: "#FFF", fontSize: 11, marginTop: 2 }}>{likes}</Text>
        </Pressable>
        <Pressable style={{ alignItems: "center" }}>
          <Star size={28} color="#FFF" />
          <Text style={{ color: "#FFF", fontSize: 11, marginTop: 2 }}>收藏</Text>
        </Pressable>
        <Pressable style={{ alignItems: "center" }}>
          <MessageCircle size={28} color="#FFF" />
          <Text style={{ color: "#FFF", fontSize: 11, marginTop: 2 }}>评论</Text>
        </Pressable>
        <Pressable style={{ alignItems: "center" }}>
          <Share2 size={26} color="#FFF" />
          <Text style={{ color: "#FFF", fontSize: 11, marginTop: 2 }}>分享</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
