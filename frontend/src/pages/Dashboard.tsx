import { useState } from "react";
import StatsGrid from "../components/dashboard/StatsGrid";
import Steering3D from "../components/steering/Steering3D";
import DraggableCameraWindow from "../components/camera/DraggableCameraWindow";
import TelemetryChart from "../components/charts/TelemetryChart";
import MiniGame from "../components/dashboard/MiniGame";
import { useStore } from "../store/useStore";
import { Play, Square, RefreshCw, Sliders } from "lucide-react";

export default function Dashboard() {
  const { isTracking, toggleTracking, settings, updateSettings } = useStore();
  const [activeView, setActiveView] = useState<"chart" | "game">("game");

  return (
    <>
      {/* ── Floating draggable camera (portal-like, renders over everything) ── */}
      <DraggableCameraWindow defaultX={window.innerWidth - 400} defaultY={90} />

      {/* ── Main scrollable page ───────────────────────────────────────────── */}
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 select-none max-w-7xl mx-auto w-full overflow-y-auto">

        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border-secondary)]"
        >
          <div>
            <h1
              className="text-3xl font-black tracking-tight"
              style={{
                background: "linear-gradient(135deg, var(--text-primary) 0%, var(--accent-bright) 70%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Control Console
            </h1>
            <p
              className="text-[10px] mt-1 font-black uppercase tracking-[0.3em] text-[var(--text-secondary)]/80"
            >
              DriveSense AI · Real-time Telemetry Hub
            </p>
          </div>

          {/* Quick commands */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTracking}
              className="px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase flex items-center gap-2 transition-all cursor-pointer"
              style={isTracking ? {
                background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
                color: "#fff",
                boxShadow: "0 0 20px rgba(220,38,38,0.35)",
                border: "1px solid rgba(220,38,38,0.5)",
              } : {
                background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
                color: "#fff",
                border: "1px solid rgba(37,99,235,0.4)",
              }}
            >
              {isTracking ? (
                <><Square className="w-3.5 h-3.5 fill-white" /><span>Stop Engine</span></>
              ) : (
                <><Play className="w-3.5 h-3.5 fill-white" /><span>Start Engine</span></>
              )}
            </button>

            <button
              onClick={() => useStore.setState({ steeringAngle: 0, speed: 0 })}
              disabled={!isTracking}
              className="p-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--border-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main content: Steering3D takes full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steering wheel — takes 2/3 */}
          <div className="lg:col-span-2">
            <Steering3D />
          </div>

          {/* Quick Calibrations — 1/3 */}
          <div
            className="glass-card p-5 rounded-2xl flex flex-col gap-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-secondary)]">
              <Sliders className="w-4 h-4 text-red-500/80" />
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)]/80">
                Quick Calibrations
              </h2>
            </div>
            <div className="flex-1 flex flex-col justify-center gap-6 py-2">
              {/* Sensitivity */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span>Steering Sensitivity</span>
                  <span className="font-black font-mono" style={{ color: "#f97316" }}>
                    {settings.sensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range" min="0.5" max="3.0" step="0.1"
                  value={settings.sensitivity}
                  onChange={e => updateSettings({ sensitivity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${((settings.sensitivity - 0.5) / 2.5) * 100}%, rgba(156, 163, 175, 0.25) ${((settings.sensitivity - 0.5) / 2.5) * 100}%, rgba(156, 163, 175, 0.25) 100%)`,
                  }}
                />
                <span className="text-[10px] text-[var(--text-secondary)]/60">
                  Multiplies hand rotation translation outputs.
                </span>
              </div>

              {/* Deadzone */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                  <span>Steering Deadzone</span>
                  <span className="font-black font-mono" style={{ color: "#facc15" }}>
                    {settings.deadzone}°
                  </span>
                </div>
                <input
                  type="range" min="0" max="20" step="1"
                  value={settings.deadzone}
                  onChange={e => updateSettings({ deadzone: parseInt(e.target.value) })}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #facc15 0%, #facc15 ${(settings.deadzone / 20) * 100}%, rgba(156, 163, 175, 0.25) ${(settings.deadzone / 20) * 100}%, rgba(156, 163, 175, 0.25) 100%)`,
                  }}
                />
                <span className="text-[10px] text-[var(--text-secondary)]/60">
                  Ignore motion below this angle threshold.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry / Simulator */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("chart")}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer"
              style={activeView === "chart" ? {
                background: "rgba(220,38,38,0.15)", color: "#ef4444",
                borderColor: "rgba(220,38,38,0.4)", boxShadow: "0 0 12px rgba(220,38,38,0.2)",
              } : {
                background: "var(--border-secondary)", color: "var(--text-secondary)",
                borderColor: "var(--border-primary)",
              }}
            >
              Telemetry Graph
            </button>
            <button
              onClick={() => setActiveView("game")}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer"
              style={activeView === "game" ? {
                background: "rgba(249,115,22,0.12)", color: "#f97316",
                borderColor: "rgba(249,115,22,0.4)", boxShadow: "0 0 12px rgba(249,115,22,0.15)",
              } : {
                background: "var(--border-secondary)", color: "var(--text-secondary)",
                borderColor: "var(--border-primary)",
              }}
            >
              Driving Simulator 🚗
            </button>
          </div>

          {activeView === "chart" ? <TelemetryChart /> : <MiniGame />}
        </div>

        {/* ── Odometer cluster — at the BOTTOM, non-distracting ─────────── */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-[var(--border-secondary)]" />
            <span className="text-[9px] font-black tracking-[0.35em] uppercase text-[var(--text-secondary)]/70">
              Live Instrument Cluster
            </span>
            <div className="h-px flex-1 bg-[var(--border-secondary)]" />
          </div>
          <StatsGrid />
        </div>

      </div>
    </>
  );
}