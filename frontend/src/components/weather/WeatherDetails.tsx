import { Droplets, Thermometer, Umbrella, Wind } from "lucide-react";
import type { WeatherData } from "@/types/weather";
export default function WeatherDetails({
  current,
}: {
  current: WeatherData["current"];
}) {
  const details = [
    {
      label: "Humidité",
      value: current.humidity,
      unit: "%",
      note: "Humidité relative",
      icon: Droplets,
    },
    {
      label: "Vent",
      value: current.windSpeed,
      unit: "km/h",
      note: "Vitesse à 10 mètres",
      icon: Wind,
    },
    {
      label: "Précipitations",
      value: current.precipitation,
      unit: "mm",
      note: "Sur les 15 dernières minutes",
      icon: Umbrella,
    },
    {
      label: "Ressenti",
      value: Math.round(current.feelsLike),
      unit: "°C",
      note: "Température apparente",
      icon: Thermometer,
    },
  ];
  return (
    <div className="details-grid">
      {details.map(({ label, value, unit, note, icon: Icon }) => (
        <article className="detail-card" key={label}>
          <div className="detail-title">
            <span>{label}</span>
            <Icon size={20} />
          </div>
          <p className="detail-value">
            {value.toLocaleString("fr-FR")}
            <span>{unit}</span>
          </p>
          <p className="detail-note">{note}</p>
        </article>
      ))}
    </div>
  );
}
