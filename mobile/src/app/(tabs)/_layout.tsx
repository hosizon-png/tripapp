import { Tabs } from "expo-router";
import { Globe, Compass, User } from "lucide-react-native";
import { useColorScheme } from "react-native";
import { Colors } from "@/lib/constants";

export default function TabLayout() {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.textTertiary,
        tabBarStyle: {
          backgroundColor: c.glass,
          borderTopColor: c.glassBorder,
          borderTopWidth: 0.5,
          position: "absolute",
          elevation: 0,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen name="globe" options={{ title: "探索", tabBarIcon: ({ color, size }) => <Globe size={size} color={color} />, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="discover" options={{ title: "发现", tabBarIcon: ({ color, size }) => <Compass size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "我的", tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
