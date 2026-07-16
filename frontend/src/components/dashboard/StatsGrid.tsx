import { useStore } from "../../store/useStore";
import { useEffect, useRef, useState } from "react";

/* ─── Arc math helpers ──────────────────────────────────── */
function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/* ─── Speedometer gauge ─────────────────────────────────── */
function SpeedGauge({ value, max = 220, isTracking }: { value: number; max?: number; isTracking: boolean }) {
  const displayVal = isTracking ? Math.round(value) : 0;
  const START = -225, END = 45; // 270° sweep
  const range = END - START;
  const pct = Math.min(displayVal / max, 1);
  const needleDeg = START + pct * range;

  // Color: green→yellow→orange→red based on speed
  const arcColor = displayVal < 80 ? "#22c55e" : displayVal < 140 ? "#facc15" : displayVal < 180 ? "#f97316" : "#ef4444";

  const ticks = Array.from({ length: 23 }, (_, i) => i); // 0 to 220 in 10 steps

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        {/* Background glow gradient */}
        <radialGradient id="spd-bg" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        {/* Needle gradient */}
        <linearGradient id="needle-spd" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="glow-spd" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="text-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Dark plate background */}
      <circle cx="150" cy="150" r="140" fill="url(#spd-bg)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />

      {/* Track arc (background) */}
      <path
        d={arcPath(150, 150, 112, START + 360, END + 360)}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Colored active arc */}
      {pct > 0 && (
        <path
          d={arcPath(150, 150, 112, START + 360, needleDeg + 360)}
          fill="none"
          stroke={arcColor}
          strokeWidth="10"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${arcColor})`, transition: "stroke 0.3s ease" }}
        />
      )}

      {/* Danger zone arc (180–220) */}
      <path
        d={arcPath(150, 150, 112, START + 360 + (180 / 220) * range, END + 360)}
        fill="none"
        stroke="rgba(239,68,68,0.2)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Tick marks */}
      {ticks.map((i) => {
        const deg = START + (i / 22) * range;
        const isMajor = i % 2 === 0;
        const inner = polarToXY(150, 150, isMajor ? 92 : 98, deg + 360);
        const outer = polarToXY(150, 150, 108, deg + 360);
        const labelPt = polarToXY(150, 150, 76, deg + 360);
        const spd = Math.round((i / 22) * 220);
        return (
          <g key={i}>
            <line
              x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke={i % 2 === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)"}
              strokeWidth={isMajor ? 2 : 1}
            />
            {isMajor && (
              <text
                x={labelPt.x} y={labelPt.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fontFamily="'Orbitron', monospace" fontWeight="700"
                fill={spd > 160 ? "rgba(239,68,68,0.7)" : "rgba(255,255,255,0.45)"}
              >
                {spd}
              </text>
            )}
          </g>
        );
      })}

      {/* Needle */}
      <g
        style={{
          transform: `rotate(${needleDeg}deg)`,
          transformOrigin: "150px 150px",
          transition: "transform 0.1s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        <polygon
          points="150,52 147,148 153,148"
          fill="url(#needle-spd)"
          filter="url(#glow-spd)"
        />
        <polygon points="150,170 148,150 152,150" fill="rgba(255,255,255,0.3)" />
      </g>

      {/* Hub cap */}
      <circle cx="150" cy="150" r="14" fill="#111" stroke="rgba(239,68,68,0.6)" strokeWidth="2" />
      <circle cx="150" cy="150" r="7" fill="#ef4444" style={{ filter: "drop-shadow(0 0 4px #ef4444)" }} />

      {/* Center value display */}
      <text
        x="150" y="218"
        textAnchor="middle"
        fontSize="38" fontFamily="'Orbitron', monospace" fontWeight="900"
        fill={arcColor}
        style={{ filter: `drop-shadow(0 0 8px ${arcColor})`, transition: "fill 0.3s" }}
      >
        {displayVal}
      </text>
      <text x="150" y="238" textAnchor="middle" fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" fill="rgba(255,255,255,0.35)" letterSpacing="4">
        KM/H
      </text>

      {/* Label */}
      <text x="150" y="272" textAnchor="middle" fontSize="9" fontFamily="'Inter', sans-serif" fontWeight="900" fill="rgba(255,255,255,0.2)" letterSpacing="5">
        VELOCITY
      </text>
    </svg>
  );
}

/* ─── Steering angle gauge ──────────────────────────────── */
function AngleGauge({ value, isTracking }: { value: number; isTracking: boolean }) {
  const displayVal = isTracking ? value : 0;
  const clamped = Math.max(-90, Math.min(90, displayVal));
  const START = -135, END = 135; // 270° sweep centred
  const range = END - START;
  const pct = (clamped + 90) / 180; // 0..1
  const needleDeg = START + pct * range;

  const angleColor = Math.abs(clamped) < 10 ? "#22c55e" : Math.abs(clamped) < 45 ? "#facc15" : "#ef4444";
  const ticks = Array.from({ length: 19 }, (_, i) => i); // -90 to 90 in 10° steps

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="ang-bg" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="rgba(250,204,21,0.03)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id="needle-ang" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <filter id="glow-ang" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Plate */}
      <circle cx="150" cy="150" r="140" fill="url(#ang-bg)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <circle cx="150" cy="150" r="135" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />

      {/* Background arc */}
      <path
        d={arcPath(150, 150, 112, START + 360, END + 360)}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Center/zero line */}
      <path
        d={arcPath(150, 150, 112, 360 + (START + END) / 2 - 1, 360 + (START + END) / 2 + 1)}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
      />

      {/* Left zone arc (orange) */}
      <path
        d={arcPath(150, 150, 112, START + 360, (START + 360) + range * 0.25)}
        fill="none"
        stroke="rgba(249,115,22,0.25)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Right zone arc (red) */}
      <path
        d={arcPath(150, 150, 112, END + 360 - range * 0.25, END + 360)}
        fill="none"
        stroke="rgba(239,68,68,0.25)"
        strokeWidth="14"
        strokeLinecap="round"
      />

      {/* Active arc from center */}
      {Math.abs(clamped) > 2 && (
        <path
          d={arcPath(
            150, 150, 112,
            (START + END) / 2 + 360,
            needleDeg + 360
          )}
          fill="none"
          stroke={angleColor}
          strokeWidth="8"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${angleColor})`, transition: "stroke 0.3s ease" }}
        />
      )}

      {/* Tick marks */}
      {ticks.map((i) => {
        const deg = START + (i / 18) * range;
        const isMajor = i % 3 === 0;
        const inner = polarToXY(150, 150, isMajor ? 92 : 98, deg + 360);
        const outer = polarToXY(150, 150, 108, deg + 360);
        const labelPt = polarToXY(150, 150, 76, deg + 360);
        const angleLbl = Math.round(-90 + (i / 18) * 180);
        return (
          <g key={i}>
            <line
              x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke={isMajor ? "rgba(250,204,21,0.55)" : "rgba(255,255,255,0.2)"}
              strokeWidth={isMajor ? 2 : 1}
            />
            {isMajor && (
              <text
                x={labelPt.x} y={labelPt.y}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="11" fontFamily="'Orbitron', monospace" fontWeight="700"
                fill={Math.abs(angleLbl) > 60 ? "rgba(239,68,68,0.7)" : "rgba(250,204,21,0.5)"}
              >
                {angleLbl}
              </text>
            )}
          </g>
        );
      })}

      {/* Needle */}
      <g
        style={{
          transform: `rotate(${needleDeg}deg)`,
          transformOrigin: "150px 150px",
          transition: "transform 0.08s cubic-bezier(0.25, 0.8, 0.25, 1)",
        }}
      >
        <polygon
          points="150,52 147,148 153,148"
          fill="url(#needle-ang)"
          filter="url(#glow-ang)"
        />
        <polygon points="150,170 148,150 152,150" fill="rgba(255,255,255,0.3)" />
      </g>

      {/* Hub */}
      <circle cx="150" cy="150" r="14" fill="#111" stroke="rgba(250,204,21,0.6)" strokeWidth="2" />
      <circle cx="150" cy="150" r="7" fill="#facc15" style={{ filter: "drop-shadow(0 0 4px #facc15)" }} />

      {/* Center value */}
      <text
        x="150" y="218"
        textAnchor="middle"
        fontSize="38" fontFamily="'Orbitron', monospace" fontWeight="900"
        fill={angleColor}
        style={{ filter: `drop-shadow(0 0 8px ${angleColor})`, transition: "fill 0.3s" }}
      >
        {clamped > 0 ? "+" : ""}{Math.round(clamped)}
      </text>
      <text x="150" y="238" textAnchor="middle" fontSize="11" fontFamily="'Inter', sans-serif" fontWeight="700" fill="rgba(255,255,255,0.35)" letterSpacing="4">
        DEG
      </text>

      {/* Direction label */}
      <text
        x="150" y="258"
        textAnchor="middle"
        fontSize="12" fontFamily="'Orbitron', monospace" fontWeight="900"
        fill={angleColor}
        style={{ filter: `drop-shadow(0 0 6px ${angleColor})` }}
      >
        {Math.abs(clamped) < 5 ? "CENTER" : clamped < 0 ? "◀ LEFT" : "RIGHT ▶"}
      </text>

      {/* Label */}
      <text x="150" y="278" textAnchor="middle" fontSize="9" fontFamily="'Inter', sans-serif" fontWeight="900" fill="rgba(255,255,255,0.2)" letterSpacing="5">
        STEERING
      </text>
    </svg>
  );
}

