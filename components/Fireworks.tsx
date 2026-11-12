"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; tw: number; sp: number };
type Rocket = {
  x: number; y: number; vx: number; vy: number;
  targetY: number; color: string; trail: { x: number; y: number }[];
};
type Spark = {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; color: string; size: number;
};
type Glint = { x: number; y: number; vy: number; r: number; tw: number; sp: number };

// Palette festive : or dominant + touches chaleureuses et fraîches, tenues élégantes.
const PALETTE = [
  "#ffd86b", "#f5c518", "#ffe9a8", "#ffffff",
  "#ff9a6b", "#ff6fae", "#8fd3ff", "#b58bff",
];

export default function Fireworks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const stars: Star[] = [];
    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const glints: Glint[] = [];
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = () => PALETTE[(Math.random() * PALETTE.length) | 0];

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      stars.length = 0;
      const count = Math.round((W * H) / 8000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.82,
          r: Math.random() * 1.4 + 0.3,
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.03 + 0.005,
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const launch = () => {
      const x = rand(W * 0.15, W * 0.85);
      rockets.push({
        x,
        y: H + 10,
        vx: rand(-0.6, 0.6),
        vy: -rand(8.5, 12.5),
        targetY: rand(H * 0.12, H * 0.46),
        color: pick(),
        trail: [],
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const n = reduce ? 36 : 64 + ((Math.random() * 40) | 0);
      const power = rand(3.6, 6.2);
      const multi = Math.random() < 0.3;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rand(-0.08, 0.08);
        const sp = power * rand(0.35, 1);
        const max = rand(48, 82);
        sparks.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: max, max,
          color: multi ? pick() : color,
          size: rand(1.4, 2.8),
        });
      }
      // Cœur brillant
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = rand(0.4, 1.8);
        sparks.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: rand(20, 36), max: 36,
          color: "#ffffff",
          size: rand(1.6, 3.2),
        });
      }
    };

    const spawnGlint = () => {
      glints.push({
        x: Math.random() * W,
        y: -10,
        vy: rand(0.5, 1.4),
        r: rand(0.6, 1.8),
        tw: Math.random() * Math.PI * 2,
        sp: rand(0.04, 0.1),
      });
    };

    let frame = 0;
    const draw = () => {
      frame++;
      // Léger voile sombre : laisse une traînée lumineuse derrière les étincelles.
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(10,18,48,0.28)";
      ctx.fillRect(0, 0, W, H);

      // Étoiles scintillantes
      for (const s of stars) {
        s.tw += s.sp;
        ctx.globalAlpha = Math.max(0, 0.35 + Math.sin(s.tw) * 0.4);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.28);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.globalCompositeOperation = "lighter";

      // Lancement cadencé des fusées
      const interval = reduce ? 70 : 34;
      if (frame % interval === 0) launch();
      if (!reduce && Math.random() < 0.012) launch();
      if (Math.random() < 0.08) spawnGlint();

      // Fusées
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.12;
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();

        for (let t = 0; t < r.trail.length; t++) {
          const p = r.trail[t];
          ctx.globalAlpha = (t / r.trail.length) * 0.8;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8, 0, 6.28);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Tête de fusée
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.2, 0, 6.28);
        ctx.fill();

        if (r.vy >= -1 || r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Étincelles d'explosion
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.045;       // gravité
        s.vx *= 0.985;       // traînée
        s.vy *= 0.985;
        s.life--;
        const a = Math.max(0, s.life / s.max);
        ctx.globalAlpha = a;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.4 + a * 0.6), 0, 6.28);
        ctx.fill();
        if (s.life <= 0) sparks.splice(i, 1);
      }

      // Paillettes dorées qui descendent doucement
      for (let i = glints.length - 1; i >= 0; i--) {
        const g = glints[i];
        g.y += g.vy;
        g.tw += g.sp;
        ctx.globalAlpha = Math.max(0, 0.5 + Math.sin(g.tw) * 0.5) * 0.7;
        ctx.fillStyle = "#ffe9a8";
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.r, 0, 6.28);
        ctx.fill();
        if (g.y > H + 12) glints.splice(i, 1);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    // Salve d'ouverture
    for (let i = 0; i < 5; i++) setTimeout(launch, i * 180);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="scene fireworks" aria-hidden="true" />;
}
