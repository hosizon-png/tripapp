import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

interface WeatherData {
  temp: string;
  feelsLike: string;
  icon: string;
  text: string;
  windDir: string;
  windScale: string;
  humidity: string;
  precip: string;
}

interface DailyWeather {
  date: string;
  tempMax: string;
  tempMin: string;
  textDay: string;
  iconDay: string;
}

export function useWeather(destination?: string, cityId?: string, days: number = 7) {
  const params = new URLSearchParams();
  if (cityId) params.set("cityId", cityId);
  else if (destination) params.set("location", destination);
  else params.set("location", "北京");
  params.set("days", String(days));

  return useQuery({
    queryKey: ["weather", destination, cityId, days],
    queryFn: () =>
      apiRequest<{
        current: WeatherData | null;
        daily: DailyWeather[];
        cityId: string;
      }>(`/api/weather?${params.toString()}`, { requireAuth: false }),
    enabled: true,
    staleTime: 30 * 60 * 1000, // 30 min cache
  });
}
