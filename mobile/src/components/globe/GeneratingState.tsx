import { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Easing } from "react-native";
import { BlurView } from "expo-blur";
import { Sparkles, MapPin } from "lucide-react-native";

interface Props {
  isVisible: boolean;
  currentStep: string;
  generatedCount: number;
  totalLocations?: number;
}

export function GeneratingState({ isVisible, currentStep, generatedCount, totalLocations = 0 }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isVisible) return;

    // Earth rotation
    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
    );
    spin.start();

    // Scanning line animation
    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    scan.start();

    // Pulsing glow
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => { spin.stop(); scan.stop(); pulse.stop(); };
  }, [isVisible]);

  if (!isVisible) return null;

  const spinInterpolate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const scanTranslate = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 200] });
  const scanOpacity = scanAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] });

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      {/* Background globe ring */}
      <Animated.View style={{
        width: 240, height: 240, borderRadius: 120,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
        position: "absolute",
        transform: [{ rotate: spinInterpolate }],
      }}>
        <Animated.View style={{
          position: "absolute", top: -4, left: "50%", marginLeft: -4,
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: "#007AFF",
          opacity: scanOpacity,
          shadowColor: "#007AFF", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 12,
        }} />
      </Animated.View>

      {/* Inner ring */}
      <Animated.View style={{
        width: 180, height: 180, borderRadius: 90,
        borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)",
        position: "absolute",
        transform: [{ rotate: spinInterpolate }],
      }} />

      {/* Center glass card */}
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: "rgba(0,0,0,0.5)",
          borderWidth: 0.5,
          borderColor: "rgba(255,255,255,0.15)",
          paddingHorizontal: 28,
          paddingVertical: 24,
          alignItems: "center",
          minWidth: 220,
        }}
      >
        {/* Scanning glow */}
        <Animated.View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: "rgba(0,122,255,0.15)",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
          transform: [{ scale: pulseAnim }],
        }}>
          <Sparkles size={24} color="#007AFF" />
        </Animated.View>

        <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "700", letterSpacing: 0.3 }}>
          正在规划行程
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8, textAlign: "center" }}>
          {currentStep}
        </Text>

        {/* Progress dots */}
        <View style={{ flexDirection: "row", gap: 4, marginTop: 16 }}>
          {Array.from({ length: Math.min(totalLocations || 8, 8) }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 6, height: 6, borderRadius: 3,
                backgroundColor: i < generatedCount ? "#007AFF" : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </View>

        {generatedCount > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 }}>
            <MapPin size={12} color="rgba(255,255,255,0.4)" />
            <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {generatedCount} 个地点已生成
            </Text>
          </View>
        )}
      </BlurView>

      {/* Scanning line effect */}
      <Animated.View
        style={{
          position: "absolute",
          width: 200, height: 1,
          backgroundColor: "rgba(0,122,255,0.4)",
          top: "35%",
          opacity: scanOpacity,
          transform: [{ translateY: scanTranslate }],
        }}
      />
    </View>
  );
}
