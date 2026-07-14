import { useStore } from "../../store/useStore";
import { Compass } from "lucide-react";

export default function Steering3D() {
  const { steeringAngle, gesture } = useStore();

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 relative overflow-hidden h-[380px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Steering Telemetry (Vector)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time angle visualizer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
            ANGLE: {Math.round(steeringAngle)}°
          </div>
          <div className="font-mono text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            GESTURE: {gesture}
          </div>
        </div>
      </div>

      {/* 2D Vector Wheel Container */}
      <div className="flex-1 rounded-xl bg-slate-50 relative border border-slate-100 overflow-hidden flex items-center justify-center">
        
        {/* SVG Steering Wheel */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="drop-shadow-md select-none pointer-events-none"
          style={{
            transform: `rotate(${steeringAngle}deg)`,
            transition: "transform 0.08s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
        >
          {/* Gradients */}
          <defs>
            <radialGradient id="hubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="spokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#192231" />
            </linearGradient>
          </defs>

          {/* Outer Wheel Rim Torus */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="url(#rimGrad)"
            strokeWidth="16"
          />

          {/* Inner metallic accent rim */}
          <circle
            cx="100"
            cy="100"
            r="89.5"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="0.8"
            opacity="0.3"
          />
          <circle
            cx="100"
            cy="100"
            r="74.5"
            fill="none"
            stroke="#000000"
            strokeWidth="1.2"
            opacity="0.5"
          />

          {/* Centering Top Stripe (BMW M Red Indicator) */}
          <path
            d="M 94 10 A 90 90 0 0 1 106 10"
            fill="none"
            stroke="#e82b2b"
            strokeWidth="16.5"
          />

          {/* Left/Right Spokes */}
          {/* Left Spoke */}
          <path
            d="M 18 100 L 75 100 L 75 112 L 18 108 Z"
            fill="url(#spokeGrad)"
          />
          {/* Right Spoke */}
          <path
            d="M 182 100 L 125 100 L 125 112 L 182 108 Z"
            fill="url(#spokeGrad)"
          />

          {/* BMW M-Sport Racing Stripes on the Spoke panels */}
          {/* Left Spoke Stripes */}
          <rect x="35" y="100" width="3" height="6" fill="#00a3e0" />
          <rect x="38" y="100" width="3" height="6" fill="#00246b" />
          <rect x="41" y="100" width="3" height="6" fill="#e82b2b" />

          {/* Right Spoke Stripes */}
          <rect x="155" y="100" width="3" height="6" fill="#00a3e0" />
          <rect x="158" y="100" width="3" height="6" fill="#00246b" />
          <rect x="161" y="100" width="3" height="6" fill="#e82b2b" />

          {/* Bottom Spoke */}
          <path
            d="M 93 125 L 107 125 L 104 180 L 96 180 Z"
            fill="url(#spokeGrad)"
          />

          {/* Central Hub */}
          <circle
            cx="100"
            cy="100"
            r="32"
            fill="url(#hubGrad)"
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* BMW Center Logo Plate */}
          <circle
            cx="100"
            cy="100"
            r="20"
            fill="#0f172a"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />

          {/* BMW Logo Inner quarters */}
          {/* Top-Left: White */}
          <path d="M 100 100 L 100 84 A 16 16 0 0 0 84 100 Z" fill="#ffffff" />
          {/* Top-Right: Sky Blue */}
          <path d="M 100 100 L 116 100 A 16 16 0 0 0 100 84 Z" fill="#00a3e0" />
          {/* Bottom-Left: Sky Blue */}
          <path d="M 100 100 L 84 100 A 16 16 0 0 0 100 116 Z" fill="#00a3e0" />
          {/* Bottom-Right: White */}
          <path d="M 100 100 L 100 116 A 16 16 0 0 0 116 100 Z" fill="#ffffff" />

          {/* Logo silver separator lines */}
          <line x1="100" y1="84" x2="100" y2="116" stroke="#94a3b8" strokeWidth="0.5" />
          <line x1="84" y1="100" x2="116" y2="100" stroke="#94a3b8" strokeWidth="0.5" />

        </svg>

        {/* Ambient overlay info */}
        <div className="absolute bottom-3 left-4 flex flex-col gap-0.5 text-[10px] text-slate-400 font-mono font-medium">
          <span>VECTOR RENDERING: ACTIVE</span>
          <span>GPU LOAD: 0%</span>
        </div>

        <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-medium">
          <span>STABILIZATION: ON</span>
        </div>
      </div>
    </div>
  );
}
