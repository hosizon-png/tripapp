import { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Sparkles, Send, MapPin, Sun, Moon } from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTrips } from "@/hooks/useTrips";
import { TripMapView } from "@/components/globe/TripMapView";
import { SmartChipBar } from "@/components/ai/SmartChipBar";
import { CostBreakdown } from "@/components/ai/CostBreakdown";
import { DayCardStrip } from "@/components/ai/DayCardStrip";
import { apiRequest } from "@/lib/api";
import { Colors } from "@/lib/constants";

// Demo locations when no trip data
const DEMO = [
  { lat: 39.9, lng: 116.4, name: "北京", description: "故宫·长城" },
  { lat: 31.2, lng: 121.5, name: "上海", description: "外滩·迪士尼" },
  { lat: 30.6, lng: 104.1, name: "成都", description: "火锅·大熊猫" },
  { lat: 34.3, lng: 108.9, name: "西安", description: "兵马俑" },
  { lat: 35.7, lng: 139.7, name: "东京", description: "浅草·秋叶原" },
];

const COORDS: Record<string, { lat: number; lng: number }> = {
  "北京":{lat:39.9,lng:116.4},"上海":{lat:31.2,lng:121.5},"成都":{lat:30.6,lng:104.1},
  "西安":{lat:34.3,lng:108.9},"杭州":{lat:30.3,lng:120.2},"深圳":{lat:22.5,lng:114.1},
  "广州":{lat:23.1,lng:113.3},"重庆":{lat:29.4,lng:106.9},"南京":{lat:32.1,lng:118.8},
  "武汉":{lat:30.6,lng:114.3},"长沙":{lat:28.2,lng:112.9},"厦门":{lat:24.5,lng:118.1},
  "三亚":{lat:18.3,lng:109.5},"丽江":{lat:26.9,lng:100.2},"拉萨":{lat:29.7,lng:91.1},
  "东京":{lat:35.7,lng:139.7},"大阪":{lat:34.7,lng:135.5},"京都":{lat:35.0,lng:135.8},
  "曼谷":{lat:13.8,lng:100.5},"新加坡":{lat:1.35,lng:103.8},
};

function guessCoords(dest: string) { for (const [k,v] of Object.entries(COORDS)) if (dest?.includes(k)) return v; return null; }

