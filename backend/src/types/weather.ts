export interface WeatherData {
  location: {
    name: string;
    country: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  current: {
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    code: number;
    isDay: boolean;
  };
  forecast: { date: string; max: number; min: number; code: number }[];
}
