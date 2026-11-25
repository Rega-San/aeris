import { Compass, Layers, Radio } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WeatherExplorer from "@/components/weather/WeatherExplorer";
const benefits = [
  {
    icon: Radio,
    number: "01",
    title: "Le ciel se précise.",
    text: "Des conditions actuelles aux cinq prochains jours, retrouvez les données des modèles météorologiques d’Open-Meteo.",
  },
  {
    icon: Compass,
    number: "02",
    title: "Le monde s’ouvre.",
    text: "D’un quartier familier à une destination lointaine, explorez chaque ville sur une carte interactive OpenStreetMap.",
  },
  {
    icon: Layers,
    number: "03",
    title: "L’essentiel, simplement.",
    text: "Une recherche, un regard. Les informations qui comptent, dans une expérience claire, fluide et sans inscription.",
  },
];
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <div id="accueil" />
      <Navbar />
      <main id="contenu">
        <WeatherExplorer />
        <section id="a-propos" className="about-section">
          <div className="shell">
            <div className="about-heading">
              <span className="eyebrow">L’ESPRIT AERIS</span>
              <h2>
                Un monde à explorer.
                <br />
                Un ciel à comprendre.
              </h2>
              <p>
                Moins de bruit. Plus de perspective.
                <br />
                La météo pensée pour vos envies d’ailleurs.
              </p>
            </div>
            <div className="about-grid">
              {benefits.map(({ icon: Icon, number, title, text }) => (
                <article className="about-card" key={number}>
                  <div className="about-icon-row">
                    <span className="about-icon">
                      <Icon size={22} />
                    </span>
                    <span>{number}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <p className="about-disclaimer">
              Les prévisions sont indicatives et peuvent évoluer. Pour les
              alertes de sécurité, consultez le service météorologique officiel
              de votre pays.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
