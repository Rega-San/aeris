"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, MotionConfig } from "motion/react";
import {
  AlertCircle,
  ArrowUpRight,
  Globe2,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { WeatherData } from "@/types/weather";
import WeatherSearch from "./WeatherSearch";
import WeatherCard from "./WeatherCard";
import WeatherDetails from "./WeatherDetails";
import WeatherForecast from "./WeatherForecast";
import WeatherHistory from "./WeatherHistory";
import { apiGet } from "@/lib/api";
const WeatherMap = dynamic(() => import("./WeatherMap"), {
  ssr: false,
  loading: () => (
    <div className="map-placeholder" role="status">
      Chargement de la carte…
    </div>
  ),
});
export default function WeatherExplorer() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyRevision, setHistoryRevision] = useState(0);
  const [historyWarning, setHistoryWarning] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const lastQuery = useRef("Marseille");
  const load = useCallback(async (query: string) => {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    lastQuery.current = query;
    try {
      const result = await apiGet<WeatherData & { historySaved?: boolean }>(
        `weather?city=${encodeURIComponent(query.trim())}`,
        AbortSignal.any([request.signal, AbortSignal.timeout(25000)]),
      );
      if (!request.signal.aborted) {
        setWeather(result);
        setHistoryWarning(result.historySaved === false);
        setHistoryRevision((revision) => revision + 1);
      }
    } catch (cause) {
      if (!request.signal.aborted)
        setError(
          cause instanceof Error && cause.name === "TimeoutError"
            ? "La recherche met trop de temps à répondre. Réessayez."
            : cause instanceof TypeError
              ? "Connexion impossible. Vérifiez votre accès à Internet."
              : cause instanceof Error
                ? cause.message
                : "Une erreur est survenue.",
        );
    } finally {
      if (!request.signal.aborted) setLoading(false);
    }
  }, []);
  function search(query: string) {
    controller.current?.abort();
    setError("");
    lastQuery.current = query;
    if (query.trim().length < 2) {
      setError("Saisissez au moins deux caractères pour rechercher une ville.");
      setLoading(false);
      return;
    }
    setLoading(true);
    void load(query);
  }
  useEffect(() => {
    // load updates state only after the network request settles, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load("Marseille");
    return () => controller.current?.abort();
  }, [load]);
  return (
    <MotionConfig reducedMotion="user">
      <section className="hero shell">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="hero-badge">
            <Sparkles size={13} /> WEATHER INTELLIGENCE{" "}
            <span className="badge-line" /> Le ciel, en toute simplicité
          </span>
          <h1>
            Explorez le monde.
            <br />
            <span>Anticipez le ciel.</span>
          </h1>
          <p className="hero-description">
            Découvrez la météo de vos destinations préférées grâce à une
            <br className="desktop-break" /> expérience simple, élégante et
            intuitive.
          </p>
          <WeatherSearch onSearch={search} loading={loading} />
          <div className="hero-footnote">
            <Globe2 size={14} /> Toutes les destinations. Un seul horizon.
            <span>Sans inscription</span>
          </div>
        </motion.div>
      </section>
      <div className="shell results-area" aria-busy={loading}>
        <WeatherHistory revision={historyRevision} onSearch={search} />
        {historyWarning && !loading && !error && (
          <p role="status" className="mb-4 text-sm text-slate-600">
            Météo chargée, mais cette recherche n’a pas pu être enregistrée dans
            l’historique.
          </p>
        )}
        <div className="section-heading">
          <div>
            <span className="eyebrow">LE CIEL, ICI ET MAINTENANT</span>
            <h2>
              Votre météo, en un regard<span className="title-dot">.</span>
            </h2>
          </div>
          <span className="data-label">
            <span /> Données Open-Meteo
          </span>
        </div>
        <div role="status" className="sr-only" aria-live="polite">
          {loading
            ? "Recherche météo en cours."
            : weather && !error
              ? `Météo de ${weather.location.name} chargée. Cinq jours de prévisions disponibles.`
              : ""}
        </div>
        {loading && weather && (
          <p className="mb-4 text-sm text-sky-700">
            Recherche en cours… Les données ci-dessous concernent encore{" "}
            {weather.location.name}.
          </p>
        )}
        {loading && !weather && (
          <div className="loading-grid" aria-hidden="true">
            <div className="skeleton skeleton-main" />
            <div className="details-grid">
              {[0, 1, 2, 3].map((n) => (
                <div className="skeleton skeleton-detail" key={n} />
              ))}
            </div>
            <p>Nous prenons des nouvelles du ciel…</p>
          </div>
        )}
        {error && (
          <div className="error-state" role="alert">
            <AlertCircle size={28} />
            <h3>Le ciel se fait attendre</h3>
            <p>{error}</p>
            <button
              className="button"
              onClick={() => void search(lastQuery.current)}
            >
              <RefreshCw size={16} /> Réessayer
            </button>
          </div>
        )}
        {weather && !error && (
          <>
            <motion.div
              className="weather-grid"
              key={`${weather.location.latitude}-${weather.location.longitude}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              <WeatherCard weather={weather} />
              <WeatherDetails current={weather.current} />
            </motion.div>
            <WeatherForecast forecast={weather.forecast} />
            <section className="map-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">CHANGEZ DE PERSPECTIVE</span>
                  <h2>Un point sur le monde</h2>
                </div>
                <span className="heading-note">
                  <MapPin size={15} /> {weather.location.name},{" "}
                  {weather.location.country}
                </span>
              </div>
              <div className="map-card">
                <WeatherMap location={weather.location} />
                <div className="map-footer">
                  <span>
                    <Globe2 size={16} /> {weather.location.latitude.toFixed(4)}
                    °, {weather.location.longitude.toFixed(4)}°
                  </span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${weather.location.latitude}&mlon=${weather.location.longitude}#map=11/${weather.location.latitude}/${weather.location.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir la carte <ArrowUpRight size={15} />
                  </a>
                </div>
              </div>
            </section>
          </>
        )}
        {(!weather || error) && (
          <section id="previsions" className="forecast-empty">
            <CalendarLabel />
            <p>
              Les prévisions sur cinq jours et la carte apparaîtront avec votre
              météo.
            </p>
          </section>
        )}
      </div>
    </MotionConfig>
  );
}
function CalendarLabel() {
  return <h2>Votre prochaine destination vous attend.</h2>;
}
