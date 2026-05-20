import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Plane, Calendar, Cloud, Globe, ArrowRight } from "lucide-react-native";
import { setOnboardingComplete } from "@/lib/auth";
import { Colors } from "@/lib/constants";

const slides = [
  { icon: Globe, emoji: "🌍", title: "探索世界，规划行程", desc: "一站式管理你的每次旅行" },
  { icon: Calendar, emoji: "📅", title: "时间线日程", desc: "按天组织航班、酒店、景点，一手掌握" },
  { icon: Cloud, emoji: "🌤️", title: "天气 + 文档 + 清单", desc: "目的地天气、出行文件、待办事项，全部在手" },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = Colors.light;
  const [step, setStep] = useState(0);

  async function handleFinish() {
    await setOnboardingComplete();
    router.replace("/(auth)/login");
  }

  const slide = slides[step];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
        {/* Dots */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 60 }}>
          {slides.map((_, i) => (
            <View key={i} style={{
              width: i === step ? 24 : 8, height: 8, borderRadius: 4,
              backgroundColor: i === step ? colors.tint : colors.separator,
            }} />
          ))}
        </View>

        <Text style={{ fontSize: 72, marginBottom: 32 }}>{slide.emoji}</Text>
        <Text style={{ fontSize: 26, fontWeight: "700", color: colors.textPrimary, textAlign: "center" }}>
          {slide.title}
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12, textAlign: "center", lineHeight: 24 }}>
          {slide.desc}
        </Text>
      </View>

      {/* Bottom */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {step < slides.length - 1 ? (
          <Pressable onPress={() => setStep(step + 1)}
            style={{ backgroundColor: colors.tint, borderRadius: 14, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}>
            <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "600" }}>下一步</Text>
            <ArrowRight size={18} color="#FFF" />
          </Pressable>
        ) : (
          <Pressable onPress={handleFinish}
            style={{ backgroundColor: colors.tint, borderRadius: 14, paddingVertical: 16, alignItems: "center" }}>
            <Text style={{ color: "#FFF", fontSize: 17, fontWeight: "600" }}>开始使用</Text>
          </Pressable>
        )}
        {step < slides.length - 1 && (
          <Pressable onPress={handleFinish} style={{ alignItems: "center", marginTop: 20 }}>
            <Text style={{ fontSize: 15, color: colors.textSecondary }}>跳过</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
