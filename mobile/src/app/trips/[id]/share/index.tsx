import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function Screen() {
  const { id } = useLocalSearchParams();
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-[#F8F7F4]">
      <Text style={{ fontSize: 40, marginBottom: 8 }}>🚧</Text>
      <Text style={{ fontSize: 17, color: "#8E8E93" }}>即将上线</Text>
    </SafeAreaView>
  );
}
