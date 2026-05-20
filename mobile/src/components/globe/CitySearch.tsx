import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, FlatList, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { Search, MapPin } from "lucide-react-native";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

interface CityResult {
  name: string; lat: number; lng: number; display: string;
}

async function searchCities(query: string): Promise<CityResult[]> {
  if (!query || query.length < 2) return [];
  try {
    const url = `${NOMINATIM}?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=zh`;
    const res = await fetch(url, { headers: { "User-Agent": "TripApp/1.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => ({
      name: item.display_name?.split(",")[0] || item.name || query,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      display: item.display_name || item.name,
    }));
  } catch {
    return [];
  }
}

// Built-in fallback city library
const FALLBACK: Record<string, { lat: number; lng: number }> = {
  "北京":{lat:39.9,lng:116.4},"上海":{lat:31.2,lng:121.5},"广州":{lat:23.1,lng:113.3},
  "深圳":{lat:22.5,lng:114.1},"成都":{lat:30.6,lng:104.1},"杭州":{lat:30.3,lng:120.2},
  "西安":{lat:34.3,lng:108.9},"重庆":{lat:29.4,lng:106.9},"南京":{lat:32.1,lng:118.8},
  "武汉":{lat:30.6,lng:114.3},"厦门":{lat:24.5,lng:118.1},"三亚":{lat:18.3,lng:109.5},
  "拉萨":{lat:29.7,lng:91.1},"哈尔滨":{lat:45.8,lng:126.5},"昆明":{lat:25.0,lng:102.7},
  "东京":{lat:35.7,lng:139.7},"大阪":{lat:34.7,lng:135.5},"京都":{lat:35.0,lng:135.8},
  "曼谷":{lat:13.8,lng:100.5},"新加坡":{lat:1.35,lng:103.8},
  "巴黎":{lat:48.9,lng:2.35},"伦敦":{lat:51.5,lng:-0.13},"纽约":{lat:40.7,lng:-74.0},
  "悉尼":{lat:-33.9,lng:151.2},"迪拜":{lat:25.2,lng:55.3},
  "雷克雅未克":{lat:64.1,lng:-21.9},"冰岛":{lat:64.1,lng:-21.9},
  "开罗":{lat:30.0,lng:31.2},"罗马":{lat:41.9,lng:12.5},
};

function fallbackSearch(query: string): CityResult[] {
  const q = query.toLowerCase();
  return Object.entries(FALLBACK)
    .filter(([k]) => k.includes(query) || k.toLowerCase().includes(q))
    .slice(0, 5)
    .map(([name, coords]) => ({ name, lat: coords.lat, lng: coords.lng, display: name }));
}

interface Props {
  onSelect: (city: { name: string; lat: number; lng: number }) => void;
}

export function CitySearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setShowDropdown(false); return; }
    setLoading(true); setShowDropdown(true);
    try {
      const res = await searchCities(q);
      setResults(res.length > 0 ? res : fallbackSearch(q));
    } catch {
      setResults(fallbackSearch(q));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, doSearch]);

  function handleSelect(city: CityResult) {
    setShowDropdown(false);
    setQuery(city.name);
    onSelect({ name: city.name, lat: city.lat, lng: city.lng });
  }

  return (
    <View style={{ position: "relative", zIndex: 20 }}>
      <BlurView intensity={60} tint="dark" style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.08)", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)" }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 44 }}>
          <Search size={16} color="rgba(255,255,255,0.5)" />
          <TextInput
            placeholder="搜索城市..." placeholderTextColor="rgba(255,255,255,0.3)"
            value={query} onChangeText={setQuery} onFocus={() => results.length > 0 && setShowDropdown(true)}
            style={{ flex: 1, marginLeft: 10, fontSize: 15, color: "#FFF" }}
          />
          {loading && <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />}
        </View>
      </BlurView>

      {/* Dropdown */}
      {showDropdown && results.length > 0 && (
        <View style={{ position: "absolute", top: 50, left: 0, right: 0, backgroundColor: "rgba(20,20,30,0.95)", borderRadius: 14, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.1)" }}>
          {results.map((city, i) => (
            <Pressable key={i} onPress={() => handleSelect(city)}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", padding: 14, gap: 10, borderTopWidth: i > 0 ? 0.5 : 0, borderTopColor: "rgba(255,255,255,0.06)", backgroundColor: pressed ? "rgba(255,255,255,0.06)" : "transparent" })}>
              <MapPin size={14} color="rgba(255,255,255,0.4)" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "500" }}>{city.name}</Text>
                <Text style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 1 }} numberOfLines={1}>{city.display}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
