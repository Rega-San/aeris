"use client";
import { useState } from "react";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";
export default function WeatherSearch({
  onSearch,
  loading,
}: {
  onSearch: (city: string) => void;
  loading: boolean;
}) {
  const [city, setCity] = useState("");
  return (
    <div id="explorer" className="search-area">
      <form
        className="search-box"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(city);
        }}
      >
        <Search size={21} aria-hidden="true" />
        <label className="sr-only" htmlFor="city">
          Rechercher une ville
        </label>
        <input
          id="city"
          name="city"
          value={city}
          maxLength={100}
          onChange={(event) => setCity(event.target.value)}
          placeholder="Quelle ville souhaitez-vous explorer ?"
          autoComplete="off"
        />
        <button
          className="button"
          type="submit"
          aria-label="Rechercher la météo"
        >
          {loading ? (
            <LoaderCircle size={18} className="spin" />
          ) : (
            <Search className="mobile-search-icon" size={18} />
          )}
          <span>Rechercher</span>
          <ArrowRight size={17} className="search-arrow" />
        </button>
      </form>
      <div className="popular">
        <span>Envie d’ailleurs ?</span>
        {["Marseille", "Paris", "Londres", "Tokyo", "New York"].map((name) => (
          <button
            key={name}
            onClick={() => {
              setCity(name);
              onSearch(name);
            }}
          >
            {name}
            <ArrowUp />
          </button>
        ))}
      </div>
    </div>
  );
}
function ArrowUp() {
  return <span aria-hidden="true">↗</span>;
}
