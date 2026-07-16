import { useState } from "react";
import { useStore } from "../../store/useStore";

export default function TelemetryChart() {
  const { history } = useStore();
  const [activeTab, setActiveTab] = useState<"angle" | "speed">("angle");

  // SVG dimensions
  const width = 500;
  const height = 150;
  const padding = 15;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min/max values to auto-scale
  const points = history.map((h) => (activeTab === "angle" ? h.angle : h.speed));
  const maxVal = Math.max(...points, activeTab === "angle" ? 45 : 120);
  const minVal = Math.min(...points, activeTab === "angle" ? -45 : 0);
  const range = maxVal - minVal || 1;

  // Generate SVG coordinates
  const svgPoints = history.map((item, index) => {
    const val = activeTab === "angle" ? item.angle : item.speed;
    const x = padding + (index / (history.length - 1)) * chartWidth;
    // Invert Y coordinate since SVG (0,0) is top-left
    const y = padding + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y };
  });

  // Create path command
  let pathD = "";
  let areaD = "";

  if (svgPoints.length > 0) {
    pathD = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
    for (let i = 1; i < svgPoints.length; i++) {
      // Smooth bezier curves
      const prev = svgPoints[i - 1];
      const curr = svgPoints[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    // Close the area path for the gradient fill
    areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${height - padding} L ${
      svgPoints[0].x
    } ${height - padding} Z`;
  }

  return (
    <div className="glass-card p-5 rounded-2xl shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
            Telemetry Graph
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-sans">Real-time signal tracking log</p>
        </div>
        <div className="flex bg-[var(--border-secondary)] p-0.5 rounded-lg border border-[var(--border-primary)]">
          <button
            onClick={() => setActiveTab("angle")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === "angle"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
            }`}
          >
            Steering Angle
          </button>
          <button
            onClick={() => setActiveTab("speed")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wide transition-all cursor-pointer ${
              activeTab === "speed"
                ? "bg-red-600 text-white shadow-sm shadow-red-500/10"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent"
            }`}
          >
            Velocity
          </button>
        </div>
      </div>

      <div className="relative w-full h-[150px] bg-[var(--bg-primary)]/40 rounded-xl overflow-hidden border border-[var(--border-secondary)] p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="blueAreaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00a3e0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00a3e0" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="redAreaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e82b2b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#e82b2b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="rgba(156, 163, 175, 0.12)"
            strokeDasharray="2 2"
          />
          <line
            x1={padding}
            y1={padding + chartHeight / 2}
            x2={width - padding}
            y2={padding + chartHeight / 2}
            stroke="rgba(156, 163, 175, 0.18)"
            strokeDasharray="2 2"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(156, 163, 175, 0.12)"
          />

          {/* Grid vertical markers */}
          <line
            x1={padding + chartWidth / 4}
            y1={padding}
            x2={padding + chartWidth / 4}
            y2={height - padding}
            stroke="rgba(156, 163, 175, 0.08)"
          />
          <line
            x1={padding + chartWidth / 2}
            y1={padding}
            x2={padding + chartWidth / 2}
            y2={height - padding}
            stroke="rgba(156, 163, 175, 0.12)"
            strokeDasharray="4 4"
          />
          <line
            x1={padding + (chartWidth * 3) / 4}
            y1={padding}
            x2={padding + (chartWidth * 3) / 4}
            y2={height - padding}
            stroke="rgba(156, 163, 175, 0.08)"
          />

          {/* Render Area Plot */}
          {areaD && (
            <path
              d={areaD}
              fill={activeTab === "angle" ? "url(#blueAreaGlow)" : "url(#redAreaGlow)"}
            />
          )}

          {/* Render Line Plot */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={activeTab === "angle" ? "#00a3e0" : "#e82b2b"}
              strokeWidth="2"
              strokeLinecap="round"
            />
          )}

          {/* Interactive point indicator */}
          {svgPoints.length > 0 && (
            <circle
              cx={svgPoints[svgPoints.length - 1].x}
              cy={svgPoints[svgPoints.length - 1].y}
              r="4"
              fill={activeTab === "angle" ? "#00a3e0" : "#e82b2b"}
              stroke="white"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Labels overlay */}
        <div className="absolute top-2 left-3 flex flex-col text-[9px] text-[var(--text-secondary)] font-bold font-mono">
          <span>MAX: {Math.round(maxVal)}</span>
        </div>
        <div className="absolute bottom-2 left-3 flex flex-col text-[9px] text-[var(--text-secondary)] font-bold font-mono">
          <span>MIN: {Math.round(minVal)}</span>
        </div>
      </div>
    </div>
  );
}
