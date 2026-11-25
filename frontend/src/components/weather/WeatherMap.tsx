"use client";
import { useEffect, useState } from "react";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { WeatherData } from "@/types/weather";
import "leaflet/dist/leaflet.css";
const marker = divIcon({
  className: "aeris-marker",
  html: '<span class="map-pin"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});
function Recenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    map.flyTo([latitude, longitude], 11, { animate: !reduced, duration: 1.2 });
  }, [latitude, longitude, map]);
  return null;
}
export default function WeatherMap({
  location,
}: {
  location: WeatherData["location"];
}) {
  const [tileError, setTileError] = useState(false);
  return (
    <div className="map-wrap">
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={11}
        scrollWheelZoom={false}
        className="weather-map"
        aria-label={`Carte de ${location.name}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileError(false),
          }}
        />
        <Marker
          position={[location.latitude, location.longitude]}
          icon={marker}
        >
          <Popup>
            <strong>{location.name}</strong>
            <br />
            {location.country}
          </Popup>
        </Marker>
        <Recenter latitude={location.latitude} longitude={location.longitude} />
      </MapContainer>
      {tileError && (
        <p className="tile-error" role="status">
          Certaines tuiles sont indisponibles. Vérifiez votre connexion.
        </p>
      )}
    </div>
  );
}
