import { CalendarDays } from "lucide-react";
import type { WeatherData } from "@/types/weather";
import { temperature, weatherDescription } from "@/lib/weather-codes";
import WeatherIcon from "./WeatherIcon";
export default function WeatherForecast({
  forecast,
}: {
  forecast: WeatherData["forecast"];
}) {
  return (
    <section id="previsions" className="forecast-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">UN TEMPS D’AVANCE</span>
          <h2>Les cinq prochains jours</h2>
        </div>
        <span className="heading-note">
          <CalendarDays size={16} /> Pensez à demain, dès aujourd’hui.
        </span>
      </div>
      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <article className="forecast-card" key={day.date}>
            <h3>
              {index === 0
                ? "Demain"
                : new Intl.DateTimeFormat("fr-FR", {
                    weekday: "long",
                    timeZone: "UTC",
                  }).format(new Date(`${day.date}T12:00:00Z`))}
            </h3>
            <span className="forecast-date">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              }).format(new Date(`${day.date}T12:00:00Z`))}
            </span>
            <WeatherIcon code={day.code} size={42} />
            <p className="forecast-temperatures">
              {temperature(day.max)} <span>{temperature(day.min)}</span>
            </p>
            <p className="forecast-description">
              {weatherDescription(day.code)}
            </p>
          </article>
        ))}
      </div>
      <p className="forecast-caption">
        Températures maximales et minimales · Dates locales de la destination
      </p>
    </section>
  );
}
