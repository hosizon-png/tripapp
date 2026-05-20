import { useState } from "react";
import { View, Text, FlatList, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { BlurView } from "expo-blur";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Colors } from "@/lib/constants";

const CATEGORIES = ["餐饮","交通","住宿","活动","购物","其他"];
const CURRENCIES = ["CNY","USD","JPY","EUR","HKD","KRW","THB"];

export default function ExpensesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient(); const c = Colors.light;
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("CNY");
  const [category, setCategory] = useState("餐饮");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey:["trips",id,"expenses"], queryFn:()=>apiRequest(`/api/trips/${id}`),
    enabled:!!id, select:(d:any)=>d.trip?.expenses||[],
  });
  const expenses = data || [];
  const totalCNY = expenses.reduce((s:number,e:any)=>s+(e.currency==="CNY"?e.amount:e.amount*(e.rate||1)),0);

  async function handleAdd() {
    if(!amount||isNaN(parseFloat(amount))){Alert.alert("提示","请输入有效金额");return;}
    setSaving(true);
    try {
      await apiRequest(`/api/trips/${id}/expenses`,{method:"POST",body:{category,amount:parseFloat(amount),currency,description:desc}});
      qc.invalidateQueries({queryKey:["trips",id]}); setShowForm(false); setAmount(""); setDesc("");
    } catch(e:any) { Alert.alert("错误",e.message); }
    finally { setSaving(false); }
  }

  if(isLoading) return <SafeAreaView style={{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:c.background}}><ActivityIndicator size="large" color={c.tint}/></SafeAreaView>;

  return <SafeAreaView style={{flex:1,backgroundColor:c.background}}>
    {/* Summary */}
    <View style={{padding:20,alignItems:"center",borderBottomWidth:0.5,borderBottomColor:c.separator}}>
      <Text style={{fontSize:13,color:c.textSecondary}}>总花费 (折合CNY)</Text>
      <Text style={{fontSize:36,fontWeight:"800",color:c.textPrimary,marginTop:4}}>¥{totalCNY.toFixed(2)}</Text>
      <Pressable onPress={()=>setShowForm(!showForm)} style={{marginTop:12,paddingHorizontal:20,paddingVertical:8,borderRadius:16,backgroundColor:c.tint}}>
        <Text style={{color:"#FFF",fontSize:13,fontWeight:"600"}}>+ 记一笔</Text>
      </Pressable>
    </View>

    {/* Add form */}
    {showForm && <View style={{padding:16,marginHorizontal:16,marginTop:12,backgroundColor:c.surface,borderRadius:16,gap:10}}>
      <View style={{flexDirection:"row",gap:8}}>
        <TextInput placeholder="金额" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={{flex:2,backgroundColor:c.background,borderRadius:10,padding:12,fontSize:16,color:c.textPrimary}} placeholderTextColor={c.textTertiary}/>
        <View style={{flex:1,flexDirection:"row",flexWrap:"wrap",gap:4}}>
          {CURRENCIES.slice(0,4).map(cur=><Pressable key={cur} onPress={()=>setCurrency(cur)} style={{paddingHorizontal:8,paddingVertical:6,borderRadius:8,backgroundColor:currency===cur?c.tint:c.separator}}><Text style={{fontSize:11,fontWeight:"600",color:currency===cur?"#FFF":c.textSecondary}}>{cur}</Text></Pressable>)}
        </View>
      </View>
      <View style={{flexDirection:"row",gap:4}}>{CATEGORIES.map(cat=><Pressable key={cat} onPress={()=>setCategory(cat)} style={{paddingHorizontal:10,paddingVertical:6,borderRadius:14,backgroundColor:category===cat?c.tint+"18":c.background,borderWidth:0.5,borderColor:category===cat?c.tint:c.separator}}><Text style={{fontSize:12,color:category===cat?c.tint:c.textSecondary}}>{cat}</Text></Pressable>)}</View>
      <TextInput placeholder="备注 (选填)" value={desc} onChangeText={setDesc} style={{backgroundColor:c.background,borderRadius:10,padding:12,fontSize:14,color:c.textPrimary}} placeholderTextColor={c.textTertiary}/>
      <Pressable onPress={handleAdd} disabled={saving} style={{backgroundColor:c.tint,borderRadius:12,paddingVertical:12,alignItems:"center"}}><Text style={{color:"#FFF",fontSize:15,fontWeight:"600"}}>{saving?"保存中...":"保存"}</Text></Pressable>
    </View>}

    {/* List */}
    <FlatList data={expenses} keyExtractor={(e:any)=>e.id} contentContainerStyle={{padding:16,gap:8}}
      ListEmptyComponent={<View style={{alignItems:"center",paddingVertical:40}}><Text style={{color:c.textSecondary}}>还没有费用记录</Text></View>}
      renderItem={({item}:any)=><View style={{flexDirection:"row",alignItems:"center",padding:14,backgroundColor:c.surface,borderRadius:12}}>
        <View style={{flex:1}}><Text style={{fontSize:15,fontWeight:"500",color:c.textPrimary}}>{item.description||item.category}</Text><Text style={{fontSize:12,color:c.textSecondary,marginTop:2}}>{item.category} · {item.date?new Date(item.date).toLocaleDateString("zh-CN"):""}</Text></View>
        <Text style={{fontSize:17,fontWeight:"600",color:c.textPrimary}}>{item.currency==="CNY"?"¥":item.currency} {item.amount}</Text>
      </View>}
    />
  </SafeAreaView>;
}
