import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, TextInput, Dimensions, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Heart, Star, MessageCircle, Sparkles } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Colors } from "@/lib/constants";

const { width: SW } = Dimensions.get("window");
const CARD_W = (SW - 48) / 2;

const MOCK_FEED = [
  { id:"1", title:"东京7日深度游", author:"旅行家小陈", likes:1234, image:"", h:260, avatar:"" },
  { id:"2", title:"成都美食地图", author:"吃货日记", likes:892, image:"", h:220, avatar:"" },
  { id:"3", title:"冰岛极光之旅", author:"极光猎人", likes:2456, image:"", h:300, avatar:"" },
  { id:"4", title:"曼谷周末漫游", author:"东南亚控", likes:567, image:"", h:200, avatar:"" },
  { id:"5", title:"京都红叶狩", author:"和风旅人", likes:1890, image:"", h:280, avatar:"" },
  { id:"6", title:"丽江慢生活", author:"逃离城市", likes:723, image:"", h:240, avatar:"" },
  { id:"7", title:"巴黎浪漫指南", author:"法式甜品", likes:3156, image:"", h:270, avatar:"" },
  { id:"8", title:"重庆8D魔幻", author:"山城漫步", likes:1102, image:"", h:210, avatar:"" },
];

const EMOJIS = ["🌸","🍜","🌌","🕌","🍁","🏔️","🗼","🌉"];

function BentoCard({ item, index }: { item: typeof MOCK_FEED[0]; index: number }) {
  const c = Colors.light;
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const [liked, setLiked] = useState(false);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const onPressIn = () => { scale.value = withSpring(0.96); };
  const onPressOut = () => { scale.value = withSpring(1); };
  const cardRouter = useRouter();
  const onPress = () => {
    scale.value = withSpring(0.96, {}, () => scale.value = withSpring(1));
    cardRouter.push(`/post/${item.id}` as any);
  };
  const toggleLike = () => {
    setLiked(!liked);
    heartScale.value = withSpring(1.4, {}, () => { heartScale.value = withSpring(1); });
  };

  return (
    <Animated.View style={[{ width: CARD_W, marginBottom: 16, borderRadius: 24, overflow: "hidden" }, animStyle]}>
      <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
        {/* Cover image */}
        <View style={{ width: "100%", height: item.h, backgroundColor: c.separator, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 48 }}>{EMOJIS[index % EMOJIS.length]}</Text>
        </View>

        {/* Gradient overlay */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, backgroundColor: "rgba(0,0,0,0.0)" }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
        </View>

        {/* Floating meta — bottom left */}
        <View style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }} numberOfLines={2}>{item.title}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: c.tint, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700" }}>{item.author[0]}</Text>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>{item.author}</Text>
            <Heart size={12} color="#FF3B30" fill="#FF3B30" />
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{item.likes}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DiscoveryScreen() {
  const router = useRouter();
  const c = Colors.light;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTag, setActiveTag] = useState("推荐");
  const [search, setSearch] = useState("");

  const renderItem = useCallback(({ item, index }: any) => (
    <BentoCard item={item} index={index} />
  ), []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : c.background }} edges={["top"]}>
      {/* Immersive header with search */}
      <BlurView intensity={80} tint={isDark ? "dark" : "light"}
        style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: isDark ? "rgba(0,0,0,0.5)" : "rgba(242,242,247,0.7)" }}>
        <Text style={{ fontSize: 28, fontWeight: "800", color: c.textPrimary, letterSpacing: -0.5 }}>发现</Text>
        {/* Search bar */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)", borderRadius: 14, paddingHorizontal: 14, height: 40 }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="搜索旅行灵感..." placeholderTextColor={c.textTertiary}
            value={search} onChangeText={setSearch}
            style={{ flex: 1, fontSize: 15, color: c.textPrimary }}
          />
        </View>
      </BlurView>

      {/* FAB — Floating Action Button */}
      <Pressable
        onPress={() => router.push("/trips/new")}
        style={{
          position: "absolute", bottom: 20, right: 20, width: 52, height: 52, borderRadius: 26,
          backgroundColor: c.tint, alignItems: "center", justifyContent: "center",
          shadowColor: c.tint, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10,
          elevation: 8,
        }}>
        <Text style={{ color: "#FFF", fontSize: 26, fontWeight: "300", marginTop: -1 }}>+</Text>
      </Pressable>

      {/* Waterfall feed */}
      <FlatList
        data={MOCK_FEED}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16, gap: 0 }}
        columnWrapperStyle={{ gap: 16, justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {["推荐","美食","文化","自然","城市"].map((tag) => (
              <Pressable key={tag} onPress={() => setActiveTag(tag)}
                style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: tag===activeTag ? c.tint : c.surface }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: tag===activeTag ? "#FFF" : c.textSecondary }}>{tag}</Text>
              </Pressable>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  );
}
