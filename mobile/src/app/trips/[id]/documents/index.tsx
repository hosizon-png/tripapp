import { useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { DocumentGrid } from "@/components/documents/DocumentGrid";
import { apiRequest } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/lib/constants";

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient(); const c = Colors.light;
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["trips", id, "docs"],
    queryFn: () => apiRequest(`/api/trips/${id}`),
    enabled: !!id, select: (d: any) => d.trip?.documents || [],
  });
  const docs = data || [];

  async function handleUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      setUploading(true);

      // 1. Get OSS PostPolicy signature from backend (no keys in frontend!)
      const policy = await apiRequest("/api/documents/upload-policy", {
        method:"POST", body:{ fileName:file.name, fileType:file.mimeType||"application/octet-stream", tripId:id, category:"other" }
      });

      // 2. Upload directly to OSS using signed policy
      const formData = new FormData();
      formData.append("key", policy.key);
      formData.append("policy", policy.policy);
      formData.append("OSSAccessKeyId", policy.accessKeyId);
      formData.append("signature", policy.signature);
      formData.append("success_action_status", "200");
      formData.append("file", { uri: file.uri, name: file.name, type: file.mimeType } as any);

      const uploadRes = await fetch(policy.host, { method:"POST", body:formData });
      if (uploadRes.ok) {
        qc.invalidateQueries({ queryKey: ["trips", id] });
        qc.invalidateQueries({ queryKey: ["trips", id, "docs"] });
      } else {
        Alert.alert("上传失败", `状态码: ${uploadRes.status}`);
      }
    } catch(e:any) { Alert.alert("错误", e.message||"上传失败"); }
    finally { setUploading(false); }
  }

  async function handleDelete(docId: string) {
    try { await apiRequest(`/api/documents/${docId}`, { method:"DELETE" }); qc.invalidateQueries({ queryKey:["trips",id] }); }
    catch(e:any) { Alert.alert("删除失败", e.message); }
  }

  return <SafeAreaView style={{flex:1,backgroundColor:c.background}}>
    {isLoading||uploading?<View style={{flex:1,alignItems:"center",justifyContent:"center"}}><ActivityIndicator size="large" color={c.tint}/><View style={{marginTop:12}}>{uploading&&<ActivityIndicator size="small" color={c.textSecondary}/>}</View></View>
    :<DocumentGrid documents={docs} onUpload={handleUpload} onDelete={handleDelete}/>}
  </SafeAreaView>;
}
