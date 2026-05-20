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
  const router = useRouter(); const { setUser } = useAuthStore();
  const c = Colors.light; const { countdown, error, setError, sendCode } = useSmsCode();
  const [phone, setPhone] = useState(""); const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone||!code) return; setError(""); setLoading(true);
    try {
      const d = await apiRequest("/api/auth/login",{method:"POST",body:{phone,code},requireAuth:false});
      await setAccessToken(d.tokens.accessToken); await setRefreshToken(d.tokens.refreshToken);
      setUser(d.user); router.replace("/");
    } catch(e:any) { setError(e.message||"登录失败"); } finally { setLoading(false); }
  }

  const inp = { borderRadius:14, overflow:"hidden" as const, backgroundColor:"rgba(255,255,255,0.55)", borderWidth:0.5, borderColor:c.glassBorder };

  return <SafeAreaView style={{flex:1,backgroundColor:c.background}} edges={["top"]}>
    <Pressable onPress={()=>router.back()} style={{width:36,height:36,borderRadius:18,alignItems:"center",justifyContent:"center",marginLeft:12,marginTop:6}}>
      <ChevronLeft size={22} color={c.textPrimary}/>
    </Pressable>

    <View style={{flex:1,paddingHorizontal:28,paddingTop:32}}>
      <Text style={{fontSize:30,fontWeight:"800",color:c.textPrimary,letterSpacing:-0.5}}>欢迎回来</Text>
      <Text style={{fontSize:14,color:c.textSecondary,marginTop:6}}>使用手机号验证码登录</Text>

      <View style={{marginTop:36,gap:14}}>
        <BlurView intensity={25} tint="light" style={inp}>
          <View style={{flexDirection:"row",alignItems:"center",paddingHorizontal:14}}>
            <Phone size={16} color={c.textSecondary}/>
            <Text style={{color:c.textPrimary,fontSize:15,marginLeft:8,fontWeight:"500"}}>+86</Text>
            <TextInput placeholder="手机号" placeholderTextColor={c.textTertiary} value={phone} onChangeText={t=>setPhone(t.replace(/[^0-9]/g,""))} maxLength={11} keyboardType="phone-pad" style={{flex:1,paddingVertical:15,paddingHorizontal:8,fontSize:16,color:c.textPrimary}}/>
          </View>
        </BlurView>

        <BlurView intensity={25} tint="light" style={inp}>
          <View style={{flexDirection:"row",alignItems:"center",paddingHorizontal:14}}>
            <Shield size={16} color={c.textSecondary}/>
            <TextInput placeholder="验证码" placeholderTextColor={c.textTertiary} value={code} onChangeText={setCode} maxLength={6} keyboardType="number-pad" onSubmitEditing={handleLogin} style={{flex:1,paddingVertical:15,paddingHorizontal:8,fontSize:16,color:c.textPrimary}}/>
            <Pressable onPress={()=>sendCode(phone,"login")} disabled={countdown>0} style={{paddingVertical:6,paddingHorizontal:12,borderRadius:16,backgroundColor:countdown>0?"transparent":c.tint+"12"}}>
              <Text style={{fontSize:12,fontWeight:"600",color:countdown>0?c.textTertiary:c.tint}}>{countdown>0?`${countdown}s`:"获取验证码"}</Text>
            </Pressable>
          </View>
        </BlurView>

        {error?<Text style={{color:"#FF3B30",fontSize:12}}>{error}</Text>:null}

        <Pressable onPress={handleLogin} disabled={loading} style={{height:50,borderRadius:14,backgroundColor:phone&&code?c.tint:c.separator,alignItems:"center",justifyContent:"center",marginTop:8}}>
          <Text style={{fontSize:16,fontWeight:"700",color:phone&&code?"#FFF":c.textTertiary}}>{loading?"登录中...":"登录"}</Text>
        </Pressable>
      </View>

      <Pressable style={{alignItems:"center",marginTop:24}} onPress={()=>router.push("/(auth)/register")}>
        <Text style={{fontSize:14,color:c.tint}}>还没有账号？立即注册</Text>
      </Pressable>
    </View>
  </SafeAreaView>;
}
