import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Phone, Shield, ChevronLeft } from "lucide-react-native";
import { Colors } from "@/lib/constants";
import { apiRequest } from "@/lib/api";
import { setAccessToken, setRefreshToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { useSmsCode } from "@/hooks/useSmsCode";

export default function LoginScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const c = Colors.light;
  const { countdown, error, setError, sendCode } = useSmsCode();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone || !code) return; setError(""); setLoading(true);
    try {
      const data = await apiRequest("/api/auth/login", { method: "POST", body: { phone, code }, requireAuth: false });
      await setAccessToken(data.tokens.accessToken); await setRefreshToken(data.tokens.refreshToken);
      setUser(data.user); router.replace("/");
    } catch (e: any) { setError(e.message || "登录失败"); } finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 16, marginTop: 8 }}>
        <ChevronLeft size={24} color={c.textPrimary} />
      </Pressable>

      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={{ fontSize: 34, fontWeight: "800", color: c.textPrimary, letterSpacing: -0.5 }}>欢迎回来</Text>
        <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 8, lineHeight: 22 }}>使用手机号验证码登录</Text>

        <View style={{ marginTop: 40, gap: 16 }}>
          {/* Phone input */}
          <BlurView intensity={30} tint="light" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.4)", borderWidth: 0.5, borderColor: c.glassBorder }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
              <Phone size={18} color={c.textSecondary} />
              <Text style={{ color: c.textPrimary, fontSize: 15, marginLeft: 10, fontWeight: "500" }}>+86</Text>
              <TextInput
                placeholder="手机号" placeholderTextColor={c.textTertiary}
                value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ""))}
                maxLength={11} keyboardType="phone-pad"
                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, fontSize: 17, color: c.textPrimary }}
              />
            </View>
          </BlurView>

          {/* Code input */}
          <BlurView intensity={30} tint="light" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.4)", borderWidth: 0.5, borderColor: c.glassBorder }}>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
              <Shield size={18} color={c.textSecondary} />
              <TextInput
                placeholder="验证码" placeholderTextColor={c.textTertiary}
                value={code} onChangeText={setCode} maxLength={6} keyboardType="number-pad"
                style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, fontSize: 17, color: c.textPrimary }}
              />
              <Pressable onPress={() => sendCode(phone, "login")} disabled={countdown > 0}
                style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: countdown > 0 ? "transparent" : c.tint + "14" }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: countdown > 0 ? c.textTertiary : c.tint }}>
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </Text>
              </Pressable>
            </View>
          </BlurView>

          {error ? <Text style={{ color: "#FF3B30", fontSize: 13, marginTop: 4 }}>{error}</Text> : null}

          <Pressable onPress={handleLogin} disabled={loading}
            style={{ height: 52, borderRadius: 16, backgroundColor: phone && code ? c.tint : c.separator, alignItems: "center", justifyContent: "center", marginTop: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: phone && code ? "#FFF" : c.textTertiary, letterSpacing: 0.3 }}>
              {loading ? "登录中..." : "登录"}
            </Text>
          </Pressable>
        </View>

        <Pressable style={{ alignItems: "center", marginTop: 28 }} onPress={() => router.push("/(auth)/register")}>
          <Text style={{ fontSize: 15, color: c.tint }}>还没有账号？立即注册</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
