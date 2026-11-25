import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from "lucide-react";

export default function WeatherIcon({
  code,
  isDay = true,
  className = "",
  size = 40,
}: {
  code: number;
  isDay?: boolean;
  className?: string;
  size?: number;
}) {
  const Icon =
    code === 0
      ? isDay
        ? Sun
        : Moon
      : [1, 2].includes(code)
        ? isDay
          ? CloudSun
          : CloudMoon
        : code === 3
          ? Cloud
          : [45, 48].includes(code)
            ? CloudFog
            : [51, 53, 55].includes(code)
              ? CloudDrizzle
              : [71, 73, 75, 77, 85, 86].includes(code)
                ? CloudSnow
                : [95, 96, 99].includes(code)
                  ? CloudLightning
                  : [56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)
                    ? CloudRain
                    : Cloud;
  return (
    <Icon
      size={size}
      strokeWidth={1.4}
      className={className}
      aria-hidden="true"
    />
  );
}