/* ─── Mini stat pill ────────────────────────────────────── */
function StatPill({
  label, value, color, glow,
}: { label: string; value: string; color: string; glow: string }) {
  return (
    <div
      className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}33`,
        boxShadow: `0 0 12px ${glow}`,
      }}
    >
      <span className="text-[8px] font-black tracking-[0.25em] uppercase" style={{ color: `${color}80` }}>
        {label}
      </span>
      <span
        className="text-xl font-black font-mono"
        style={{ color, textShadow: `0 0 10px ${color}` }}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Main export ───────────────────────────────────────── */
export default function StatsGrid() {
  const { steeringAngle, speed, latency, confidence, isTracking } = useStore();
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const [displayAngle, setDisplayAngle] = useState(0);

  // Smooth interpolation via animation frame
  const rafRef = useRef<number>(0);
  const speedRef = useRef(0);
  const angleRef = useRef(0);

  useEffect(() => {
    function tick() {
      const targetSpd = isTracking ? speed : 0;
      const targetAng = isTracking ? steeringAngle : 0;

      speedRef.current += (targetSpd - speedRef.current) * 0.18;
      angleRef.current += (targetAng - angleRef.current) * 0.22;

      if (Math.abs(speedRef.current - targetSpd) < 0.3) speedRef.current = targetSpd;
      if (Math.abs(angleRef.current - targetAng) < 0.2) angleRef.current = targetAng;

      setDisplaySpeed(speedRef.current);
      setDisplayAngle(angleRef.current);

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed, steeringAngle, isTracking]);

  const confColor = confidence > 90 ? "#22c55e" : confidence > 70 ? "#facc15" : "#ef4444";

  return (
    <div className="flex flex-col gap-4">
      {/* Dual gauge cluster */}
      <div
        className="rounded-2xl relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 30% 50%, #1a0000 0%, #0a0000 40%, #050505 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 0 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Center divider glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3/4"
            style={{ background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)" }}
          />
          {/* Speed glow blob */}
          <div
            className="absolute left-[15%] top-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)" }}
          />
          {/* Angle glow blob */}
          <div
            className="absolute right-[15%] top-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)" }}
          />
        </div>

        {/* Gauges row */}
        <div className="grid grid-cols-2 gap-0 relative z-10">
          {/* Speedometer */}
          <div className="flex flex-col items-center gap-0 p-4 pr-2">
            <div className="w-full" style={{ maxWidth: 260, aspectRatio: "1/1" }}>
              <SpeedGauge value={displaySpeed} isTracking={isTracking} />
            </div>
          </div>

          {/* Steering angle gauge */}
          <div className="flex flex-col items-center gap-0 p-4 pl-2">
            <div className="w-full" style={{ maxWidth: 260, aspectRatio: "1/1" }}>
              <AngleGauge value={displayAngle} isTracking={isTracking} />
            </div>
          </div>
        </div>

        {/* Bottom stat pills row */}
        <div
          className="flex items-center justify-around px-6 py-4 relative z-10"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <StatPill
            label="Detection"
            value={`${isTracking ? Math.round(confidence) : 0}%`}
            color={confColor}
            glow={`${confColor}22`}
          />
          <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.07)" }} />
          <StatPill
            label="Latency"
            value={`${isTracking ? latency : 0}ms`}
            color="#38bdf8"
            glow="rgba(56,189,248,0.15)"
          />
          <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.07)" }} />
          <StatPill
            label="Engine"
            value={isTracking ? "ON" : "OFF"}
            color={isTracking ? "#22c55e" : "#ef4444"}
            glow={isTracking ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)"}
          />
          <div className="w-px h-8" style={{ background: "rgba(255,255,255,0.07)" }} />
          <StatPill
            label="FPS"
            value={isTracking ? "60" : "0"}
            color="#a78bfa"
            glow="rgba(167,139,250,0.15)"
          />
        </div>

        {/* Top header bar */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-2 z-20"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          <span
            className="text-[9px] font-black tracking-[0.3em] uppercase"
            style={{ color: "rgba(239,68,68,0.5)" }}
          >
            Speedometer
          </span>
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isTracking ? "#22c55e" : "#444",
                boxShadow: isTracking ? "0 0 6px #22c55e" : "none",
                animation: isTracking ? "red-heartbeat 2s ease-in-out infinite" : "none",
              }}
            />
            <span className="text-[8px] font-bold tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
              {isTracking ? "LIVE" : "IDLE"}
            </span>
          </div>
          <span
            className="text-[9px] font-black tracking-[0.3em] uppercase"
            style={{ color: "rgba(250,204,21,0.5)" }}
          >
            Angle Meter
          </span>
        </div>
      </div>
    </div>
  );
}
