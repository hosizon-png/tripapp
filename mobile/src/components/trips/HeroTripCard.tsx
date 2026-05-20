import { useRef } from "react";
import { View, Text, Pressable, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Colors } from "@/lib/constants";

interface Props {
  trip: { id: string; title: string; destination?: string; coverImage?: string; startDate?: string; endDate?: string };
  large?: boolean;
}

function fmtRange(start?: string, end?: string): string {
  if (!start) return "";
  const f = (d: string) => { const dt = new Date(d); return `${dt.getMonth() + 1}.${dt.getDate()}`; };
  return end && start !== end ? `${f(start)} - ${f(end)}` : f(start);
}

export function HeroTripCard({ trip, large }: Props) {
  const router = useRouter();
  const scale = useRef(new Animated.Value(1)).current;
  const labelX = useRef(new Animated.Value(0)).current;

  function onPressIn() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }),
      Animated.spring(labelX, { toValue: 4, useNativeDriver: true }),
    ]).start();
  }
  function onPressOut() {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(labelX, { toValue: 0, useNativeDriver: true }),
    ]).start();
  }

  const w = large ? 300 : 160;
  const h = large ? 200 : 220;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => router.push(`/trips/${trip.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{ width: w, borderRadius: 24, overflow: "hidden" }}
      >
        {/* Full-bleed image */}
        <View style={{ width: "100%", height: h, backgroundColor: "#E8E8ED" }}>
          {trip.coverImage ? (
            <Image source={{ uri: trip.coverImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: large ? 56 : 40 }}>🌍</Text>
            </View>
          )}
        </View>

        {/* Floating glass label — bottom-left */}
        <Animated.View
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            transform: [{ translateX: labelX }],
          }}
        >
          <BlurView
            intensity={60}
            tint="dark"
            style={{
              borderRadius: 14,
              overflow: "hidden",
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: "rgba(0,0,0,0.35)",
            }}
          >
            <Text
              style={{ color: "#FFF", fontSize: large ? 18 : 15, fontWeight: "700" }}
              numberOfLines={1}
            >
              {trip.title}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
              {trip.destination || ""}{trip.destination && " · "}{fmtRange(trip.startDate, trip.endDate)}
            </Text>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
