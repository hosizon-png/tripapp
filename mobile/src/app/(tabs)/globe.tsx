import { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Platform, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Sparkles, Send, MapPin, Sun, Moon, Plus, Compass, ChevronRight, Plane, Ticket, Hotel, UtensilsCrossed, Banknote } from "lucide-react-native";
import { Colors } from "@/lib/constants";
import { useTrips } from "@/hooks/useTrips";
import { apiRequest } from "@/lib/api";
import { TripMapView } from "@/components/globe/TripMapView";

const { width: SW } = Dimensions.get("window");
const PANEL_W = Math.min(400, SW * 0.38);

const QUICK_CHIPS = ["几天比较好？","帮我推荐景点","大概花多少钱","当地有什么好吃的"];

// Demo / fallback locations
const DEMO = [
  { lat:39.9,lng:116.4,name:"北京",description:"故宫·长城" },{ lat:31.2,lng:121.5,name:"上海",description:"外滩" },
  { lat:30.6,lng:104.1,name:"成都",description:"火锅" },{ lat:34.3,lng:108.9,name:"西安",description:"兵马俑" },
  { lat:35.7,lng:139.7,name:"东京",description:"浅草" },
];

const COORDS: Record<string,{lat:number;lng:number}> = {
  "北京":{lat:39.9,lng:116.4},"上海":{lat:31.2,lng:121.5},"成都":{lat:30.6,lng:104.1},"西安":{lat:34.3,lng:108.9},"杭州":{lat:30.3,lng:120.2},"深圳":{lat:22.5,lng:114.1},"广州":{lat:23.1,lng:113.3},"重庆":{lat:29.4,lng:106.9},"南京":{lat:32.1,lng:118.8},"武汉":{lat:30.6,lng:114.3},"厦门":{lat:24.5,lng:118.1},"三亚":{lat:18.3,lng:109.5},"拉萨":{lat:29.7,lng:91.1},"昆明":{lat:25,lng:102.7},"东京":{lat:35.7,lng:139.7},"大阪":{lat:34.7,lng:135.5},"京都":{lat:35,lng:135.8},"曼谷":{lat:13.8,lng:100.5},
};
function guess(d:string){for(const[k,v]of Object.entries(COORDS))if(d?.includes(k))return v;return null;}

