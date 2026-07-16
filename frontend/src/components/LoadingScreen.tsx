import { useEffect, useState, useRef } from "react";

interface Props {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const phases = [
    "INITIALIZING SYSTEMS...",
    "CALIBRATING SENSORS...",
    "LOADING HAND TRACKER...",
    "CONNECTING ENGINE...",
    "ALL SYSTEMS GO",
  ];

  // Animated particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; color: string }[] = [];
    const colors = ["#dc2626", "#ef4444", "#b91c1c", "#991b1b", "#ff4444", "#ff0000"];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = "rgba(220,38,38,0.04)";
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `, ${p.alpha})`).replace("rgb(", "rgba(").replace("#", "");

        // Convert hex to rgba properly
        const hex = p.color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(220,38,38,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Progress + phase animation
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 3 + 1;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 600);
        }, 500);
      }
      setProgress(Math.min(current, 100));
      setPhase(Math.floor((Math.min(current, 100) / 100) * (phases.length - 1)));
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #1a0000 0%, #0d0000 40%, #000000 100%)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease-out",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      {/* Particle canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-8 max-w-lg w-full">

        {/* Logo / Badge */}
        <div className="flex flex-col items-center gap-4">
          {/* Animated ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-red-800/40 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-2 rounded-full border border-red-700/30 animate-spin" style={{ animationDuration: "8s" }} />
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle at 35% 35%, #7f1d1d, #450a0a 60%, #1a0000 100%)",
                boxShadow: "0 0 40px rgba(220,38,38,0.4), 0 0 80px rgba(220,38,38,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: "1px solid rgba(220,38,38,0.3)",
              }}
            >
              {/* Steering wheel SVG */}
              <svg viewBox="0 0 80 80" className="w-14 h-14" fill="none">
                <circle cx="40" cy="40" r="36" stroke="#dc2626" strokeWidth="3" opacity="0.8" />
                <circle cx="40" cy="40" r="12" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="40" y1="4" x2="40" y2="28" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="40" y1="52" x2="40" y2="76" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <line x1="4" y1="40" x2="28" y2="40" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <line x1="52" y1="40" x2="76" y2="40" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                <circle cx="40" cy="40" r="4" fill="#ef4444" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h1
              className="text-4xl font-black tracking-[0.15em] uppercase"
              style={{
                background: "linear-gradient(180deg, #ffffff 0%, #ef4444 60%, #991b1b 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "0.2em",
                textShadow: "none",
              }}
            >
              DRIVESENSE
            </h1>
            <div className="flex items-center gap-2 mt-1 justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-700/60" style={{ maxWidth: 60 }} />
              <span className="text-[10px] font-bold tracking-[0.35em] text-red-500/80 uppercase">AI Racing System</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-700/60" style={{ maxWidth: 60 }} />
            </div>
          </div>
        </div>

        {/* Status phase text */}
        <div className="text-center min-h-[20px]">
          <span
            className="text-[11px] font-bold tracking-[0.3em] uppercase"
            style={{ color: "#ef4444", textShadow: "0 0 12px rgba(239,68,68,0.6)" }}
          >
            {phases[phase]}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full flex flex-col gap-2">
          <div
            className="w-full h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7f1d1d, #dc2626, #ef4444)",
                boxShadow: "0 0 10px rgba(239,68,68,0.8), 0 0 20px rgba(239,68,68,0.4)",
              }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-red-900/60 font-mono tracking-wider">SYS BOOT</span>
            <span className="text-[11px] font-black font-mono text-red-500" style={{ textShadow: "0 0 8px rgba(239,68,68,0.5)" }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Bottom spec tags */}
        <div className="flex gap-4 flex-wrap justify-center">
          {["HAND TRACKING", "SENDKEY API", "WEBSOCKET", "60FPS"].map((tag) => (
            <div
              key={tag}
              className="px-3 py-1 rounded-sm text-[9px] font-black tracking-[0.2em] uppercase"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
                color: "rgba(239,68,68,0.6)",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-800/50 to-transparent" />
      <div className="absolute bottom-6 text-[9px] font-bold tracking-[0.3em] text-red-900/40 uppercase">
        DriveSense AI © 2025 — Virtual Steering System
      </div>
    </div>
  );
}
