import { MapPin } from "lucide-react";
import type { WeatherData } from "@/types/weather";
import { temperature, weatherDescription } from "@/lib/weather-codes";
import WeatherIcon from "./WeatherIcon";
export default function WeatherCard({ weather }: { weather: WeatherData }) {
  const { location, current } = weather;
  return (
    <article className="current-card">
      <div className="current-top">
        <span className="current-label">
          <MapPin size={15} /> VOTRE DESTINATION
        </span>
        <span className="current-badge">Conditions actuelles</span>
      </div>
      <div className="current-location">
        <h3>{location.name}</h3>
        <p>{[location.region, location.country].filter(Boolean).join(", ")}</p>
      </div>
      <div className="current-weather">
        <div>
          <span className="big-temperature">
            {temperature(current.temperature)}
            <span>C</span>
          </span>
          <p>{weatherDescription(current.code, current.isDay)}</p>
        </div>
        <WeatherIcon
          code={current.code}
          isDay={current.isDay}
          size={112}
          className="hero-weather-icon"
        />
      </div>
      <div className="current-bottom">
        <span>Ressenti {temperature(current.feelsLike)}</span>
        <span>À {current.time.slice(11, 16)} · heure locale</span>
      </div>
    </article>
  );
}