export default function AIGlobeScreen() {
  const router = useRouter();
  const c = Colors.light;
  const { data } = useTrips();
  const trips = data?.trips || [];

  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState("");
  const [focusLoc, setFocusLoc] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  // Multi-turn state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});
  const [aiContext, setAiContext] = useState("");
  const [aiResult, setAiResult] = useState<Record<string, any[]> | null>(null);

  const locations = (() => {
    const real = trips.filter((t:any) => t.destination).map((t:any) => {
      const coords = t.lat&&t.lng ? {lat:t.lat,lng:t.lng} : guessCoords(t.destination);
      return coords ? {lat:coords.lat,lng:coords.lng,name:t.title,description:t.destination} : null;
    }).filter(Boolean) as {lat:number;lng:number;name:string;description?:string}[];
    return real.length > 0 ? real : DEMO;
  })();

  async function handleGenerate(chipValue?: string) {
    const input = chipValue || prompt.trim();
    if (!input) return;

    // Build context with previous Q&A
    const fullContext = aiContext ? `${aiContext}; ${input}` : input;

    setGenerating(true); setGenStep("正在分析...");
    setAiQuestion(""); setAiSuggestions({});

    try {
      const res = await apiRequest("/api/ai-planner", {
        method: "POST",
        body: { prompt: input, context: chipValue ? aiContext : undefined },
        requireAuth: false,
      });

      if (res.status === "needs_info") {
        // AI needs more info — show chips
        setAiQuestion(res.question);
        setAiSuggestions(res.suggestions || {});
        setAiContext(res.missing ? fullContext : aiContext);
        setGenStep("需要补充信息");
        setGenerating(false);
      } else {
        // Result ready — show accordion
        setAiResult(res.categories || null);
        setGenStep(`${res.plan?.title || "行程"} · ${res.plan?.totalDays || ""}天`);
        const first = res.plan?.days?.[0]?.places?.[0];
        if (first?.lat && first?.lng) setFocusLoc({ lat: first.lat, lng: first.lng, zoom: 14 });
        setTimeout(() => { setGenerating(false); setPrompt(""); setAiContext(""); }, 2000);
      }
    } catch (e: any) { setGenerating(false); }
  }

  function onChipSelect(value: string) {
    setPrompt(value);
    handleGenerate(value);
  }

  // Sync theme to global for map
  useEffect(() => {
    if (typeof window !== "undefined") (window as any).__tripapp_theme = mapTheme;
  }, [mapTheme]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000010" }}>
      {/* 3D Globe */}
      <TripMapView
        locations={locations}
        focusLocation={focusLoc}
        isGenerating={generating}
        animateRoute={!!aiResult}
        onLocationPress={(loc) => {
          const trip = trips.find((t:any) => t.title === loc.name);
          if (trip) router.push(`/trips/${trip.id}`);
        }}
      />

      {/* Top bar: Theme toggle only */}
      <SafeAreaView edges={["top"]} style={{ position:"absolute", top:0, right:0, zIndex: 20 }} pointerEvents="box-none">
        <Pressable
          onPress={() => setMapTheme((t) => (t === "light" ? "dark" : "light"))}
          style={{ marginRight:16, marginTop:4, width:40, height:40, borderRadius:20, alignItems:"center", justifyContent:"center", backgroundColor:mapTheme==="light"?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.4)" }}>
          {mapTheme === "light" ? <Moon size={18} color="#FFF" /> : <Sun size={18} color="#FFD60A" />}
        </Pressable>
      </SafeAreaView>

      {/* AI Console Panel — compact, transparent glass, keyboard-safe */}
      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{ position:"absolute", bottom:0, left:0, right:0 }} pointerEvents="box-none">
      <SafeAreaView edges={["bottom"]} pointerEvents="box-none">
        <BlurView intensity={40} tint="dark"
          style={{
            marginHorizontal: 20, marginBottom: 8, borderRadius: 20, overflow:"hidden",
            backgroundColor: "rgba(0,0,0,0.28)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.10)",
            padding: 14,
          }}>
          {generating ? (
            <View style={{ alignItems:"center", gap:8 }}>
              <Sparkles size={20} color="#C9A96E" />
              <Text style={{ color:"#FFF", fontSize:14, fontWeight:"600" }}>AI 正在规划</Text>
              <Text style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{genStep}</Text>
              <View style={{ height:2, backgroundColor:"rgba(255,255,255,0.08)", borderRadius:1, width:"100%" }}>
                <View style={{ height:2, backgroundColor:"#C9A96E", borderRadius:1, width:"60%" }} />
              </View>
            </View>
          ) : aiResult ? (
            /* ---- Result: Budget top + compact timeline ---- */
            <View>
              <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <Text style={{ color:"#FFF", fontSize:14, fontWeight:"700" }}>✨ {genStep}</Text>
                <Pressable onPress={() => { setAiResult(null); setAiContext(""); }}>
                  <Text style={{ color:"rgba(255,255,255,0.35)", fontSize:11 }}>关闭</Text>
                </Pressable>
              </View>
              {aiResult?.cost && <CostBreakdown items={aiResult.cost} />}
              {/* Compact daily timeline */}
              {aiResult?.spots && aiResult.spots.length > 0 && (
                <View style={{ marginTop:8, maxHeight:180 }}>
                  <ScrollView showsVerticalScrollIndicator={false} style={{ gap:6 }}>
                    {Object.entries(
                      (aiResult.spots as any[]).reduce((acc:any,s:any)=>{
                        const d=`第${s.day||'?'}天`;if(!acc[d])acc[d]=[];acc[d].push(s);return acc;
                      },{})
                    ).map(([day,spots]:[string,any])=>(
                      <View key={day} style={{ marginBottom:6 }}>
                        <Text style={{ color:"rgba(255,255,255,0.4)", fontSize:11, fontWeight:"600", marginBottom:4 }}>{day}</Text>
                        {(spots as any[]).map((s:any,i:number)=>(
                          <View key={i} style={{ flexDirection:"row", alignItems:"center", gap:6, paddingVertical:3 }}>
                            <View style={{ width:6,height:6,borderRadius:3,backgroundColor:"#C9A96E" }}/>
                            <Text style={{ color:"rgba(255,255,255,0.7)", fontSize:13, flex:1 }} numberOfLines={1}>{s.name||s.placeName}</Text>
                          </View>
                        ))}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          ) : aiQuestion ? (
            <View>
              <View style={{ flexDirection:"row", alignItems:"center", gap:6, marginBottom:2 }}>
                <Sparkles size={14} color="#C9A96E" />
                <Text style={{ color:"#FFF", fontSize:14, fontWeight:"600", flex:1 }}>{aiQuestion}</Text>
              </View>
              <SmartChipBar suggestions={aiSuggestions} onSelect={onChipSelect} />
              <Pressable onPress={() => { setAiQuestion(""); setAiSuggestions({}); setAiContext(""); }} style={{ alignSelf:"flex-end", marginTop:2 }}>
                <Text style={{ color:"rgba(255,255,255,0.25)", fontSize:11 }}>重新输入</Text>
              </Pressable>
            </View>
          ) : (
            /* ---- Default Input with suggestion chips ---- */
            <>
              {/* Suggestion chips */}
              <View style={{ flexDirection:"row", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                {["几天比较好？","帮我推荐景点","大概花多少钱","当地有什么好吃的"].map((chip)=>(
                  <Pressable key={chip} onPress={() => { setPrompt(chip); handleGenerate(chip); }}
                    style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:14, backgroundColor:"rgba(255,255,255,0.08)", borderWidth:0.5, borderColor:"rgba(255,255,255,0.12)" }}>
                    <Text style={{ color:"rgba(255,255,255,0.65)", fontSize:12 }}>{chip}</Text>
                  </Pressable>
                ))}
              </View>
              {/* Input row */}
              <View style={{ flexDirection:"row", alignItems:"center", gap:6 }}>
                <TextInput
                  placeholder='输入旅行需求...'
                  placeholderTextColor="rgba(255,255,255,0.25)"
                  value={prompt}
                  onChangeText={setPrompt}
                  onSubmitEditing={() => handleGenerate()}
                  returnKeyType="send"
                  style={{ flex:1, backgroundColor:"rgba(255,255,255,0.06)", borderRadius:14, paddingHorizontal:14, paddingVertical:10, fontSize:14, color:"#FFF", minHeight:40, textAlignVertical:"center" }}
                />
                <Pressable onPress={() => handleGenerate()} disabled={!prompt.trim()}
                  style={{ width:38, height:38, borderRadius:19, backgroundColor: prompt.trim() ? "#C9A96E" : "rgba(255,255,255,0.06)", alignItems:"center", justifyContent:"center" }}>
                  <Send size={16} color={prompt.trim() ? "#1A2744" : "rgba(255,255,255,0.2)"} />
                </Pressable>
              </View>
            </>
          )}
        </BlurView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
