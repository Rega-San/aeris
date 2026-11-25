import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import type { SearchRepository } from "./database/repository.js";
import { apiRouter } from "./routes/api.js";
import { getWeather, WeatherError } from "./services/weather.js";
import { createCachedWeatherProvider } from "./services/cache.js";
export function createApp(
  repository: SearchRepository,
  weatherProvider: typeof getWeather = createCachedWeatherProvider(),
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin: (
        process.env.CORS_ORIGINS ||
        "http://localhost:3000,http://127.0.0.1:3000"
      ).split(","),
      methods: ["GET"],
    }),
  );
  app.use("/api", apiRouter(repository, weatherProvider));
  app.use((_req, res) => {
    res.status(404).json({ error: "Endpoint introuvable." });
  });
  const handleError: ErrorRequestHandler = (error, _req, res, _next) => {
    const known = error instanceof WeatherError;
    res
      .status(known ? error.status : 500)
      .set("Cache-Control", "no-store")
      .json({
        error: known
          ? error.message
          : "Une erreur inattendue est survenue. Réessayez.",
      });
  };
  app.use(handleError);
  return app;
}
