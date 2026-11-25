import { getWeather } from "./weather.js";
import type { WeatherData } from "../types/weather.js";
// Only provider data is cached. Every HTTP search still records a database row.
export function createCachedWeatherProvider(
  provider: typeof getWeather = getWeather,
  now = Date.now,
) {
  const cache = new Map<string, { expires: number; data: WeatherData }>();
  return async (city: string): Promise<WeatherData> => {
    const key = city.toLocaleLowerCase("fr");
    const cached = cache.get(key);
    if (cached && cached.expires > now()) return cached.data;
    cache.delete(key);
    const data = await provider(city);
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { expires: now() + 300000, data });
    return data;
  };
}
