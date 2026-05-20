import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { DocumentGrid } from "@/components/documents/DocumentGrid";
import { Colors } from "@/lib/constants";
import { apiRequest } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DocumentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const colors = Colors.light;

  const { data, isLoading } = useQuery({
    queryKey: ["trips", id, "documents"],
    queryFn: () => apiRequest(`/api/trips/${id}`),
    enabled: !!id,
    select: (data: any) => data.trip?.documents || [],
  });

  const documents = data || [];

  async function handleUpload() {
    // TODO: expo-document-picker + OSS upload-policy API
  }

  async function handleDelete(docId: string) {
    try {
      await apiRequest(`/api/documents/${docId}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["trips", id] });
    } catch (e) {
      console.error("Delete failed:", e);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      ) : (
        <DocumentGrid documents={documents} onUpload={handleUpload} onDelete={handleDelete} />
      )}
    </SafeAreaView>
  );
}
