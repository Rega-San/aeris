import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "./globals.css";

export const metadata: Metadata = {
  title: "AERIS — Explorez le monde. Anticipez le ciel.",
  description:
    "Conditions météo actuelles, prévisions sur cinq jours et carte interactive. Explorez vos destinations avec Open-Meteo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
