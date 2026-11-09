"use client";

import { useEffect, useRef } from "react";

type Props = {
  progressRef: React.MutableRefObject<number>;
  arrived: boolean;
};

type Star = { x: number; y: number; r: number; tw: number; sp: number };
type Piece = {
  x: number; y: number; vx: number; vy: number; r: number;
  c: string; rot: number; vr: number; shape: "rect" | "circ";
};

const GOLD = ["#f6d365", "#f5c518", "#e0a416", "#ffe9a8", "#ffffff"];

export default function CrossingScene({ progressRef, arrived }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confetti = useRef<Piece[]>([]);
  const stars = useRef<Star[]>([]);
  const burst = useRef<(n: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, raf = 0, waveT = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      const count = Math.round((W * H) / 9000);
      stars.current = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 0.68,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.03 + 0.005,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const waterY = () => H * 0.72;

    // Courbe du pont : de la rive gauche à la rive droite, surélevée au centre.
    const pathPoint = (p: number) => {
      const x0 = W * 0.12, x1 = W * 0.88;
      const x = x0 + (x1 - x0) * p;
      const y = waterY() - 26 - Math.sin(p * Math.PI) * (H * 0.1);
      return { x, y };
    };

    burst.current = (n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 7;
        confetti.current.push({
          x: W / 2, y: H * 0.42,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          r: 3 + Math.random() * 5,
          c: GOLD[(Math.random() * GOLD.length) | 0],
          rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3,
          shape: Math.random() < 0.5 ? "rect" : "circ",
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Étoiles scintillantes
      for (const s of stars.current) {
        s.tw += s.sp;
        ctx.globalAlpha = Math.max(0, 0.4 + Math.sin(s.tw) * 0.4);
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.28);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Eau
      const wy = waterY();
      const wg = ctx.createLinearGradient(0, wy, 0, H);
      wg.addColorStop(0, "rgba(20,42,115,0.9)");
      wg.addColorStop(1, "rgba(5,8,25,1)");
      ctx.fillStyle = wg;
      ctx.fillRect(0, wy, W, H - wy);

      // Reflets ondulants
      waveT += 0.02;
      ctx.strokeStyle = "rgba(245,197,24,0.14)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        const yy = wy + 16 + i * ((H - wy) / 6);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const y = yy + Math.sin(x * 0.02 + waveT + i) * 3;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Pont de lumière (pointillés dorés)
      ctx.save();
      ctx.setLineDash([2, 12]);
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      const grad = ctx.createLinearGradient(W * 0.12, 0, W * 0.88, 0);
      grad.addColorStop(0, "rgba(245,197,24,0.25)");
      grad.addColorStop(0.5, "rgba(246,211,101,0.9)");
      grad.addColorStop(1, "rgba(245,197,24,0.25)");
      ctx.strokeStyle = grad;
      ctx.beginPath();
      for (let i = 0; i <= 100; i++) {
        const pt = pathPoint(i / 100);
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.restore();

      // Avion à la position courante, incliné selon la pente de la trajectoire
      const bp = pathPoint(progressRef.current);
      const ahead = pathPoint(Math.min(1, progressRef.current + 0.012));
      const behind = pathPoint(Math.max(0, progressRef.current - 0.012));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);

      // Halo lumineux doux
      const halo = ctx.createRadialGradient(bp.x, bp.y, 0, bp.x, bp.y, 52);
      halo.addColorStop(0, "rgba(246,211,101,0.6)");
      halo.addColorStop(1, "rgba(246,211,101,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(bp.x, bp.y, 52, 0, 6.28);
      ctx.fill();

      ctx.save();
      ctx.translate(bp.x, bp.y);
      ctx.rotate(angle);

      // Lueur de réacteur (derrière l'appareil)
      const jet = ctx.createRadialGradient(-22, 0, 0, -22, 0, 16);
      jet.addColorStop(0, "rgba(255,233,168,0.9)");
      jet.addColorStop(1, "rgba(255,233,168,0)");
      ctx.fillStyle = jet;
      ctx.beginPath();
      ctx.arc(-24, 0, 14, 0, 6.28);
      ctx.fill();

      const body = ctx.createLinearGradient(0, -9, 0, 9);
      body.addColorStop(0, "#fff4cf");
      body.addColorStop(0.5, "#f6d365");
      body.addColorStop(1, "#dca014");

      // Aile arrière (en profondeur)
      ctx.fillStyle = "rgba(224,164,22,0.8)";
      ctx.beginPath();
      ctx.moveTo(4, 1);
      ctx.lineTo(-16, 11);
      ctx.lineTo(-2, 2);
      ctx.closePath();
      ctx.fill();

      // Dérive (empennage vertical)
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(-15, -3);
      ctx.lineTo(-23, -15);
      ctx.lineTo(-15, -15);
      ctx.lineTo(-9, -3);
      ctx.closePath();
      ctx.fill();

      // Fuselage
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.moveTo(24, 0);
      ctx.quadraticCurveTo(14, -6, -10, -5);
      ctx.quadraticCurveTo(-22, -4, -24, 0);
      ctx.quadraticCurveTo(-22, 4, -10, 5);
      ctx.quadraticCurveTo(14, 6, 24, 0);
      ctx.closePath();
      ctx.fill();

      // Aile avant (au premier plan)
      ctx.fillStyle = "#ffe9a8";
      ctx.beginPath();
      ctx.moveTo(6, 2);
      ctx.lineTo(-12, 15);
      ctx.lineTo(2, 3);
      ctx.closePath();
      ctx.fill();

      // Hublots
      ctx.fillStyle = "rgba(10,18,48,0.85)";
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(10 - i * 5, -1, 1.1, 0, 6.28);
        ctx.fill();
      }
      // Cockpit
      ctx.beginPath();
      ctx.moveTo(22, -1);
      ctx.lineTo(15, -4);
      ctx.lineTo(15, 1);
      ctx.closePath();
      ctx.fill();

      // Feu de nez
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(24, 0, 1.6, 0, 6.28);
      ctx.fill();

      ctx.restore();

      // Confettis
      const arr = confetti.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const c = arr[i];
        c.x += c.vx; c.y += c.vy; c.vy += 0.04; c.rot += c.vr;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.c;
        ctx.globalAlpha = 0.9;
        if (c.shape === "rect") ctx.fillRect(-c.r, -c.r * 0.5, c.r * 2, c.r);
        else { ctx.beginPath(); ctx.arc(0, 0, c.r, 0, 6.28); ctx.fill(); }
        ctx.restore();
        if (c.y > H + 40) arr.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [progressRef]);

  // Explosion de confettis à l'arrivée
  useEffect(() => {
    if (!arrived) return;
    let n = 0;
    const id = setInterval(() => {
      burst.current(80);
      if (++n > 8) clearInterval(id);
    }, 400);
    return () => clearInterval(id);
  }, [arrived]);

  return <canvas ref={canvasRef} className="scene" aria-hidden="true" />;
}
