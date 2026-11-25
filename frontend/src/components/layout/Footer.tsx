import { Wind } from "lucide-react";
export default function Footer() {
  return (
    <footer className="shell footer">
      <div>
        <a href="#accueil" className="brand">
          <Wind aria-hidden="true" /> AERIS<span className="brand-dot">.</span>
        </a>
        <p>Un regard sur le monde. Une longueur d’avance sur le ciel.</p>
        <small>© 2026 AERIS. Projet pédagogique.</small>
      </div>
      <div className="footer-links">
        <a href="#explorer">Explorer</a>
        <a href="#previsions">Prévisions</a>
        <a href="#a-propos">À propos</a>
      </div>
      <div className="sources">
        <span>Le monde, en données ouvertes.</span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Météo : Open-Meteo ↗
        </a>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          © OpenStreetMap contributors ↗
        </a>
      </div>
    </footer>
  );
}
