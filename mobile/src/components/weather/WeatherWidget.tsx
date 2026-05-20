import { View, Text, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { useWeather } from "@/hooks/useWeather";
import { Colors } from "@/lib/constants";

interface Props { destination?: string; cityId?: string; startDate?: string; }

const weatherIcons: Record<string, string> = {
  "100": "☀️","101": "🌤️","102": "⛅","103": "🌥️","104": "☁️",
  "300": "🌦️","301": "🌦️","302": "🌧️","303": "⛈️","304": "🌨️","305": "🌦️","306": "🌧️","307": "🌧️",
  "400": "❄️","401": "🌨️","402": "🌨️","403": "🌨️","500": "🌫️","501": "🌫️",
};

export function WeatherWidget({ destination, cityId, startDate }: Props) {
  const { data, isLoading } = useWeather(destination, cityId, 7);
  const c = Colors.light;

  if (isLoading || !data?.current) {
    return (
      <View style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 20, overflow: "hidden" }}>
        <BlurView intensity={40} tint="light" style={{ padding: 16, backgroundColor: "rgba(255,255,255,0.4)", flexDirection: "row", alignItems: "center", gap: 14 }}>
          <Text style={{ fontSize: 28 }}>🌤️</Text>
          <View>
            <Text style={{ fontSize: 15, fontWeight: "600", color: c.textPrimary }}>加载天气中...</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary }}>需要和风天气 Key</Text>
          </View>
        </BlurView>
      </View>
    );
  }

  const { current, daily } = data;

  return (
    <View style={{ marginTop: 14 }}>
      {/* Current */}
      <View style={{ marginHorizontal: 16, borderRadius: 20, overflow: "hidden" }}>
        <BlurView intensity={45} tint="light" style={{ padding: 18, backgroundColor: "rgba(255,255,255,0.4)", flexDirection: "row", alignItems: "center", gap: 18 }}>
          <Text style={{ fontSize: 52 }}>{weatherIcons[current.icon] || "🌤️"}</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <Text style={{ fontSize: 32, fontWeight: "800", color: c.textPrimary, letterSpacing: -1 }}>{current.temp}°</Text>
              <Text style={{ fontSize: 14, color: c.textTertiary }}>体感 {current.feelsLike}°</Text>
            </View>
            <Text style={{ fontSize: 16, color: c.textPrimary, fontWeight: "500", marginTop: 2 }}>{current.text}</Text>
            <Text style={{ fontSize: 12, color: c.textTertiary, marginTop: 4 }}>{current.windDir}风 {current.windScale}级 · 湿度{current.humidity}%</Text>
          </View>
        </BlurView>
      </View>

      {/* Daily forecast */}
      {daily.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, gap: 8 }}>
          {daily.slice(0, 7).map((d, i) => (
            <BlurView key={i} intensity={30} tint="light" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.3)", padding: 12, alignItems: "center", minWidth: 64 }}>
              <Text style={{ fontSize: 10, color: c.textTertiary, marginBottom: 6 }}>{d.date.slice(5)}</Text>
              <Text style={{ fontSize: 22 }}>{weatherIcons[d.iconDay] || "🌤️"}</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: c.textPrimary, marginTop: 4 }}>{d.tempMax}°</Text>
              <Text style={{ fontSize: 11, color: c.textTertiary }}>{d.tempMin}°</Text>
            </BlurView>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
