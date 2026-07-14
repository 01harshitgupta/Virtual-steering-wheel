import { useState } from "react";
import StatsGrid from "../components/dashboard/StatsGrid";
import Steering3D from "../components/steering/Steering3D";
import CameraFeed from "../components/camera/CameraFeed";
import TelemetryChart from "../components/charts/TelemetryChart";
import MiniGame from "../components/dashboard/MiniGame";
import { useStore } from "../store/useStore";
import { Play, Square, RefreshCw, Sliders } from "lucide-react";

export default function Dashboard() {
  const { isTracking, toggleTracking, settings, updateSettings } = useStore();
  const [activeView, setActiveView] = useState<"chart" | "game">("game"); // Default to game to showcase it immediately!
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 select-none max-w-7xl mx-auto w-full text-[var(--text-primary)] transition-colors duration-200">
      {/* Upper Header Control summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-primary)] pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
            Control Console
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-widest">
            DriveSense Console • Real-time Telemetry Center
          </p>
        </div>

        {/* Dashboard quick commands */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTracking}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 transition-all shadow-sm ${
              isTracking
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/10"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
            }`}
          >
            {isTracking ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white text-white" />
                <span>Stop Engine</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Start Engine</span>
              </>
            )}
          </button>

          <button
            onClick={() => useStore.setState({ steeringAngle: 0, speed: 0 })}
            disabled={!isTracking}
            className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm"
            title="Reset Centering"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards Display */}
      <StatsGrid />

      {/* Main Interactive Layout - Supports Expanded Camera Feed */}
      <div className="flex flex-col gap-6">
        {isCameraExpanded ? (
          <>
            <CameraFeed isExpanded={isCameraExpanded} onToggleExpand={() => setIsCameraExpanded(false)} />
            <Steering3D />
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Steering3D />
            <CameraFeed isExpanded={isCameraExpanded} onToggleExpand={() => setIsCameraExpanded(true)} />
          </div>
        )}
      </div>

      {/* Lower section containing charts & sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tab-controlled Telemetry View */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex gap-2.5">
            <button
              onClick={() => setActiveView("chart")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                activeView === "chart"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Telemetry Graph
            </button>
            
            <button
              onClick={() => setActiveView("game")}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
                activeView === "game"
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-primary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Driving Simulator 🚗
            </button>
          </div>
          
          {activeView === "chart" ? <TelemetryChart /> : <MiniGame />}
        </div>

        {/* Configurations sliders */}
        <div className="glass-card p-5 rounded-2xl border border-[var(--border-primary)] shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Quick Calibrations
            </h2>
          </div>
 
          <div className="flex-1 flex flex-col justify-center gap-5 py-2">
            {/* Sensitivity */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <span>Steering Sensitivity</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{settings.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.sensitivity}
                onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">
                Multiplies head/hand rotation translation outputs.
              </span>
            </div>
 
            {/* Deadzone */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <span>Steering Deadzone</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{settings.deadzone}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={settings.deadzone}
                onChange={(e) => updateSettings({ deadzone: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">
                Ignore motion inputs below this angle threshold.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}