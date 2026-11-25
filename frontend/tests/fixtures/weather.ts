// Données synthétiques réservées aux tests, jamais importées par l'application.
import type { WeatherData } from "../../src/types/weather";
export function fixtureWeather(city = "Marseille"): WeatherData {
  const places: Record<string, [number, number, string]> = {
    Marseille: [43.3, 5.4, "France"],
    Paris: [48.85, 2.35, "France"],
    Londres: [51.51, -0.13, "Royaume-Uni"],
    Tokyo: [35.68, 139.69, "Japon"],
  };
  const [latitude, longitude, country] = places[city] || places.Marseille;
  return {
    location: {
      name: city,
      country,
      region: "",
      latitude,
      longitude,
      timezone: "UTC",
    },
    current: {
      time: "2026-11-23T12:00",
      temperature: 12,
      feelsLike: 10,
      humidity: 65,
      windSpeed: 15,
      precipitation: 0,
      code: 2,
      isDay: true,
    },
    forecast: Array.from({ length: 5 }, (_, i) => ({
      date: `2026-11-${24 + i}`,
      min: 5 + i,
      max: 12 + i,
      code: [0, 2, 3, 61, 95][i],
    })),
  };
}
