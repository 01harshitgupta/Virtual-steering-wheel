import { useStore } from "../../store/useStore";

export default function Steering3D() {
  const { steeringAngle, gesture, isTracking } = useStore();

  const angleClamped = Math.max(-90, Math.min(90, steeringAngle));
  const normalised = angleClamped / 90; // -1 → +1
  const absAngle = Math.abs(angleClamped);

  /* Direction label */
  const direction =
    angleClamped < -8 ? "LEFT" : angleClamped > 8 ? "RIGHT" : "CENTER";
  const dirColor =
    angleClamped < -8 ? "#f97316" : angleClamped > 8 ? "#ef4444" : "#22c55e";

  return (
    <div
      className="glass-card rounded-2xl border flex flex-col gap-0 relative overflow-hidden h-[380px] animate-fade-in-up"
      style={{ borderColor: "rgba(220,38,38,0.25)" }}
    >
      {/* Top accent stripe */}
      <div className="h-[2px] w-full" style={{
        background: "linear-gradient(90deg, #7f1d1d, #dc2626 30%, #f97316 50%, #dc2626 70%, #7f1d1d)"
      }} />

      {/* Speed lines decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute h-px animate-speed-line"
            style={{
              top: `${28 + i * 18}%`,
              left: 0, right: 0,
              background: `linear-gradient(90deg, transparent, rgba(220,38,38,${0.15 - i * 0.04}), transparent)`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${2.2 + i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-red-950/40 relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Live indicator dot */}
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: isTracking ? "#dc2626" : "#555",
              boxShadow: isTracking ? "0 0 8px rgba(220,38,38,0.8)" : "none",
              animation: isTracking ? "red-heartbeat 2s ease-in-out infinite" : "none",
            }}
          />
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/80">
              Steering Telemetry
            </h2>
            <p className="text-[9px] text-red-500/60 font-bold tracking-widest mt-0.5">
              VECTOR RENDERER · REAL-TIME
            </p>
          </div>
        </div>

        {/* Angle badge */}
        <div
          className="px-3 py-1.5 rounded-lg font-black text-xs font-mono tracking-wider"
          style={{
            background: "rgba(220,38,38,0.12)",
            border: "1px solid rgba(220,38,38,0.3)",
            color: dirColor,
            boxShadow: `0 0 12px ${dirColor}44`,
          }}
        >
          {Math.round(angleClamped) > 0 ? "+" : ""}{Math.round(angleClamped)}°
        </div>
      </div>

      {/* Wheel arena */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{ background: "radial-gradient(ellipse at center, #1a0004 0%, #070707 80%)" }}
      >
        {/* Holo rings */}
        {[110, 140, 170].map((r, i) => (
          <div
            key={r}
            className="absolute rounded-full border"
            style={{
              width: r * 2, height: r * 2,
              borderColor: `rgba(220,38,38,${0.06 - i * 0.015})`,
              animation: `holo-spin ${14 + i * 4}s linear infinite`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
            }}
          />
        ))}

        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-full" style={{ background: "rgba(220,38,38,0.05)" }} />
          <div className="absolute h-px w-full" style={{ background: "rgba(220,38,38,0.05)" }} />
        </div>

        {/* Lean indicator arc background */}
        <svg className="absolute" width="300" height="300" viewBox="-150 -150 300 300">
          <defs>
            <filter id="glow-red">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {/* Track arc */}
          <path
            d="M -100 60 A 120 120 0 0 1 100 60"
            fill="none"
            stroke="rgba(220,38,38,0.12)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Active arc portion */}
          {absAngle > 3 && (
            <path
              d={`M 0 -120 A 120 120 0 0 ${normalised > 0 ? 1 : 0} ${normalised * 100} ${Math.sqrt(14400 - normalised * normalised * 10000)}`}
              fill="none"
              stroke={dirColor}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.6"
              filter="url(#glow-red)"
            />
          )}
        </svg>

        {/* THE STEERING WHEEL */}
        <svg
          width="220"
          height="220"
          viewBox="0 0 200 200"
          className="relative z-10 drop-shadow-2xl select-none pointer-events-none"
          style={{
            transform: `rotate(${angleClamped}deg)`,
            transition: "transform 0.07s cubic-bezier(0.25, 0.8, 0.25, 1)",
            filter: `drop-shadow(0 0 ${8 + absAngle * 0.3}px rgba(220,38,38,${0.3 + absAngle * 0.004}))`,
          }}
        >
          <defs>
            <radialGradient id="hubG" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#3d0000" />
              <stop offset="60%" stopColor="#1a0000" />
              <stop offset="100%" stopColor="#0a0000" />
            </radialGradient>
            <linearGradient id="rimG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3d0000" />
              <stop offset="40%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#1a0000" />
            </linearGradient>
            <linearGradient id="spokeG" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#2d0000" />
            </linearGradient>
            <filter id="wheel-glow">
              <feGaussianBlur stdDeviation="1.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outer rim shadow */}
          <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth="20" />

          {/* Main rim */}
          <circle cx="100" cy="100" r="82" fill="none" stroke="url(#rimG)" strokeWidth="15" filter="url(#wheel-glow)" />

          {/* Rim highlights */}
          <circle cx="100" cy="100" r="89" fill="none" stroke="rgba(220,38,38,0.25)" strokeWidth="1" />
          <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="1.5" />

          {/* Red center stripe (top) */}
          <path d="M 92 9 A 91 91 0 0 1 108 9" fill="none" stroke="#dc2626" strokeWidth="16" strokeLinecap="butt" />
          <path d="M 93 10 A 90 90 0 0 1 107 10" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.6" />

          {/* Left spoke */}
          <path d="M 18 97 L 72 97 L 72 110 L 18 106 Z" fill="url(#spokeG)" />
          <path d="M 18 97 L 72 97 L 72 100 L 18 99 Z" fill="rgba(239,68,68,0.3)" />

          {/* Right spoke */}
          <path d="M 182 97 L 128 97 L 128 110 L 182 106 Z" fill="url(#spokeG)" />
          <path d="M 182 97 L 128 97 L 128 100 L 182 99 Z" fill="rgba(239,68,68,0.3)" />

          {/* Bottom spoke */}
          <path d="M 93 126 L 107 126 L 104 180 L 96 180 Z" fill="url(#spokeG)" />
          <path d="M 94 126 L 106 126 L 104 132 L 96 132 Z" fill="rgba(239,68,68,0.3)" />

          {/* Red Bull color accents on spokes */}
          <rect x="34" y="97" width="4" height="8" fill="#dc2626" rx="1" />
          <rect x="39" y="97" width="4" height="8" fill="#f97316" rx="1" />
          <rect x="155" y="97" width="4" height="8" fill="#dc2626" rx="1" />
          <rect x="160" y="97" width="4" height="8" fill="#f97316" rx="1" />

          {/* Central hub */}
          <circle cx="100" cy="100" r="32" fill="url(#hubG)" stroke="rgba(220,38,38,0.4)" strokeWidth="1.5" />

          {/* Hub inner ring */}
          <circle cx="100" cy="100" r="24" fill="none" stroke="rgba(220,38,38,0.2)" strokeWidth="1" />

          {/* Red Bull logo-inspired center: red + yellow/gold */}
          <circle cx="100" cy="100" r="20" fill="#0a0000" stroke="rgba(245,158,11,0.4)" strokeWidth="0.8" />
          {/* Top-left red */}
          <path d="M100 100 L100 84 A16 16 0 0 0 84 100 Z" fill="#dc2626" opacity="0.9" />
          {/* Top-right gold */}
          <path d="M100 100 L116 100 A16 16 0 0 0 100 84 Z" fill="#f59e0b" opacity="0.9" />
          {/* Bottom-left gold */}
          <path d="M100 100 L84 100 A16 16 0 0 0 100 116 Z" fill="#f59e0b" opacity="0.9" />
          {/* Bottom-right red */}
          <path d="M100 100 L100 116 A16 16 0 0 0 116 100 Z" fill="#dc2626" opacity="0.9" />
          {/* Center dot */}
          <circle cx="100" cy="100" r="3" fill="#fff" opacity="0.8" />
          {/* Separator */}
          <line x1="100" y1="84" x2="100" y2="116" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
          <line x1="84" y1="100" x2="116" y2="100" stroke="rgba(255,255,255,0.25)" strokeWidth="0.7" />
        </svg>

        {/* Direction indicator */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center">
          <div
            className="px-4 py-1 rounded-full text-[10px] font-black tracking-[0.3em] font-mono transition-all duration-200"
            style={{
              background: `${dirColor}18`,
              border: `1px solid ${dirColor}55`,
              color: dirColor,
              textShadow: `0 0 10px ${dirColor}`,
            }}
          >
            {direction}
          </div>
        </div>

        {/* Corner HUD labels */}
        <div className="absolute top-3 left-4 text-[9px] font-mono font-bold text-red-800/50 tracking-wider">
          STEER.VEC
        </div>
        <div className="absolute top-3 right-4 text-[9px] font-mono font-bold text-red-800/50 tracking-wider">
          {isTracking ? "● LIVE" : "○ IDLE"}
        </div>
      </div>

      {/* Gesture + stats footer */}
      <div
        className="px-5 py-3 flex items-center justify-between border-t gap-3"
        style={{ borderColor: "rgba(220,38,38,0.12)", background: "rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] text-red-800/60 font-bold uppercase tracking-wider shrink-0">Gesture</span>
          <span className="text-[11px] font-black text-amber-400/90 truncate tracking-wide font-mono">
            {gesture || "NONE"}
          </span>
        </div>
        {/* Mini bar gauge */}
        <div className="flex items-center gap-1.5 shrink-0">
          {[-3,-2,-1,0,1,2,3].map(i => {
            const active = normalised >= 0
              ? i >= 0 && i <= Math.ceil(normalised * 3)
              : i <= 0 && i >= Math.floor(normalised * 3);
            return (
              <div
                key={i}
                className="w-1.5 h-5 rounded-sm transition-all duration-100"
                style={{
                  background: active
                    ? i < 0 ? "#f97316" : i === 0 ? "#22c55e" : "#ef4444"
                    : "rgba(255,255,255,0.07)",
                  boxShadow: active ? `0 0 6px ${i < 0 ? "#f97316" : "#ef4444"}aa` : "none",
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
