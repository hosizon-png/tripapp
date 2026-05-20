import { useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Dimensions, useColorScheme, Animated as RNAnimated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Fonts } from "@/lib/constants";
import { User, Plane, Heart, Star, Settings, Plus, MapPin, CreditCard } from "lucide-react-native";
import { useTrips } from "@/hooks/useTrips";
import { useAuthStore } from "@/stores/authStore";
import { Colors } from "@/lib/constants";

const { width: SW } = Dimensions.get("window");
const HEADER_H = 200;
const AVATAR_S = 80;

export default function ProfileDashboardScreen() {
  const router = useRouter();
  const c = Colors.light;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, isAuthenticated } = useAuthStore();
  const { data } = useTrips();
  const trips = data?.trips || [];

  const [activeTab, setActiveTab] = useState(0);
  const scrollY = useRef(new RNAnimated.Value(0)).current;

  const headerScale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.3, 1], extrapolateLeft: "extend", extrapolateRight: "clamp" });
  const headerTranslate = scrollY.interpolate({ inputRange: [0, HEADER_H], outputRange: [0, -HEADER_H / 3], extrapolate: "clamp" });
  const avatarTranslate = scrollY.interpolate({ inputRange: [0, HEADER_H - 60], outputRange: [0, -60], extrapolate: "clamp" });

  const tabs = ["我的行程", "喜欢", "收藏"];

  const recentTrip = trips[0];
  const historyTrips = trips.slice(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? "#000" : c.background }} edges={["top"]}>
      <RNAnimated.ScrollView
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== Parallax Header ====== */}
        <RNAnimated.View style={{ height: HEADER_H, transform: [{ translateY: headerTranslate }], overflow: "hidden" }}>
          <RNAnimated.View style={{ width: "100%", height: "100%", transform: [{ scale: headerScale }] }}>
            <View style={{ flex: 1, backgroundColor: c.tint + "20", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 64 }}>🗺️</Text>
            </View>
          </RNAnimated.View>
          {/* Gradient bottom */}
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "rgba(0,0,0,0.4)" }} />
        </RNAnimated.View>

        {/* Stats row */}
        {isAuthenticated && (
          <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: c.separator }}>
            {[
              { value: trips.length.toString(), label: "行程" },
              { value: "28", label: "天数" },
              { value: "156", label: "获赞" },
              { value: "42", label: "关注" },
            ].map((s) => (
              <View key={s.label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: c.textPrimary }}>{s.value}</Text>
                <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ====== Sticky Tabs ====== */}
        <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: c.separator, backgroundColor: c.surface }}>
          {tabs.map((tab, i) => (
            <Pressable key={i} onPress={() => setActiveTab(i)}
              style={{ flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: activeTab === i ? 2 : 0, borderBottomColor: c.tint }}>
              <Text style={{ fontSize: 14, fontWeight: activeTab === i ? "700" : "500", color: activeTab === i ? c.tint : c.textSecondary }}>{tab}</Text>
            </Pressable>
          ))}
        </View>

        {/* ====== Tab 0: My Trips ====== */}
        {activeTab === 0 && (
          <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
            {/* Highlight card — recent trip */}
            {recentTrip ? (
              <Pressable onPress={() => router.push(`/trips/${recentTrip.id}`)}
                style={{ borderRadius: 20, overflow: "hidden", marginBottom: 16, height: 200 }}>
                <View style={{ flex: 1, backgroundColor: c.separator, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 56 }}>🌍</Text>
                </View>
                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "rgba(0,0,0,0.5)" }}>
                  <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700" }}>{recentTrip.title}</Text>
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <MapPin size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>{recentTrip.destination || "未设置"}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <CreditCard size={12} color="rgba(255,255,255,0.7)" />
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>¥0</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ) : (
              <Pressable onPress={() => router.push("/(tabs)/globe")}
                style={{ borderRadius: 20, borderWidth: 1.5, borderColor: c.accent, borderStyle: "dashed", height: 160, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 40 }}>🌍</Text>
                <Text style={{ color: c.textPrimary, fontSize: 17, fontWeight: "700", marginTop: 8, fontFamily: Fonts.display }}>开始您的探索吧</Text>
                <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }}>AI 将为您规划完美行程</Text>
              </Pressable>
            )}

            {/* Trip history list */}
            {historyTrips.map((trip: any) => (
              <Pressable key={trip.id} onPress={() => router.push(`/trips/${trip.id}`)}
                style={{ flexDirection: "row", alignItems: "center", padding: 14, backgroundColor: c.surface, borderRadius: 16, marginBottom: 8 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: c.separator, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 20 }}>🌍</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: c.textPrimary }}>{trip.title}</Text>
                  <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>{trip.destination || "未设置目的地"}</Text>
                </View>
                <Text style={{ fontSize: 13, color: c.textTertiary }}>
                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) : ""}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* ====== Tab 1: Likes (user's own trips as grid) ====== */}
        {activeTab === 1 && (
          <View style={{ padding: 16 }}>
            {trips.length > 0 ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {trips.map((trip: any) => (
                  <Pressable key={trip.id} onPress={() => router.push(`/trips/${trip.id}`)}
                    style={{ width: (SW - 40) / 3, height: (SW - 40) / 3, backgroundColor: c.separator, alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                    <Text style={{ fontSize: 28 }}>🌍</Text>
                    <Text style={{ fontSize: 10, color: c.textSecondary, marginTop: 2, textAlign: "center" }} numberOfLines={1}>{trip.title}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Heart size={40} color={c.textTertiary} />
                <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 12 }}>还没有喜欢的行程</Text>
              </View>
            )}
          </View>
        )}

        {/* ====== Tab 2: Favorites Grid ====== */}
        {activeTab === 2 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 4 }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View key={i}
                style={{ width: (SW - 40) / 3, height: (SW - 40) / 3, backgroundColor: c.separator, alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
                <Text style={{ fontSize: 28 }}>{["🏯","🍜","🏔️","🌊","🏛️","🌸","🎭","🏖️","🗼"][i]}</Text>
              </View>
            ))}
          </View>
        )}
      </RNAnimated.ScrollView>

      {/* Profile card — floating above header bottom */}
      <View style={{ position: "absolute", top: HEADER_H - 40, left: 0, right: 0, alignItems: "center", zIndex: 10 }}>
        <View style={{ width: AVATAR_S, height: AVATAR_S, borderRadius: AVATAR_S / 2, borderWidth: 3, borderColor: "#FFF", backgroundColor: c.tint, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 }}>
          <User size={36} color="#FFF" />
        </View>
        <View style={{ width: 32, height: 2, backgroundColor: c.accent, borderRadius: 1, marginBottom: 4 }} />
        <Text style={{ fontSize: 22, fontWeight: "900", color: c.textPrimary, marginTop: 8, fontFamily: Fonts.display }}>
          {isAuthenticated ? (user?.name || "旅行者") : "未登录"}
        </Text>
        <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>
          {isAuthenticated ? (user?.tier === "free" ? "Free 计划" : user?.tier?.toUpperCase()) : "点击登录同步行程"}
        </Text>
      </View>
    </SafeAreaView>
  );
}
