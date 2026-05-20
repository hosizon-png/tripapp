import { useEffect, useRef } from "react";
import { View, Text, ScrollView, Pressable, Image, Platform } from "react-native";
import { Colors } from "@/lib/constants";

const TIANDITU_TOKEN = "b3a9e6486cea01c01b6dc7650d5ee03a";

interface Trip {
  id: string;
  title: string;
  destination?: string;
  coverImage?: string;
  lat?: number;
  lng?: number;
}

interface Props {
  trips: Trip[];
  onTripPress?: (trip: Trip) => void;
}

// ---- Web-specific Tianditu map ----
function WebTiandituMap({ trips, onTripPress }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Tianditu JS API
    const scriptId = "tianditu-api-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${TIANDITU_TOKEN}`;
      script.onload = () => initMap();
      document.head.appendChild(script);
    } else if ((window as any).T) {
      initMap();
    }

    function initMap() {
      const T = (window as any).T;
      if (!T || !mapRef.current) return;

      const map = new T.Map(mapRef.current, {
        center: new T.LngLat(104.07, 35.5),
        zoom: 4,
        projection: "EPSG:4326",
      });

      // Add vector base layer + Chinese annotation
      const vecLayer = new T.TileLayer(
        `https://t0.tianditu.gov.cn/vec_w/wmts?tk=${TIANDITU_TOKEN}`,
        { minZoom: 1, maxZoom: 18 }
      );
      const cvaLayer = new T.TileLayer(
        `https://t0.tianditu.gov.cn/cva_w/wmts?tk=${TIANDITU_TOKEN}`,
        { minZoom: 1, maxZoom: 18 }
      );
      map.addLayer(vecLayer);
      map.addLayer(cvaLayer);

      // Add markers for each trip with coordinates
      trips.forEach((trip) => {
        if (trip.lat && trip.lng) {
          const marker = new T.Marker(new T.LngLat(trip.lng, trip.lat));
          const popup = new T.InfoWindow(
            `<div style="font-family:sans-serif;padding:4px;font-size:14px;font-weight:600;color:#1C1C1E">${trip.title}</div>`
          );
          marker.addEventListener("click", () => {
            marker.openInfoWindow(popup);
            onTripPress?.(trip);
          });
          map.addOverLay(marker);
        }
      });

      mapInstance.current = map;
    }

    return () => {
      mapInstance.current?.destroy?.();
    };
  }, [trips.length]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
    />
  );
}

// ---- Main GlobeView ----
export function GlobeView({ trips, onTripPress }: Props) {
  const colors = Colors.light;

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1 }}>
        {/* Map area */}
        <View style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <WebTiandituMap trips={trips} onTripPress={onTripPress} />
        </View>

        {/* Bottom carousel */}
        {trips.length > 0 && (
          <View style={{ paddingVertical: 12, backgroundColor: colors.surface }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {trips.map((trip) => (
                <Pressable
                  key={trip.id}
                  onPress={() => onTripPress?.(trip)}
                  style={{
                    width: 160,
                    backgroundColor: colors.background,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <View style={{ height: 100, backgroundColor: colors.separator, alignItems: "center", justifyContent: "center" }}>
                    {trip.coverImage ? (
                      <Image source={{ uri: trip.coverImage }} style={{ width: "100%", height: "100%" }} />
                    ) : (
                      <Text style={{ fontSize: 32 }}>🌍</Text>
                    )}
                  </View>
                  <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary }} numberOfLines={1}>
                      {trip.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  // Native fallback
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.tint + "10", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🗺️</Text>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.textPrimary }}>3D 地球视图</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: "center", paddingHorizontal: 40 }}>
          在手机上查看你的行程目的地
        </Text>
        {trips.length > 0 && (
          <View style={{ marginTop: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.tint, borderRadius: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#FFFFFF" }}>
              {trips.length} 个行程目的地
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
