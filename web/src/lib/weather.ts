import { db } from "./db";
import crypto from "crypto";

const QWEATHER_KEY = process.env.QWEATHER_API_KEY || "";
const QWEATHER_BASE = "https://devapi.qweather.com/v7";

export async function getCityId(location: string): Promise<string | null> {
  if (!QWEATHER_KEY) return null;

  const cache = db
    .prepare("SELECT data FROM WeatherCache WHERE cityId = ? AND date = ? LIMIT 1")
    .get(`search_${location}`, new Date().toISOString().slice(0, 10)) as any;
  if (cache) return JSON.parse(cache.data).cityId;

  try {
    const res = await fetch(
      `${QWEATHER_BASE}/city/lookup?location=${encodeURIComponent(location)}&key=${QWEATHER_KEY}`
    );
    const data = await res.json();
    const cityId = data?.location?.[0]?.id;
    if (cityId) {
      db.prepare(
        "INSERT OR REPLACE INTO WeatherCache (id, cityId, date, data) VALUES (?, ?, ?, ?)"
      ).run(crypto.randomUUID(), `search_${location}`, new Date().toISOString().slice(0, 10), JSON.stringify({ cityId }));
    }
    return cityId || null;
  } catch {
    return null;
  }
}

export async function getCurrentWeather(cityId: string): Promise<Record<string, string> | null> {
  if (!QWEATHER_KEY) return null;

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const cache = db
    .prepare("SELECT data FROM WeatherCache WHERE cityId = ? AND updatedAt >= ? LIMIT 1")
    .get(`now_${cityId}`, twoHoursAgo) as any;
  if (cache) return JSON.parse(cache.data);

  try {
    const res = await fetch(`${QWEATHER_BASE}/weather/now?location=${cityId}&key=${QWEATHER_KEY}`);
    const data = await res.json();
    const now = data?.now;
    if (!now) return null;

    const result = {
      temp: now.temp, feelsLike: now.feelsLike, icon: now.icon,
      text: now.text, windDir: now.windDir, windScale: now.windScale,
      humidity: now.humidity, precip: now.precip,
    };

    db.prepare(
      "INSERT OR REPLACE INTO WeatherCache (id, cityId, date, data) VALUES (?, ?, ?, ?)"
    ).run(crypto.randomUUID(), `now_${cityId}`, new Date().toISOString().slice(0, 10), JSON.stringify(result));

    return result;
  } catch {
    return null;
  }
}

export async function getDailyWeather(cityId: string): Promise<any[]> {
  if (!QWEATHER_KEY) return [];

  const today = new Date().toISOString().slice(0, 10);
  const cache = db
    .prepare("SELECT data FROM WeatherCache WHERE cityId = ? AND date = ? LIMIT 1")
    .get(`daily_${cityId}`, today) as any;
  if (cache) return JSON.parse(cache.data).daily || [];

  try {
    const res = await fetch(`${QWEATHER_BASE}/weather/7d?location=${cityId}&key=${QWEATHER_KEY}`);
    const data = await res.json();
    const daily = (data?.daily || []).map((d: any) => ({
      date: d.fxDate, tempMax: d.tempMax, tempMin: d.tempMin,
      textDay: d.textDay, iconDay: d.iconDay,
    }));

    db.prepare(
      "INSERT OR REPLACE INTO WeatherCache (id, cityId, date, data) VALUES (?, ?, ?, ?)"
    ).run(crypto.randomUUID(), `daily_${cityId}`, today, JSON.stringify({ daily }));

    return daily;
  } catch {
    return [];
  }
}
