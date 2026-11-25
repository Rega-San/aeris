"use client";
import { useState } from "react";
import { ArrowUpRight, Menu, Wind, X } from "lucide-react";
const links = [
  ["Accueil", "accueil"],
  ["Explorer", "explorer"],
  ["Prévisions", "previsions"],
  ["À propos", "a-propos"],
];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="navbar">
      <div className="shell nav-inner">
        <a href="#accueil" className="brand" aria-label="AERIS, accueil">
          <Wind aria-hidden="true" />
          <span>
            AERIS<span className="brand-dot">.</span>
          </span>
        </a>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <a className="button nav-cta" href="#explorer">
          Explorer la météo <ArrowUpRight size={16} />
        </a>
        <button
          className="menu-button"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Navigation mobile"
        >
          {links.map(([label, id]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