export default function AIGlobeScreen() {
  const router = useRouter(); const dd=useTrips(); const trips=dd.data?.trips||[];
  const [prompt,setPrompt]=useState("");const [gen,setGen]=useState(false);const [genStep,setGenStep]=useState("");
  const [focusLoc,setFocusLoc]=useState<{lat:number;lng:number;zoom:number}|null>(null);
  const [aiRes,setAiRes]=useState<Record<string,any[]>|null>(null);
  const [mapTheme,setMapTheme]=useState<"light"|"dark">("light");

  useEffect(()=>{if(typeof window!=="undefined")(window as any).__tripapp_theme=mapTheme;},[mapTheme]);

  const locs=(()=>{
    const real=trips.filter((t:any)=>t.destination).map((t:any)=>{const c=t.lat&&t.lng?{lat:t.lat,lng:t.lng}:guess(t.destination);return c?{...c,name:t.title,description:t.destination}:null;}).filter(Boolean) as any[];
    return real.length>0?real:DEMO;
  })();

  async function handleGen(chip?:string){
    const input=chip||prompt.trim();if(!input)return;
    setGen(true);setGenStep("AI 规划中...");
    try{
      const res=await apiRequest("/api/ai-planner",{method:"POST",body:{prompt:input},requireAuth:false});
      setAiRes(res.categories||null);
      setGenStep(`${res.plan?.title||"行程"} · ${res.plan?.totalDays||""}天`);
      const first=res.plan?.days?.[0]?.places?.[0];
      if(first?.lat&&first?.lng)setFocusLoc({lat:first.lat,lng:first.lng,zoom:14});
    }catch(e:any){}
    setTimeout(()=>{setGen(false);setPrompt("");},2000);
  }

  return (
    <View style={{flex:1,backgroundColor:"#000"}}>
      {/* ====== BACKGROUND: Full-screen 3D Globe ====== */}
      <TripMapView locations={locs} animateRoute={!!aiRes}
        onLocationPress={(loc: any)=>{const t=trips.find((x:any)=>x.title===loc.name);if(t)router.push(`/trips/${t.id}`);}}/>

      {/* ====== FLOATING LEFT SIDEBAR ====== */}
      <SafeAreaView edges={["top","bottom","left"]} style={{position:"absolute",top:0,left:0,bottom:0,width:PANEL_W}} pointerEvents="box-none">
        <View style={{flex:1,margin:16}}>
          <BlurView intensity={70} tint="dark" style={{flex:1,borderRadius:28,overflow:"hidden",backgroundColor:"rgba(18,18,20,0.82)",borderWidth:0.5,borderColor:"rgba(255,255,255,0.08)"}}>
            <ScrollView style={{flex:1}} contentContainerStyle={{padding:20,gap:16}} showsVerticalScrollIndicator={false}>

              {/* ===== HEADER ===== */}
              <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                <View>
                  <Text style={{fontSize:26,fontWeight:"800",color:"#FFF",letterSpacing:-0.5}}>Explore</Text>
                  <Text style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>{locs.length} destinations</Text>
                </View>
                <View style={{flexDirection:"row",gap:6}}>
                  <Pressable onPress={()=>setMapTheme(t=>t==="light"?"dark":"light")} style={{width:34,height:34,borderRadius:17,backgroundColor:"rgba(255,255,255,0.08)",alignItems:"center",justifyContent:"center"}}>
                    {mapTheme==="light"?<Moon size={14} color="#fff"/>:<Sun size={14} color="#FFD60A"/>}
                  </Pressable>
                  <Pressable onPress={()=>router.push("/trips/new")} style={{flexDirection:"row",alignItems:"center",gap:4,paddingHorizontal:14,height:34,borderRadius:17,backgroundColor:"#FF6A2F"}}>
                    <Plus size={14} color="#FFF"/><Text style={{color:"#FFF",fontSize:12,fontWeight:"700"}}>New Trip</Text>
                  </Pressable>
                </View>
              </View>

              {/* ===== AI CARD ===== */}
              <View style={{backgroundColor:"rgba(255,255,255,0.05)",borderRadius:20,padding:16,gap:10}}>
                <View style={{flexDirection:"row",alignItems:"center",gap:6}}>
                  <Sparkles size={14} color="#FF6A2F"/><Text style={{color:"#FFF",fontSize:13,fontWeight:"600"}}>AI Trip Planner</Text>
                </View>
                {gen?(
                  <View style={{alignItems:"center",gap:8,paddingVertical:8}}>
                    <Sparkles size={18} color="#FF6A2F"/><Text style={{color:"#FFF",fontSize:13,fontWeight:"600"}}>{genStep}</Text>
                    <View style={{height:2,backgroundColor:"rgba(255,255,255,0.06)",borderRadius:1,width:"100%"}}><View style={{height:2,backgroundColor:"#FF6A2F",borderRadius:1,width:"55%"}}/></View>
                  </View>
                ):aiRes?(
                  <View>
                    <View style={{flexDirection:"row",justifyContent:"space-between",marginBottom:8}}>
                      <Text style={{color:"#FFF",fontSize:13,fontWeight:"700"}}>✨ {genStep}</Text>
                      <Pressable onPress={()=>setAiRes(null)}><Text style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>关闭</Text></Pressable>
                    </View>
                    {/* Budget card */}
                    {aiRes?.cost&&<View style={{backgroundColor:"rgba(255,255,255,0.04)",borderRadius:14,padding:12,marginBottom:8}}>
                      <Text style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:"600",letterSpacing:0.5,marginBottom:4}}>💰 预估花费</Text>
                      <Text style={{color:"#FFF",fontSize:24,fontWeight:"800"}}>¥{aiRes.cost.reduce((s:number,c:any)=>s+(parseInt(String(c.amount).replace(/[^0-9]/g,""))||0),0)}</Text>
                      <View style={{flexDirection:"row",gap:4,marginTop:8}}>{aiRes.cost.map((c:any,i:number)=><View key={i} style={{flex:1,height:3,borderRadius:2,backgroundColor:["#FF6A2F","#3B82F6","#10B981","#F59E0B"][i]||"#666"}}/>)}</View>
                    </View>}
                    {/* Daily timeline */}
                    {aiRes?.spots&&<View style={{gap:6}}>{Object.entries((aiRes.spots as any[]).reduce((acc:any,s:any)=>{const d=`Day ${s.day||'?'}`;if(!acc[d])acc[d]=[];acc[d].push(s);return acc;},{})).map(([day,spots]:[string,any])=><View key={day}><Text style={{color:"rgba(255,255,255,0.35)",fontSize:10,fontWeight:"600",marginBottom:4}}>{day}</Text>{(spots as any[]).slice(0,3).map((s:any,i:number)=><View key={i} style={{flexDirection:"row",alignItems:"center",gap:6,paddingVertical:2}}><View style={{width:4,height:4,borderRadius:2,backgroundColor:"#FF6A2F"}}/><Text style={{color:"rgba(255,255,255,0.7)",fontSize:12,flex:1}} numberOfLines={1}>{s.name||s.placeName}</Text></View>)}</View>)}</View>}
                  </View>
                ):(
                  <>
                    <View style={{flexDirection:"row",flexWrap:"wrap",gap:6}}>
                      {QUICK_CHIPS.map(c=><Pressable key={c} onPress={()=>handleGen(c)} style={{paddingHorizontal:10,paddingVertical:5,borderRadius:12,backgroundColor:"rgba(255,255,255,0.06)",borderWidth:0.5,borderColor:"rgba(255,255,255,0.1)"}}><Text style={{color:"rgba(255,255,255,0.6)",fontSize:11}}>{c}</Text></Pressable>)}
                    </View>
                    <View style={{flexDirection:"row",alignItems:"center",gap:6,backgroundColor:"rgba(255,255,255,0.04)",borderRadius:14,paddingHorizontal:12}}>
                      <TextInput placeholder="输入旅行需求..." placeholderTextColor="rgba(255,255,255,0.2)" value={prompt} onChangeText={setPrompt} onSubmitEditing={()=>handleGen()} returnKeyType="send" style={{flex:1,paddingVertical:10,fontSize:13,color:"#FFF"}}/>
                      <Pressable onPress={()=>handleGen()} disabled={!prompt.trim()} style={{width:30,height:30,borderRadius:15,backgroundColor:prompt.trim()?"#FF6A2F":"rgba(255,255,255,0.06)",alignItems:"center",justifyContent:"center"}}><Send size={13} color={prompt.trim()?"#FFF":"rgba(255,255,255,0.2)"}/></Pressable>
                    </View>
                  </>
                )}
              </View>

              {/* ===== MY TRIPS ===== */}
              <View style={{backgroundColor:"rgba(255,255,255,0.05)",borderRadius:20,padding:16,gap:10}}>
                <View style={{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}}>
                  <View style={{flexDirection:"row",alignItems:"center",gap:6}}><Compass size={14} color="#FFF"/><Text style={{color:"#FFF",fontSize:13,fontWeight:"600"}}>My Trips</Text></View>
                  {trips.length>0&&<View style={{paddingHorizontal:8,paddingVertical:2,borderRadius:8,backgroundColor:"#FF6A2F"}}><Text style={{color:"#FFF",fontSize:10,fontWeight:"700"}}>{trips.length}</Text></View>}
                </View>
                {trips.length===0?(
                  <Pressable onPress={()=>{setPrompt("");handleGen();}} style={{borderRadius:14,borderWidth:1,borderColor:"rgba(255,255,255,0.08)",borderStyle:"dashed",padding:20,alignItems:"center",gap:6}}>
                    <Compass size={24} color="rgba(255,255,255,0.3)"/><Text style={{color:"rgba(255,255,255,0.4)",fontSize:12,fontWeight:"500"}}>开始你的第一次旅行</Text>
                  </Pressable>
                ):trips.slice(0,5).map((t:any)=><Pressable key={t.id} onPress={()=>router.push(`/trips/${t.id}`)} style={{flexDirection:"row",alignItems:"center",padding:12,backgroundColor:"rgba(255,255,255,0.03)",borderRadius:14,gap:10}}>
                  <View style={{width:36,height:36,borderRadius:10,backgroundColor:"rgba(255,255,255,0.06)",alignItems:"center",justifyContent:"center"}}><MapPin size={16} color="#FF6A2F"/></View>
                  <View style={{flex:1}}><Text style={{color:"#FFF",fontSize:14,fontWeight:"600"}} numberOfLines={1}>{t.title}</Text><Text style={{color:"rgba(255,255,255,0.35)",fontSize:11,marginTop:1}}>{t.destination||"未设置"} · {t.startDate?new Date(t.startDate).toLocaleDateString("zh-CN",{month:"short",day:"numeric"}):""}</Text></View>
                  <ChevronRight size={14} color="rgba(255,255,255,0.2)"/>
                </Pressable>)}
              </View>

              {/* ===== QUICK ACTIONS ===== */}
              <View style={{flexDirection:"row",gap:10}}>
                {[{icon:Plane,label:"行程",route:"/trips/new" as any},{icon:Banknote,label:"花费",route:(t:any[])=>t?.length?`/trips/${t[0].id}/expenses`:undefined as any},{icon:Ticket,label:"清单",route:(t:any[])=>t?.length?`/trips/${t[0].id}/checklist`:undefined as any},{icon:Hotel,label:"文档",route:(t:any[])=>t?.length?`/trips/${t[0].id}/documents`:undefined as any}].map((a,i)=><Pressable key={i} onPress={()=>{const r=typeof a.route==="function"?a.route(trips):a.route;if(r)router.push(r);}} style={{flex:1,paddingVertical:14,borderRadius:14,backgroundColor:"rgba(255,255,255,0.04)",alignItems:"center",gap:6}}>
                  <a.icon size={18} color="rgba(255,255,255,0.5)"/><Text style={{color:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:"600"}}>{a.label}</Text>
                </Pressable>)}
              </View>

            </ScrollView>
          </BlurView>
        </View>
      </SafeAreaView>

      {/* ===== RIGHT SIDE: Theme toggle ===== */}
      <SafeAreaView edges={["top","right"]} style={{position:"absolute",top:0,right:0,zIndex:10}} pointerEvents="box-none">
        <Pressable onPress={()=>setMapTheme(t=>t==="light"?"dark":"light")} style={{marginTop:16,marginRight:16,width:36,height:36,borderRadius:18,backgroundColor:"rgba(18,18,20,0.6)",alignItems:"center",justifyContent:"center",borderWidth:0.5,borderColor:"rgba(255,255,255,0.1)"}}>
          {mapTheme==="light"?<Moon size={16} color="#FFF"/>:<Sun size={16} color="#FFD60A"/>}
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
