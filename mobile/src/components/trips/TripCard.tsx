import { View, Text, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/lib/constants";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    destination?: string;
    coverImage?: string;
    startDate?: string;
    endDate?: string;
  };
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return "";
  const fmt = (d: string) => {
    const date = new Date(d);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  if (!end || start === end) return fmt(start);
  return `${fmt(start)} - ${fmt(end)}`;
}

export function TripCard({ trip }: TripCardProps) {
  const router = useRouter();
  const colors = Colors.light;

  return (
    <Pressable
      onPress={() => router.push(`/trips/${trip.id}`)}
      className="overflow-hidden"
      style={{
        borderRadius: 16,
        backgroundColor: colors.surface,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Cover Image */}
      <View style={{ height: 180, backgroundColor: colors.separator }}>
        {trip.coverImage ? (
          <Image
            source={{ uri: trip.coverImage }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text style={{ fontSize: 48 }}>🌍</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {trip.title}
        </Text>
        {trip.destination ? (
          <Text
            style={{
              fontSize: 15,
              color: colors.textSecondary,
              marginTop: 4,
            }}
          >
            {trip.destination}
          </Text>
        ) : null}
        <Text
          style={{
            fontSize: 13,
            color: colors.tint,
            marginTop: 6,
            fontWeight: "500",
          }}
        >
          {formatDateRange(trip.startDate, trip.endDate)}
        </Text>
      </View>
    </Pressable>
  );
}
