import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { Gamepad, Volume2, VolumeX } from "lucide-react";

export default function MiniGame() {
  const { steeringAngle, speed, isTracking, gesture } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  // Simulation states
  const carX = useRef(0.5); // 0.0 (left) to 1.0 (right)
  const roadOffset = useRef(0);
  const engineAudio = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  // Audio engine initializer
  const toggleAudio = () => {
    if (audioEnabled) {
      if (engineAudio.current) {
        engineAudio.current.ctx.close();
        engineAudio.current = null;
      }
      setAudioEnabled(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(50, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime); // keep it low

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        engineAudio.current = { ctx, osc, gain };
        setAudioEnabled(true);
      } catch (err) {
        console.warn("Web Audio API not supported or blocked:", err);
      }
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (engineAudio.current) {
        engineAudio.current.ctx.close();
      }
    };
  }, []);

  // Update audio frequency dynamically based on vehicle speed
  useEffect(() => {
    if (audioEnabled && engineAudio.current) {
      const freq = 45 + (speed / 220) * 120; // Map speed to 45Hz - 165Hz
      engineAudio.current.osc.frequency.setValueAtTime(freq, engineAudio.current.ctx.currentTime);
    }
  }, [speed, audioEnabled]);

  // Core Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const loop = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // --- 1. Physics Updates ---
      const activeSpeed = isTracking ? speed : 0;
      
      // DIRECT ANGLE MAPPING: Map steering angle directly to lateral car position.
      // This prevents lagging/sluggish steering feel!
      // steeringAngle runs -90 to +90. We map it to [0.28, 0.72] range.
      const targetX = 0.5 + (steeringAngle / 90) * 0.22;
      
      // Smoothly slide to targetX to avoid hand noise twitching
      carX.current = carX.current * 0.82 + targetX * 0.18;

      // Scroll road proportional to current speedometer speed
      roadOffset.current += activeSpeed * 0.12;

      // --- 2. Render Loop ---
      ctx.clearRect(0, 0, w, h);

      // Grass/shoulders background
      ctx.fillStyle = "#cbd5e1"; // Light Slate 300
      ctx.fillRect(0, 0, w, h);

      // Main Road base
      ctx.fillStyle = "#334155"; // Dark Slate Gray Road
      ctx.beginPath();
      ctx.moveTo(w * 0.2, h);
      ctx.lineTo(w * 0.35, 0);
      ctx.lineTo(w * 0.65, 0);
      ctx.lineTo(w * 0.8, h);
      ctx.fill();

      // Road side borders (Red/White curbs)
      const segmentsCount = 12;
      const segmentHeight = h / segmentsCount;
      const animatedOffset = Math.floor(roadOffset.current) % (segmentHeight * 2);

      for (let s = -2; s < segmentsCount + 2; s++) {
        const yTop = s * segmentHeight + animatedOffset;
        const yBottom = yTop + segmentHeight;
        const isWhite = s % 2 === 0;

        // Curb strips
        ctx.fillStyle = isWhite ? "#ffffff" : "#e82b2b"; // BMW M-sport Red/White curbs
        
        // Left boundary curb
        ctx.beginPath();
        ctx.moveTo(w * 0.2 - (yTop/h) * 50, yTop);
        ctx.lineTo(w * 0.2 - (yBottom/h) * 50, yBottom);
        ctx.lineTo(w * 0.2 - (yBottom/h) * 50 + 6, yBottom);
        ctx.lineTo(w * 0.2 - (yTop/h) * 50 + 6, yTop);
        ctx.fill();

        // Right boundary curb
        ctx.beginPath();
        ctx.moveTo(w * 0.8 + (yTop/h) * 50, yTop);
        ctx.lineTo(w * 0.8 + (yBottom/h) * 50, yBottom);
        ctx.lineTo(w * 0.8 + (yBottom/h) * 50 - 6, yBottom);
        ctx.lineTo(w * 0.8 + (yTop/h) * 50 - 6, yTop);
        ctx.fill();

        // Center line (dashed lane markings)
        if (s % 2 === 0) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          // Perspective line drawing
          const cxTop = w / 2;
          const cxBottom = w / 2;
          ctx.fillRect(w / 2 - 1.5, yTop, 3, segmentHeight * 0.5);
        }
      }

      // Draw Player Car (Sleek BMW Sport coupe)
      const pX = carX.current * w;
      const pY = h - 65;

      // Shadow
      ctx.fillStyle = "rgba(15,23,42,0.3)";
      ctx.beginPath();
      ctx.ellipse(pX, pY + 18, 16, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rotate car slightly based on steering tilt
      ctx.save();
      ctx.translate(pX, pY);
      const rotationRad = (steeringAngle / 90) * 0.08; // small tilt angle
      ctx.rotate(rotationRad);

      // Wheels (black)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-17, -15, 5, 11); // FL
      ctx.fillRect(12, -15, 5, 11);  // FR
      ctx.fillRect(-17, 8, 5, 11);   // RL
      ctx.fillRect(12, 8, 5, 11);    // RR

      // Car main chassis (Alpine White BMW)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(-14, -20, 28, 40, 6);
      ctx.fill();

      // BMW M-Sport Racing stripes on the hood
      ctx.lineWidth = 1.5;
      // Sky blue stripe
      ctx.strokeStyle = "#00a3e0";
      ctx.beginPath(); ctx.moveTo(-3, -20); ctx.lineTo(-3, -8); ctx.stroke();
      // Navy stripe
      ctx.strokeStyle = "#00246b";
      ctx.beginPath(); ctx.moveTo(-1.5, -20); ctx.lineTo(-1.5, -8); ctx.stroke();
      // M Red stripe
      ctx.strokeStyle = "#e82b2b";
      ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, -8); ctx.stroke();

      // Cabin / Windshield
      ctx.fillStyle = "#1e293b"; // dark tint
      ctx.beginPath();
      ctx.roundRect(-10, -7, 20, 18, 4);
      ctx.fill();
      
      // Glass sheen
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(-8, -5, 16, 4); // front window
      ctx.fillRect(-8, 8, 16, 2);  // rear window

      // Side mirrors
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-17, -10, 3, 4); // left
      ctx.fillRect(14, -10, 3, 4);  // right

      // BMW Grill kidneys outline (front nose details)
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(-5, -20, 4, 2);
      ctx.fillRect(1, -20, 4, 2);

      // Tail lights
      const isBraking = gesture.toLowerCase().includes("brake") || gesture.toLowerCase().includes("closed");
      ctx.fillStyle = isBraking ? "#ff0000" : "#991b1b"; // Bright red glow when active brake
      ctx.fillRect(-11, 19, 5, 2);
      ctx.fillRect(6, 19, 5, 2);
      if (isBraking) {
        // Draw taillight brake glow overlay
        ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
        ctx.beginPath(); ctx.arc(-8.5, 20, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(8.5, 20, 6, 0, Math.PI * 2); ctx.fill();
      }

      ctx.restore();

      // Draw dashboard visual hud texts
      ctx.fillStyle = "#00246b"; // BMW Navy
      ctx.font = "bold 9px font-mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText(`SIMULATOR STATUS: ACTIVE`, 15, 20);
      ctx.fillText(`STEER TILT: ${Math.round(steeringAngle)}°`, 15, 32);

      ctx.textAlign = "right";
      ctx.fillText(`SPEED: ${Math.round(activeSpeed)} KM/H`, w - 15, 20);
      ctx.fillText(`THROTTLE: ${isBraking ? "BRAKING" : activeSpeed > 10 ? "ACCELERATING" : "STANDBY"}`, w - 15, 32);

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isTracking, speed, steeringAngle, gesture]);

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Gamepad className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Interactive BMW Simulator
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Tilt hands left/right to steer • Hold wide to accelerate • Close palm to brake
            </p>
          </div>
        </div>

        {/* Audio volume toggles */}
        <button
          onClick={toggleAudio}
          className={`p-1.5 rounded-lg border transition-all ${
            audioEnabled
              ? "bg-blue-50 text-blue-600 border-blue-200"
              : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
          }`}
          title="Toggle Engine Rev Audio"
        >
          {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Retro Canvas Track Frame */}
      <div className="relative aspect-video rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Overlay screens if idle */}
        {!isTracking && (
          <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm flex flex-col items-center justify-center text-slate-600 gap-3 z-10 font-mono">
            <span className="text-xs font-bold tracking-widest text-blue-600 animate-pulse">
              CONSOLE STANDBY
            </span>
            <span className="text-[10px] text-slate-400 px-12 text-center leading-normal font-sans">
              Click 'Start Engine' in the header to power up the simulated vehicle.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
