import { useState, useEffect, useRef } from "react";
import StatsGrid from "../components/dashboard/StatsGrid";
import Steering3D from "../components/steering/Steering3D";
import CameraFeed from "../components/camera/CameraFeed";
import TelemetryChart from "../components/charts/TelemetryChart";
import MiniGame from "../components/dashboard/MiniGame";
import { useStore } from "../store/useStore";
import { SoundEffects } from "../utils/audio";
import { Play, Square, RefreshCw, Sliders, Cpu, Activity, Wifi, ShieldAlert, KeyRound, MonitorSmartphone } from "lucide-react";

export default function Dashboard() {
  const { isTracking, toggleTracking, settings, updateSettings, steeringAngle, speed, gesture, isConnected, confidence, latency } = useStore();
  const [activeView, setActiveView] = useState<"chart" | "game">("game");

  // Counter values for telemetry cards to increment smoothly
  const [smoothedSpeed, setSmoothedSpeed] = useState(0);
  const [smoothedAngle, setSmoothedAngle] = useState(0);
  const [smoothedConfidence, setSmoothedConfidence] = useState(0);

  useEffect(() => {
    let animFrame: number;
    const tick = () => {
      setSmoothedSpeed(prev => prev + (speed - prev) * 0.15);
      setSmoothedAngle(prev => prev + (steeringAngle - prev) * 0.22);
      setSmoothedConfidence(prev => prev + (confidence - prev) * 0.1);
      animFrame = requestAnimationFrame(tick);
    };
    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [speed, steeringAngle, confidence]);

  // Status LEDs matching cockpit buttons
  const activeGesture = gesture || "None";
  const isAccelerating = activeGesture.toLowerCase().includes("accelerat") || activeGesture.toLowerCase().includes("forward") || activeGesture.toLowerCase().includes("high") || activeGesture.toLowerCase().includes("raised") || activeGesture.toLowerCase().includes("nitro");
  const isBraking = activeGesture.toLowerCase().includes("brake") || activeGesture.toLowerCase().includes("closed");
  const dirColor = steeringAngle < -8 ? "#ff9800" : steeringAngle > 8 ? "#ff1744" : "#00ff95";

  const handleStartStop = () => {
    SoundEffects.playSelect();
    toggleTracking();
  };

  const handleReset = () => {
    SoundEffects.playClick();
    useStore.setState({ steeringAngle: 0, speed: 0 });
  };

  const handleSliderChange = (type: "sensitivity" | "deadzone", value: number) => {
    SoundEffects.playTick();
    if (type === "sensitivity") {
      updateSettings({ sensitivity: value });
    } else {
      updateSettings({ deadzone: value });
    }
  };

  const handleViewChange = (view: "chart" | "game") => {
    SoundEffects.playClick();
    setActiveView(view);
  };

  return (
    <div className="flex-1 p-5 md:p-6 flex flex-col gap-5 select-none w-full overflow-y-auto carbon-bg relative">
      {/* Animated Telemetry Overlay Line in Background */}
      <div className="absolute inset-x-0 top-1/4 h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/10 to-transparent pointer-events-none animate-speed-line" />

      {/* ── HEADER BANNER ─────────────────────────────────────────────────── */}
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#00e5ff]/10 bg-[#0d1425]/45 px-5 py-3.5 rounded-xl border relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        {/* F1 Cockpit Title */}
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-gradient-to-b from-[#2563eb] to-[#00e5ff] rounded-full" />
          <div>
            <h1 className="text-xl font-extrabold tracking-[0.25em] text-[#f8fafc] uppercase flex items-center gap-2">
              DRIVESENSE <span className="text-[#00e5ff] font-mono">F1</span>
            </h1>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mt-0.5">
              Formula One Digital Telemetry Cockpit
            </p>
          </div>
        </div>

        {/* HUD System State indicators & Action Buttons */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#050816] border border-slate-800">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isTracking ? "bg-[#00ff95] animate-green-pulse" : "bg-[#ff1744] animate-red-pulse"
              }`}
            />
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              ECU STATE: {isTracking ? "ACTIVE" : "STANDBY"}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#050816] border border-slate-800">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-[#00ff95] animate-green-pulse" : "bg-[#ff9800] animate-cyan-pulse"
              }`}
            />
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase">
              LINK: {isConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          {/* Quick Engine Command Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleStartStop}
              className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1.5 transition-all border cursor-pointer hover:scale-105 active:scale-95`}
              style={isTracking ? {
                background: "rgba(255,23,68,0.12)",
                color: "#ff1744",
                boxShadow: "0 0 15px rgba(255,23,68,0.25)",
                borderColor: "rgba(255,23,68,0.4)",
              } : {
                background: "rgba(37,99,235,0.12)",
                color: "#00e5ff",
                boxShadow: "0 0 15px rgba(37,99,235,0.15)",
                borderColor: "rgba(37,99,235,0.35)",
              }}
            >
              {isTracking ? (
                <><Square className="w-3 h-3 fill-current" /><span>Stop Engine</span></>
              ) : (
                <><Play className="w-3 h-3 fill-current" /><span>Start Engine</span></>
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={!isTracking}
              className="p-2 rounded-lg border border-slate-800 bg-[#0d1425]/50 text-slate-400 hover:text-[#f8fafc] hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              title="Reset Calibration"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── THREE COLUMN COCKPIT DISPLAY GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* ── COLUMN A: AI SCANNER PANEL (Left Column - Span 3.5) ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="glass-card rounded-2xl border border-slate-800/80 p-4 flex flex-col gap-3 relative overflow-hidden flex-1 justify-between shadow-2xl">
            {/* HUD Bracket Styling Corners */}
            <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00e5ff]/50 pointer-events-none" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00e5ff]/50 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00e5ff]/50 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00e5ff]/50 pointer-events-none" />

            {/* Title HUD Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/60 z-10">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#00e5ff]" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#f8fafc]/80">
                  AI OPTICAL SCANNER
                </h2>
              </div>
              <span className="text-[8px] font-mono font-bold text-slate-500">SYS_LOC_MP_H04</span>
            </div>

            {/* Embedded Live Camera Feed with scanning overlay */}
            <div className="relative rounded-lg overflow-hidden border border-slate-900 bg-black flex-1 flex items-center justify-center min-h-[220px]">
              <CameraFeed />
              {/* Target Scan crosshair */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-8 h-8 rounded-full border border-[#00e5ff]/20 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#00e5ff]/35 rounded-full" />
                </div>
              </div>
              {/* Scanline Sweep animation */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#00e5ff]/8 to-transparent pointer-events-none z-20 animate-scan-line" />
            </div>

            {/* Live Tracking HUD stats */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 font-mono z-10">
              <div className="flex flex-col p-2 bg-[#050816]/60 border border-slate-900 rounded-lg">
                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Tracker state</span>
                <span className="text-[10px] font-bold text-[#f8fafc] mt-0.5 uppercase">
                  {isTracking ? "● TRACKING" : "○ SCANNER OFF"}
                </span>
              </div>
              <div className="flex flex-col p-2 bg-[#050816]/60 border border-slate-900 rounded-lg">
                <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Optical FPS</span>
                <span className="text-[10px] font-bold text-[#00ff95] mt-0.5">
                  {isTracking ? "60 FPS" : "0 FPS"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMN B: HERO F1 WHEEL & CALIBRATION (Center Column - Span 5) ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Steering3D />

          {/* Quick Cockpit Calibrations */}
          <div className="glass-card p-4.5 rounded-2xl border border-slate-800/80 flex flex-col gap-3.5 shadow-2xl">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/60">
              <Sliders className="w-3.5 h-3.5 text-[#00e5ff]" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#f8fafc]/80">
                Cockpit Calibrations
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 py-1">
              {/* Sensitivity */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Sensitivity Scale</span>
                  <span className="font-black font-mono text-[#ff9800]">
                    {settings.sensitivity.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range" min="0.5" max="3.0" step="0.1"
                  value={settings.sensitivity}
                  onChange={e => handleSliderChange("sensitivity", parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#ff9800]"
                />
                <span className="text-[7.5px] text-slate-500 uppercase tracking-wider">
                  Translates wheel steering inputs.
                </span>
              </div>

              {/* Deadzone */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span>Steering Deadzone</span>
                  <span className="font-black font-mono text-[#00e5ff]">
                    {settings.deadzone}°
                  </span>
                </div>
                <input
                  type="range" min="0" max="20" step="1"
                  value={settings.deadzone}
                  onChange={e => handleSliderChange("deadzone", parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00e5ff]"
                />
                <span className="text-[7.5px] text-slate-500 uppercase tracking-wider">
                  Ignore center hand jitter.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUMN C: REAL-TIME TELEMETRY GRID (Right Column - Span 3.5) ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="glass-card rounded-2xl border border-slate-800/80 p-4.5 flex flex-col gap-3.5 relative overflow-hidden flex-1 justify-between shadow-2xl">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-800/60 z-10">
              <Activity className="w-3.5 h-3.5 text-[#00e5ff]" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#f8fafc]/80">
                F1 Telemetry Console
              </h2>
            </div>

            {/* Vertical Stack of Telemetry stats with smooth value renders */}
            <div className="flex-1 flex flex-col gap-2.5 justify-center py-1.5 z-10">
              
              {/* SPEED CARD */}
              <div className="flex items-center justify-between p-3 bg-[#0d1425]/45 border border-slate-800/60 rounded-xl">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Velocity</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-[#f8fafc] tracking-wider" style={{ fontFamily: "Orbitron" }}>
                    {Math.round(smoothedSpeed)}
                  </span>
                  <span className="text-[7px] text-slate-500 font-bold font-mono">KM/H</span>
                </div>
              </div>

              {/* STEERING ANGLE CARD */}
              <div className="flex items-center justify-between p-3 bg-[#0d1425]/45 border border-slate-800/60 rounded-xl">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Steer Angle</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono tracking-wider" style={{ color: dirColor, fontFamily: "Orbitron" }}>
                    {Math.round(smoothedAngle) > 0 ? "+" : ""}{Math.round(smoothedAngle)}°
                  </span>
                  <span className="text-[7px] text-slate-500 font-bold font-mono">DEG</span>
                </div>
              </div>

              {/* INPUT LATENCY CARD */}
              <div className="flex items-center justify-between p-3 bg-[#0d1425]/45 border border-slate-800/60 rounded-xl">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Input Latency</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono text-[#00ff95] tracking-wider" style={{ fontFamily: "Orbitron" }}>
                    {isTracking ? latency : 0}
                  </span>
                  <span className="text-[7px] text-slate-500 font-bold font-mono">MS</span>
                </div>
              </div>

              {/* ACTIVE GESTURE CARD */}
              <div className="flex items-center justify-between p-3 bg-[#0d1425]/45 border border-slate-800/60 rounded-xl">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Active Command</span>
                <span className="text-xs font-bold font-mono text-[#00e5ff] tracking-widest uppercase">
                  {gesture === "None" ? "N/A" : gesture}
                </span>
              </div>

              {/* MODEL CONFIDENCE */}
              <div className="flex items-center justify-between p-3 bg-[#0d1425]/45 border border-slate-800/60 rounded-xl">
                <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Scanner Confidence</span>
                <span className="text-sm font-bold font-mono text-[#f8fafc]" style={{ fontFamily: "Orbitron" }}>
                  {isTracking ? Math.round(smoothedConfidence) : 0}%
                </span>
              </div>
            </div>

            {/* WebSocket Port tag */}
            <div className="flex items-center justify-between text-[7px] font-mono text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-800/60 z-10">
              <span>WS_LINK_PORT: 8000</span>
              <span>DEV_STAGE: DRIVESENSE_AI</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── TABBED WIDGET SECTION: GRAPH OR 2D RACING SIMULATOR ── */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span className="text-[9px] font-black tracking-[0.3em] uppercase text-slate-400">
              Interactive Cockpit Diagnostics
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleViewChange("game")}
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all cursor-pointer`}
              style={activeView === "game" ? {
                background: "rgba(0,229,255,0.12)", color: "#00e5ff",
                borderColor: "rgba(0,229,255,0.4)", boxShadow: "0 0 10px rgba(0,229,255,0.15)",
              } : {
                background: "#050816/40", color: "#94a3b8",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              Driving Simulator
            </button>
            <button
              onClick={() => handleViewChange("chart")}
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all cursor-pointer`}
              style={activeView === "chart" ? {
                background: "rgba(0,229,255,0.12)", color: "#00e5ff",
                borderColor: "rgba(0,229,255,0.4)", boxShadow: "0 0 10px rgba(0,229,255,0.15)",
              } : {
                background: "#050816/40", color: "#94a3b8",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              Telemetry Graph
            </button>
          </div>
        </div>

        <div className="w-full flex-1">
          {activeView === "chart" ? <TelemetryChart /> : <MiniGame />}
        </div>
      </div>

      {/* ── BOTTOM COCKPIT STATUS GRID & LED INDICATORS ── */}
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#0d1425]/45 rounded-xl border border-[#00e5ff]/10 shadow-2xl relative">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        
        {/* Pedal LEDs: Accelerator & Brake */}
        <div className="flex items-center gap-3 bg-[#050816]/75 border border-slate-800/80 px-3.5 py-2.5 rounded-lg">
          <div className="flex gap-1.5">
            <span
              className={`w-3.5 h-3.5 rounded-full border border-red-950 transition-all ${
                isBraking ? "bg-[#ff1744] shadow-[0_0_8px_#ff1744]" : "bg-neutral-800"
              }`}
            />
            <span
              className={`w-3.5 h-3.5 rounded-full border border-green-950 transition-all ${
                isAccelerating ? "bg-[#00ff95] shadow-[0_0_8px_#00ff95]" : "bg-neutral-800"
              }`}
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Cockpit Pedals</span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
              {isBraking ? "Braking" : isAccelerating ? "Throttle" : "Standby"}
            </span>
          </div>
        </div>

        {/* Keyboard OS Hook Process LED */}
        <div className="flex items-center gap-3 bg-[#050816]/75 border border-slate-800/80 px-3.5 py-2.5 rounded-lg">
          <KeyRound className="w-4 h-4 text-[#00e5ff] drop-shadow-[0_0_4px_#00e5ff]" />
          <div className="flex flex-col text-left">
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">OS KEYBOARD DRIVER</span>
            <span className="text-[9px] font-bold text-[#00ff95] uppercase tracking-widest mt-0.5">
              VIRTUAL HOOK ON
            </span>
          </div>
        </div>

        {/* WebSocket Signal Transmission status */}
        <div className="flex items-center gap-3 bg-[#050816]/75 border border-slate-800/80 px-3.5 py-2.5 rounded-lg">
          <Wifi className="w-4 h-4 text-[#00e5ff] drop-shadow-[0_0_4px_#00e5ff]" />
          <div className="flex flex-col text-left">
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">WEBSOCKET STATUS</span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
              {isConnected ? "TX/RX LINKED" : "PORT 8000 STANDBY"}
            </span>
          </div>
        </div>

        {/* Virtual Driver Controller link state */}
        <div className="flex items-center gap-3 bg-[#050816]/75 border border-slate-800/80 px-3.5 py-2.5 rounded-lg">
          <MonitorSmartphone className="w-4 h-4 text-[#00e5ff]" />
          <div className="flex flex-col text-left">
            <span className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">SIM SYSTEM INTERFACE</span>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
              ELECTRON DEVICE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}