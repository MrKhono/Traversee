import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "La traversée 2026 → 2027",
  description: "Décompte festif vers la nouvelle année — Perez Chapel, Dakar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
