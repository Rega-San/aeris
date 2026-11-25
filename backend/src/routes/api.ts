import { Router } from "express";
import type { SearchRepository } from "../database/repository.js";
import { getWeather, validateCity } from "../services/weather.js";
export function apiRouter(
  repository: SearchRepository,
  weatherProvider: typeof getWeather = getWeather,
) {
  const router = Router();
  router.use((_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  router.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "aeris-api" });
  });
  router.get("/health/db", async (_req, res) => {
    try {
      const result = await repository.ping();
      res.json({ status: "ok", database: "postgresql", result });
    } catch {
      res
        .status(503)
        .json({ error: "Base de données temporairement indisponible." });
    }
  });
  router.get("/searches", async (_req, res) => {
    try {
      res.json({ searches: await repository.recentSearches() });
    } catch {
      res
        .status(503)
        .json({ error: "L’historique est temporairement indisponible." });
    }
  });
  router.get("/weather", async (req, res) => {
    const city = validateCity(
      typeof req.query.city === "string" ? req.query.city : null,
    );
    const weather = await weatherProvider(city);
    let historySaved = true;
    try {
      await repository.recordSearch(
        weather.location.name,
        weather.location.country,
      );
    } catch {
      historySaved = false;
    }
    res.json({ ...weather, historySaved });
  });
  return router;
}
