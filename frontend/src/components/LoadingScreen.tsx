import { useEffect, useState, useRef } from "react";
import { SoundEffects } from "../utils/audio";

interface Props {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const bootLogs = [
    "ECU BOOT PROTOCOL INIT...",
    "CALIBRATING STEERING GYRO...",
    "INITIALIZING MEDIAPIPE CORE...",
    "ESTABLISHING WEBSOCKET SERVER...",
    "LINKING NATIVE OS INPUT BRIDGE...",
    "TESTING SCANCODE EMULATOR...",
    "F1 COCKPIT DIGITAL TELEMETRY ONLINE",
  ];

  // LED Sweep indicator state (F1 style shift lights)
  const [activeLedCount, setActiveLedCount] = useState(0);

  // Animated telemetry grids and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Dark F1 Grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // 2. Slow particle drifts
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
        ctx.fill();
      });

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

  // Boot sequence timer
  useEffect(() => {
    // Play F1 boot chime on startup
    SoundEffects.playStartup();

    let current = 0;
    let lastLogIndex = 0;
    const interval = setInterval(() => {
      current += Math.random() * 4 + 1.5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => {
          setVisible(false);
          setTimeout(onComplete, 500);
        }, 400);
      }
      setProgress(Math.min(current, 100));
      
      // Map logs to progress thresholds
      const currentLog = Math.floor((Math.min(current, 100) / 100) * (bootLogs.length - 1));
      setLogIndex(currentLog);
      
      // Play tick sound when a new diagnostic log is logged
      if (currentLog !== lastLogIndex) {
        SoundEffects.playTick();
        lastLogIndex = currentLog;
      }

      // F1 LED sweep mapping (0 to 15 LEDs)
      const ledCount = Math.floor((Math.min(current, 100) / 100) * 15);
      setActiveLedCount(ledCount);
    }, 45);

    return () => clearInterval(interval);
  }, []);

  // LED Colors matching F1 shift light clusters: 5 Green, 5 Yellow, 5 Red
  const renderLeds = () => {
    const leds = [];
    for (let i = 0; i < 15; i++) {
      const isActive = i <= activeLedCount;
      let color = "bg-neutral-800 border-neutral-700/30";
      let glow = "";
      
      if (isActive) {
        if (i < 5) {
          color = "bg-[#00ff95] border-[#00ff95]/50";
          glow = "shadow-[0_0_10px_rgba(0,255,149,0.7)]";
        } else if (i < 10) {
          color = "bg-[#ff9800] border-[#ff9800]/50";
          glow = "shadow-[0_0_10px_rgba(255,152,0,0.7)]";
        } else {
          color = "bg-[#ff1744] border-[#ff1744]/50";
          glow = "shadow-[0_0_10px_rgba(255,23,68,0.7)]";
        }
      }

      leds.push(
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-75 ${color} ${glow}`}
        />
      );
    }
    return leds;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden carbon-bg select-none"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 f1-cyber-grid pointer-events-none" />

      {/* Ambient Blue Backlight */}
      <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-blue-900/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-9 px-8 max-w-lg w-full">
        {/* Top: F1 Shift LED Panel */}
        <div className="flex flex-col items-center gap-2">
          <div className="px-5 py-2.5 rounded-xl bg-[#0d1425]/80 border border-slate-800 shadow-2xl flex gap-1.5 justify-center relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            {renderLeds()}
          </div>
          <span className="text-[8px] tracking-[0.4em] text-slate-500 font-bold uppercase mt-1">
            Shift Light Diagnostic Sweep
          </span>
        </div>

        {/* F1 Central Display */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* High-tech HUD framing */}
            <div className="absolute inset-0 rounded-full border border-sky-400/10 animate-spin" style={{ animationDuration: "14s" }} />
            <div className="absolute inset-1.5 rounded-full border border-[#00e5ff]/20 animate-spin" style={{ animationDuration: "5s", animationDirection: "reverse" }} />
            
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center relative bg-gradient-to-b from-[#0d1425] to-[#050816]"
              style={{
                border: "1px solid rgba(0, 229, 255, 0.3)",
                boxShadow: "0 0 25px rgba(0, 229, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Virtual Steering Wheel Silhouette */}
              <svg viewBox="0 0 80 80" className="w-11 h-11 text-[#00e5ff] drop-shadow-[0_0_4px_#00e5ff]" fill="none">
                <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="2.5" opacity="0.4" />
                <circle cx="40" cy="40" r="11" stroke="currentColor" strokeWidth="2" />
                <path d="M 40 6 L 40 29 M 40 51 L 40 74 M 6 40 L 29 40 M 51 40 L 74 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <circle cx="40" cy="40" r="3.5" fill="currentColor" />
              </svg>
            </div>
          </div>

          {/* F1 Engine Title */}
          <div className="text-center mt-1">
            <h1 className="text-3xl font-extrabold tracking-[0.25em] text-[#f8fafc] font-sans">
              DRIVESENSE <span className="text-[#00e5ff] drop-shadow-[0_0_6px_rgba(0,229,255,0.5)]">AI</span>
            </h1>
            <p className="text-[8px] tracking-[0.55em] text-[#94a3b8] uppercase font-bold mt-1">
              F1 Digital Cockpit Telemetry
            </p>
          </div>
        </div>

        {/* Telemetry Boot Logs */}
        <div className="w-full bg-[#0d1425]/60 border border-slate-800/80 px-4 py-3 rounded-lg flex flex-col font-mono text-left gap-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff95] animate-pulse" />
            <span className="text-[8px] font-bold tracking-[0.2em] text-slate-500 uppercase">SYSTEM FEED</span>
          </div>
          <div className="h-6 flex items-center mt-0.5">
            <span className="text-[10px] text-[#00e5ff] tracking-widest font-semibold uppercase animate-fade-in-up">
              &gt; {bootLogs[logIndex]}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-1 bg-[#0d1425] border border-slate-800/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #2563eb, #00e5ff, #00ff95)",
                boxShadow: "0 0 10px rgba(0, 229, 255, 0.8)",
              }}
            />
          </div>
          <div className="flex justify-between items-center px-0.5">
            <span className="text-[9px] text-slate-500 font-mono font-bold tracking-widest uppercase">BOOT CODE: 0XF1</span>
            <span className="text-xs font-black font-mono text-[#00e5ff]" style={{ textShadow: "0 0 6px rgba(0,229,255,0.5)" }}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Bottom Calibration Badges */}
        <div className="flex gap-3 flex-wrap justify-center mt-1">
          {["ECU CONFIG", "DRIVESENSE OS", "SW_V1.2_F1"].map((tag) => (
            <div
              key={tag}
              className="px-2.5 py-0.5 border border-[#00e5ff]/20 bg-[#00e5ff]/5 rounded-sm text-[8px] font-bold tracking-widest text-[#00e5ff]/70 uppercase"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Footer stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent" />
    </div>
  );
}
