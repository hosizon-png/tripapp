import { useState, useMemo, useRef, useEffect } from "react";
import { View, ScrollView, Animated, ActivityIndicator, Text, Pressable, Image, Dimensions, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Fonts } from "@/lib/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { ChevronLeft, Share2, Pencil, Map, Paperclip, CheckSquare, Banknote } from "lucide-react-native";
import { Colors } from "@/lib/constants";
import { useTrip, useAddItem } from "@/hooks/useTrips";
import { DaySelector } from "@/components/itinerary/DaySelector";
import { Timeline } from "@/components/itinerary/Timeline";
import { ItemForm, ItemFormData } from "@/components/itinerary/ItemForm";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { ShareSheet } from "@/components/trips/ShareSheet";

const { height: SCREEN_H } = Dimensions.get("window");
const HEADER_H = SCREEN_H * 0.42;
const NAV_H = 56;

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = Colors.light;
  const scrollY = useRef(new Animated.Value(0)).current;
  const { data, isLoading } = useTrip(id || "");
  const addItem = useAddItem();
  const trip = data?.trip;
  const items = trip?.items || [];

  const [selectedDay, setSelectedDay] = useState(1);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);

  const totalDays = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return Math.max(1, ...[...items.map((i: any) => i.dayNumber), 1]);
    const s = new Date(trip.startDate); const e = new Date(trip.endDate);
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000) + 1);
  }, [trip, items]);

  // Parallax values
  const headerTranslate = scrollY.interpolate({ inputRange: [0, HEADER_H], outputRange: [0, -HEADER_H * 0.3], extrapolate: "clamp" });
  const imageScale = scrollY.interpolate({ inputRange: [-100, 0], outputRange: [1.15, 1], extrapolateLeft: "extend", extrapolateRight: "clamp" });
  const headerOpacity = scrollY.interpolate({ inputRange: [HEADER_H - 80, HEADER_H - 20], outputRange: [0, 1], extrapolate: "clamp" });

  async function handleAddItem(formData: ItemFormData) {
    if (!id) return;
    try { await addItem.mutateAsync({ tripId: id, ...formData }); setShowItemForm(false); setEditingItem(null); } catch (e) { console.error(e); }
  }

  if (isLoading) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background }}><ActivityIndicator size="large" color={c.tint} /></View>;
  if (!trip) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.background }}><Text style={{ color: c.textSecondary }}>行程不存在</Text></View>;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* ====== Parallax Header ====== */}
      <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, height: HEADER_H, transform: [{ translateY: headerTranslate }], zIndex: 0 }}>
        <Animated.View style={{ width: "100%", height: "100%", transform: [{ scale: imageScale }] }}>
          {trip.coverImage ? (
            <Image source={{ uri: trip.coverImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.separator }}>
              <Text style={{ fontSize: 72 }}>🌍</Text>
            </View>
          )}
        </Animated.View>
        {/* Gradient overlay */}
        <Animated.View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 100, opacity: headerOpacity }}>
          <BlurView intensity={60} tint="dark" style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }} />
        </Animated.View>
      </Animated.View>

      {/* ====== Floating Glass Nav Buttons ====== */}
      <SafeAreaView edges={["top"]} style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 6 }}>
        <Pressable onPress={() => router.back()}>
          <BlurView intensity={70} tint="dark" style={{ width: 40, height: 40, borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" }}>
            <ChevronLeft size={22} color="#FFF" />
          </BlurView>
        </Pressable>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => setShowShare(true)}>
            <BlurView intensity={70} tint="dark" style={{ width: 40, height: 40, borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" }}>
              <Share2 size={18} color="#FFF" />
            </BlurView>
          </Pressable>
          <Pressable onPress={() => router.push(`/trips/${id}/edit`)}>
            <BlurView intensity={70} tint="dark" style={{ width: 40, height: 40, borderRadius: 20, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.25)" }}>
              <Pencil size={18} color="#FFF" />
            </BlurView>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ====== Scrollable Content ====== */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: HEADER_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
      >
        {/* Title zone — Editorial serif typography */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Gold accent line */}
          <View style={{ width: 40, height: 3, backgroundColor: c.accent, borderRadius: 2, marginBottom: 16 }} />
          <Text style={{ fontSize: 38, fontWeight: "900", color: c.textPrimary, letterSpacing: -0.5, fontFamily: Fonts.display, lineHeight: 44 }}>
            {trip.title}
          </Text>
          <Text style={{ fontSize: 15, color: c.accent, marginTop: 10, fontFamily: Fonts.body, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {trip.startDate ? new Date(trip.startDate).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : ""}
            {trip.endDate && trip.startDate !== trip.endDate ? " — " + new Date(trip.endDate).toLocaleDateString("zh-CN", { month: "long", day: "numeric" }) : ""}
          </Text>
          {trip.destination && (
            <Text style={{ fontSize: 16, color: c.textSecondary, marginTop: 8, fontStyle: "italic", fontFamily: Fonts.body }}>
              {trip.destination}
            </Text>
          )}
        </View>

        {/* Weather */}
        <WeatherWidget destination={trip.destination} cityId={trip.cityId} startDate={trip.startDate} />

        {/* Day Selector */}
        <View style={{ marginTop: 16 }}>
          <DaySelector totalDays={Math.max(totalDays, Math.max(...items.map((i: any) => i.dayNumber), 1))} selectedDay={selectedDay} onSelectDay={setSelectedDay} startDate={trip.startDate} />
        </View>

        {/* Timeline */}
        <Timeline items={items} selectedDay={selectedDay} onAddItem={() => { setEditingItem(null); setShowItemForm(true); }} onItemPress={(item) => { setEditingItem(item); setShowItemForm(true); }} />
      </Animated.ScrollView>

      {/* ====== Glass Bottom Bar ====== */}
      <BlurView intensity={80} tint="light" style={{ position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", paddingVertical: 10, paddingBottom: 28, borderTopWidth: 0.5, borderTopColor: c.glassBorder, backgroundColor: c.glass }}>
        {[
          { icon: Map, label: "地图", route: `/trips/${id}/map` },
          { icon: Paperclip, label: "文档", route: `/trips/${id}/documents` },
          { icon: CheckSquare, label: "清单", route: `/trips/${id}/checklist` },
          { icon: Banknote, label: "费用", route: `/trips/${id}/expenses` },
        ].map((b) => (
          <Pressable key={b.label} onPress={() => router.push(b.route as any)} style={{ alignItems: "center", gap: 4 }}>
            <b.icon size={22} color={c.textSecondary} />
            <Text style={{ fontSize: 11, color: c.textSecondary }}>{b.label}</Text>
          </Pressable>
        ))}
      </BlurView>

      {/* Share Sheet */}
      <ShareSheet visible={showShare} onClose={() => setShowShare(false)} tripId={id || ""} tripTitle={trip.title} />

      {/* Item Form */}
      <ItemForm visible={showItemForm} onClose={() => { setShowItemForm(false); setEditingItem(null); }}
        onSave={handleAddItem}
        initialData={editingItem ? { type: editingItem.type, title: editingItem.title, startTime: editingItem.startTime || "", endTime: editingItem.endTime || "", locationName: editingItem.locationName || "", bookingRef: editingItem.bookingRef || "", notes: editingItem.notes || "", dayNumber: editingItem.dayNumber } : undefined}
        dayNumber={selectedDay}
      />
    </View>
  );
}
