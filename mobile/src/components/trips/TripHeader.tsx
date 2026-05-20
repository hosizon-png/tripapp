import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/lib/constants";

interface Props {
  title: string;
  destination?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "";
  const fmt = (d: string) => {
    const date = new Date(d);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };
  if (!end || start === end) return fmt(start);
  return `${fmt(start)} - ${fmt(end)}`;
}

export function TripHeader({ title, coverImage, startDate, endDate }: Props) {
  const colors = Colors.light;

  return (
    <View style={{ height: 300, position: "relative" }}>
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: colors.tint + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 64 }}>🌍</Text>
        </View>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 160,
          justifyContent: "flex-end",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#FFFFFF",
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.8)",
            marginTop: 4,
          }}
        >
          {formatDateRange(startDate, endDate)}
        </Text>
      </LinearGradient>
    </View>
  );
}
