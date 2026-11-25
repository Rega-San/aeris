"use client";
import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { apiGet } from "@/lib/api";
interface SearchEntry {
  id: string;
  city: string;
  country: string;
  searchedAt: string;
}
export default function WeatherHistory({
  revision,
  onSearch,
}: {
  revision: number;
  onSearch: (city: string) => void;
}) {
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void apiGet<{ searches: SearchEntry[] }>(
      "searches",
      AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]),
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setEntries(data.searches);
          setUnavailable(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setUnavailable(true);
      });
    return () => controller.abort();
  }, [revision]);
  return (
    <section className="history-section" aria-label="Historique des recherches">
      <div className="history-title">
        <History size={15} aria-hidden="true" />
        <span>Dernières escales</span>
        <small>Historique partagé</small>
      </div>
      {unavailable ? (
        <p role="status">
          L’historique est temporairement indisponible. La recherche météo reste
          accessible.
        </p>
      ) : entries.length ? (
        <div className="history-list">
          {entries.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSearch(entry.city)}
              title={`${entry.city}, ${entry.country}`}
            >
              <span>{entry.city}</span>
              <small>{entry.country}</small>
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      ) : (
        <p>Les prochaines recherches apparaîtront ici.</p>
      )}
    </section>
  );
}
