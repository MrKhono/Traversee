"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { config } from "@/lib/config";
import CrossingScene from "./CrossingScene";
import Fireworks from "./Fireworks";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Experience() {
  const target = new Date(config.targetDate).getTime();
  const start = new Date(config.journeyStart).getTime();

  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [arrived, setArrived] = useState(false);
  const [preview, setPreview] = useState(false);
  const progressRef = useRef(0);

  // Mode aperçu : via l'URL (?apercu=1) pour visualiser l'arrivée avant l'heure.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.has("apercu") || q.has("preview")) setPreview(true);
  }, []);

  // Écran de célébration : réel (décompte terminé) ou simulé (aperçu).
  const celebrate = arrived || preview;

  // Le bouton d'aperçu n'est visible qu'en développement.
  // (L'URL ?apercu=1 reste utilisable partout, mais discrètement.)
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const diff = target - now;

      // Progression 0 → 1 de la barque entre journeyStart et targetDate.
      const p = Math.min(1, Math.max(0, (now - start) / (target - start)));
      progressRef.current = p;

      if (diff <= 0) {
        progressRef.current = 1;
        setArrived(true);
        setT({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      let r = diff;
      const d = Math.floor(r / 86_400_000); r -= d * 86_400_000;
      const h = Math.floor(r / 3_600_000); r -= h * 3_600_000;
      const m = Math.floor(r / 60_000); r -= m * 60_000;
      const s = Math.floor(r / 1_000);
      setT({ d, h, m, s });
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target, start]);

  if (celebrate) {
    const c = config.celebration;
    return (
      <main className="stage celebrating">
        <Fireworks />

        <div className="content fade-in">
          <Image
            className="logo glow"
            src="/logo.png"
            alt="Perez Chapel Dakar"
            width={140}
            height={140}
            priority
          />

          <p className="eyebrow shimmer">{c.eyebrow}</p>
          <h1 className="brand">{c.brand}</h1>
          <p className="wish">{c.wish}</p>
          <div className="year-xl">{c.year}</div>
          <p className="verse">{c.verse}</p>
        </div>

        {isDev && preview && !arrived && (
          <button
            type="button"
            className="preview-toggle exit"
            onClick={() => setPreview(false)}
          >
            {config.previewExit}
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="stage">
      <CrossingScene progressRef={progressRef} arrived={arrived} />

      <span className="rive left">{config.fromYear}</span>
      <span className="rive right">{config.toYear}</span>

      <div className="content">
        <Image
          className="logo"
          src="/logo.png"
          alt="Perez Chapel Dakar"
          width={112}
          height={112}
          priority
        />

        <p className="eyebrow">{config.eyebrow}</p>
        <h1 className="title">
          <span>{config.fromYear}</span>
          <span className="arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 12h16M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>{config.toYear}</span>
        </h1>
        <p className="tagline">{config.tagline}</p>

        <div className="countdown" aria-live="polite">
          <Unit n={t.d} label="Jours" />
          <Unit n={t.h} label="Heures" />
          <Unit n={t.m} label="Minutes" />
          <Unit n={t.s} label="Secondes" />
        </div>

        <p className="verse">{config.verseBefore}</p>

        <p className="place">{config.place}</p>

        <Ticket />
      </div>

      {isDev && (
        <button
          type="button"
          className="preview-toggle"
          onClick={() => setPreview(true)}
        >
          {config.previewEnter}
        </button>
      )}
    </main>
  );
}

function Ticket() {
  const { ticket } = config;

  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = ticket.pdfUrl;
    a.download = ticket.fileName;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="ticket">
      <button type="button" className="ticket-btn" onClick={downloadPdf}>
        <svg
          className="ticket-ico"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 3v11m0 0l4-4m-4 4l-4-4M5 20h14"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {ticket.label}
      </button>

      {(ticket.appleWalletUrl || ticket.googleWalletUrl) && (
        <div className="wallet-row">
          {ticket.appleWalletUrl && (
            <a className="wallet-btn" href={ticket.appleWalletUrl}>
               Ajouter à Apple Wallet
            </a>
          )}
          {ticket.googleWalletUrl && (
            <a
              className="wallet-btn"
              href={ticket.googleWalletUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ajouter à Google Wallet
            </a>
          )}
        </div>
      )}

      <p className="ticket-note">{ticket.note}</p>
    </div>
  );
}

function Unit({ n, label }: { n: number; label: string }) {
  return (
    <div className="unit">
      <div className="num">{pad(n)}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}
