import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { Phone, Shield, User, Lock, ChevronLeft } from "lucide-react-native";
import { Colors } from "@/lib/constants";
import { apiRequest } from "@/lib/api";
import { setAccessToken, setRefreshToken } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import { useSmsCode } from "@/hooks/useSmsCode";

export default function RegisterScreen() {
  const router = useRouter(); const { setUser } = useAuthStore();
  const c = Colors.light; const { countdown, error, setError, sendCode } = useSmsCode();
  const [phone, setPhone] = useState(""); const [code, setCode] = useState("");
  const [nickname, setNickname] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!phone || !code) return; setError(""); setLoading(true);
    try {
      const data = await apiRequest("/api/auth/register", { method: "POST", body: { phone, code, password: password || undefined, name: nickname || undefined }, requireAuth: false });
      await setAccessToken(data.tokens.accessToken); await setRefreshToken(data.tokens.refreshToken);
      setUser(data.user); router.replace("/");
    } catch (e: any) { setError(e.message || "注册失败"); } finally { setLoading(false); }
  }

  const inputStyle = { borderRadius: 16, overflow: "hidden" as const, backgroundColor: "rgba(255,255,255,0.4)", borderWidth: 0.5, borderColor: c.glassBorder };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginLeft: 16, marginTop: 8 }}>
        <ChevronLeft size={24} color={c.textPrimary} />
      </Pressable>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40 }}>
        <Text style={{ fontSize: 34, fontWeight: "800", color: c.textPrimary, letterSpacing: -0.5 }}>创建账号</Text>
        <Text style={{ fontSize: 15, color: c.textSecondary, marginTop: 8 }}>开始规划你的旅行</Text>

        <View style={{ marginTop: 40, gap: 14 }}>
          {[
            { icon: Phone, placeholder: "手机号", value: phone, onChange: (t: string) => setPhone(t.replace(/[^0-9]/g, "")), max: 11, type: "phone-pad" },
            { icon: Shield, placeholder: "验证码", value: code, onChange: setCode, max: 6, type: "number-pad", suffix: true },
            { icon: User, placeholder: "昵称（选填）", value: nickname, onChange: setNickname, max: 20 },
            { icon: Lock, placeholder: "密码（选填）", value: password, onChange: setPassword, max: 50, secure: true },
          ].map((f, i) => (
            <BlurView key={i} intensity={30} tint="light" style={inputStyle}>
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
                <f.icon size={18} color={c.textSecondary} />
                <TextInput
                  placeholder={f.placeholder} placeholderTextColor={c.textTertiary}
                  value={f.value} onChangeText={f.onChange}
                  maxLength={f.max} keyboardType={(f as any).type || "default"}
                  secureTextEntry={(f as any).secure}
                  style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 10, fontSize: 16, color: c.textPrimary }}
                />
                {(f as any).suffix && (
                  <Pressable onPress={() => sendCode(phone, "register")} disabled={countdown > 0}
                    style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: countdown > 0 ? "transparent" : c.tint + "14" }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: countdown > 0 ? c.textTertiary : c.tint }}>
                      {countdown > 0 ? `${countdown}s` : "获取验证码"}
                    </Text>
                  </Pressable>
                )}
              </View>
            </BlurView>
          ))}

          {error ? <Text style={{ color: "#FF3B30", fontSize: 13 }}>{error}</Text> : null}

          <Pressable onPress={handleRegister} disabled={loading}
            style={{ height: 52, borderRadius: 16, backgroundColor: phone && code ? c.tint : c.separator, alignItems: "center", justifyContent: "center", marginTop: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: "700", color: phone && code ? "#FFF" : c.textTertiary, letterSpacing: 0.3 }}>
              {loading ? "注册中..." : "注册"}
            </Text>
          </Pressable>
        </View>
        <Pressable style={{ alignItems: "center", marginTop: 28 }} onPress={() => router.back()}>
          <Text style={{ fontSize: 15, color: c.tint }}>已有账号？立即登录</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
