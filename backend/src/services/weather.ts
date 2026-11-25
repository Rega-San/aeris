import type { WeatherData } from "../types/weather.js";

export class WeatherError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function validateCity(value: string | null): string {
  const city = value?.trim().replace(/\s+/g, " ") ?? "";
  if (
    city.length < 2 ||
    city.length > 100 ||
    !/[\p{L}]/u.test(city) ||
    /[\p{Cc}<>]/u.test(city)
  ) {
    throw new WeatherError(
      "Saisissez un nom de ville entre 2 et 100 caractères.",
      400,
    );
  }
  return city;
}

type RecordValue = Record<string, unknown>;
function record(value: unknown): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new WeatherError(
      "Le service météo a renvoyé des données incomplètes.",
      502,
    );
  return value as RecordValue;
}
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new WeatherError(
      "Une mesure météo est indisponible. Réessayez plus tard.",
      502,
    );
  return value;
}
function string(value: unknown): string {
  if (typeof value !== "string" || !value)
    throw new WeatherError(
      "Les données de localisation sont incomplètes.",
      502,
    );
  return value;
}
async function fetchJson(
  url: URL,
  fetcher: typeof fetch,
  timeout: number,
): Promise<unknown> {
  try {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(timeout),
      cache: "no-store",
    });
    if (!response.ok)
      throw new WeatherError(
        "Le service météo est temporairement indisponible. Réessayez dans un instant.",
        502,
      );
    return await response.json();
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    )
      throw new WeatherError(
        "Le service météo met trop de temps à répondre. Réessayez.",
        504,
      );
    throw new WeatherError(
      "Impossible de joindre le service météo. Réessayez plus tard.",
      502,
    );
  }
}

export async function getWeather(
  city: string,
  fetcher: typeof fetch = fetch,
  timeout = 8000,
): Promise<WeatherData> {
  const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
  geoUrl.search = new URLSearchParams({
    name: city,
    count: "1",
    language: "fr",
    format: "json",
  }).toString();
  const geo = record(await fetchJson(geoUrl, fetcher, timeout));
  if (
    geo.results === undefined ||
    (Array.isArray(geo.results) && geo.results.length === 0)
  )
    throw new WeatherError(
      "Ville introuvable. Vérifiez l’orthographe ou essayez une ville voisine.",
      404,
    );
  if (!Array.isArray(geo.results))
    throw new WeatherError(
      "La recherche de ville est temporairement indisponible.",
      502,
    );
  const place = record(geo.results[0]);
  const latitude = number(place.latitude);
  const longitude = number(place.longitude);
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "6",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,is_day",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  }).toString();
  const raw = record(await fetchJson(url, fetcher, timeout));
  const current = record(raw.current);
  const daily = record(raw.daily);
  for (const key of [
    "time",
    "temperature_2m_max",
    "temperature_2m_min",
    "weather_code",
  ]) {
    if (!Array.isArray(daily[key]) || daily[key].length < 6)
      throw new WeatherError(
        "Les prévisions sont momentanément incomplètes.",
        502,
      );
  }
  const dates = daily.time as unknown[];
  return {
    location: {
      name: string(place.name),
      country: typeof place.country === "string" ? place.country : "",
      region: typeof place.admin1 === "string" ? place.admin1 : "",
      latitude,
      longitude,
      timezone: string(raw.timezone),
    },
    current: {
      time: string(current.time),
      temperature: number(current.temperature_2m),
      feelsLike: number(current.apparent_temperature),
      humidity: number(current.relative_humidity_2m),
      windSpeed: number(current.wind_speed_10m),
      precipitation: number(current.precipitation),
      code: number(current.weather_code),
      isDay: number(current.is_day) === 1,
    },
    forecast: dates.slice(1, 6).map((date, index) => ({
      date: string(date),
      max: number((daily.temperature_2m_max as unknown[])[index + 1]),
      min: number((daily.temperature_2m_min as unknown[])[index + 1]),
      code: number((daily.weather_code as unknown[])[index + 1]),
    })),
  };
}
