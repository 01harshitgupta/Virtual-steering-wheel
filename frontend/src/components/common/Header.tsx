import { Settings, Info, Activity, X, HelpCircle, Key, Play, Sun, Moon, Cpu, HardDrive, User, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { isConnected, isTracking, latency } = useStore();
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode as requested by user ("some light color")
  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0 });

  // Synchronize isDarkMode with document.documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Dynamically poll CPU & RAM telemetry from Electron main process
  useEffect(() => {
    const ds = (window as any).DriveSense;
    if (!ds || !ds.getSystemStats) {
      // Standby mock statistics generator if running inside local web browsers
      const interval = setInterval(() => {
        setSysStats({
          cpu: Math.round(1 + Math.random() * 2),
          ram: 142
        });
      }, 1500);
      return () => clearInterval(interval);
    }

    let active = true;
    async function updateStats() {
      try {
        const stats = await ds.getSystemStats();
        if (active) {
          setSysStats(stats);
        }
      } catch {}
    }

    updateStats();
    const interval = setInterval(updateStats, 1500);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header
      className="h-16 px-6 flex items-center justify-between select-none z-10 w-full relative"
      style={{
        background: "linear-gradient(90deg, #0d0000 0%, #080000 50%, #0d0000 100%)",
        borderBottom: "1px solid rgba(220,38,38,0.18)",
      }}
    >
      {/* Subtle speed line sweep */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-px animate-speed-line"
          style={{ background: "linear-gradient(90deg, transparent, rgba(220,38,38,0.15), transparent)", animationDuration: "4s" }} />
      </div>
      {/* Left: Brand + status */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
          <Zap className="w-5 h-5 transition-all duration-300 group-hover:scale-110" style={{ color: "#ef4444", filter: "drop-shadow(0 0 4px rgba(239,68,68,0.6))" }} />
          <span className="font-black text-sm uppercase tracking-[0.15em]" style={{
            background: "linear-gradient(135deg, #fff 0%, #ef4444 80%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            DriveSense Console
          </span>
        </div>
        <span className="h-4 w-px" style={{ background: "rgba(220,38,38,0.2)" }} />
        <div
          className="flex items-center gap-2 px-2 py-1 rounded"
          style={{
            background: isConnected ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${isConnected ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: isConnected ? "#22c55e" : "rgba(255,255,255,0.2)",
              boxShadow: isConnected ? "0 0 6px rgba(34,197,94,0.9)" : "none",
              animation: isConnected ? "red-heartbeat 2s ease-in-out infinite" : "none",
            }}
          />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isConnected ? "#4ade80" : "rgba(255,255,255,0.3)" }}>
            {isConnected ? "Server Online" : "Server Standby"}
          </span>
        </div>
      </div>

      {/* Right: Telemetry bar + actions */}
      <div className="flex items-center gap-4 relative z-10">
        <div
          className="hidden md:flex items-center gap-4 text-[10px] font-mono font-bold px-4 py-1.5 rounded-xl"
          style={{
            background: "rgba(220,38,38,0.06)",
            border: "1px solid rgba(220,38,38,0.15)",
            color: "rgba(255,255,255,0.4)",
          }}
        >
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3" style={{ color: "rgba(220,38,38,0.6)" }} />
            <span>CPU: {sysStats.cpu}%</span>
          </span>
          <span className="w-px h-3" style={{ background: "rgba(220,38,38,0.2)" }} />
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3" style={{ color: "rgba(220,38,38,0.6)" }} />
            <span>RAM: {sysStats.ram} MB</span>
          </span>
          {isTracking && (
            <>
              <span className="w-px h-3" style={{ background: "rgba(220,38,38,0.2)" }} />
              <span className="flex items-center gap-1.5" style={{ color: "#f97316" }}>
                <Activity className="w-3 h-3 animate-pulse" />
                <span>{latency}ms</span>
              </span>
              <span className="w-px h-3" style={{ background: "rgba(220,38,38,0.2)" }} />
              <span style={{ color: "#ef4444", textShadow: "0 0 6px rgba(239,68,68,0.5)" }}>60 FPS</span>
            </>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl border transition-all cursor-pointer"
            style={{
              background: "rgba(220,38,38,0.07)",
              borderColor: "rgba(220,38,38,0.2)",
              color: "rgba(220,38,38,0.6)",
            }}
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-xl border transition-all cursor-pointer"
            style={{ background: "rgba(220,38,38,0.07)", borderColor: "rgba(220,38,38,0.2)", color: "rgba(220,38,38,0.6)" }}
            title="System Diagnostics"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl border transition-all cursor-pointer"
            style={{ background: "rgba(220,38,38,0.07)", borderColor: "rgba(220,38,38,0.2)", color: "rgba(220,38,38,0.6)" }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <span className="h-4 w-px" style={{ background: "rgba(220,38,38,0.15)" }} />
          <button
            className="w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
            style={{ background: "rgba(220,38,38,0.07)", borderColor: "rgba(220,38,38,0.2)", color: "rgba(220,38,38,0.6)" }}
            title="Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help / Information Modal Popover overlay */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4 relative"
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header info */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-900">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  DriveSense Quick Guide
                </h3>
              </div>

              {/* Content detail */}
              <div className="flex flex-col gap-4 text-xs text-slate-400 leading-relaxed font-sans">
                <p>
                  Welcome to <strong>DriveSense Console</strong>. This software bridges real-time hand-gestures from your webcam to trigger native keyboard commands globally on Windows.
                </p>

                {/* Steps list */}
                <div className="flex flex-col gap-2 bg-slate-950/50 p-3.5 rounded-xl border border-slate-900">
                  <div className="flex items-start gap-2">
                    <Play className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>
                      Click <strong>Start Engine</strong> in the dashboard to turn on the camera tracker.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Key className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                    <span>
                      Focus any browser tab (like CrazyGames) to control it with tilts & hand distance levels!
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-slate-900 pt-3">
                  <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                    Default Virtual Bindings:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                    <li>Tilt hands left/right: Turns A / D (ArrowLeft / ArrowRight)</li>
                    <li>Hold hands wide: Accelerates W (ArrowUp)</li>
                    <li>Show open palm close to screen: Sudden Brake Spacebar (S)</li>
                  </ul>
                </div>
              </div>

              {/* Footer close */}
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15 text-xs font-bold uppercase tracking-wider mt-2 transition-all cursor-pointer"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
