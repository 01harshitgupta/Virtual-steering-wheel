import { Shield, Settings, Info, Activity, X, HelpCircle, Key, Play, Sun, Moon, Cpu, HardDrive, User } from "lucide-react";
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
    <header className="h-16 border-b border-[var(--border-primary)] bg-[var(--bg-card)] backdrop-blur-md px-6 flex items-center justify-between select-none z-10 w-full relative transition-colors duration-200">
      {/* Left: Branding & Status Links */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
          <Shield className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-primary)] transition-colors duration-200">
            DriveSense Console
          </span>
        </div>
        <span className="h-4 w-px bg-[var(--border-primary)]" />
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
            Status:
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5 ${
              isConnected
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-blue-500 animate-pulse" : "bg-slate-400"}`} />
            {isConnected ? "Server Link Online" : "Server Link Standby"}
          </span>
        </div>
      </div>

      {/* Right: Live Diagnostics, Theme control & Profile triggers */}
      <div className="flex items-center gap-5">
        {/* Core telemetry details (CPU, RAM, latency & FPS logs) */}
        <div className="hidden md:flex items-center gap-5 text-[10px] font-mono font-semibold text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] px-4 py-1.5 rounded-xl transition-colors duration-200">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>CPU: {sysStats.cpu}%</span>
          </span>
          <span className="w-px h-3.5 bg-[var(--border-primary)]" />
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-blue-500" />
            <span>RAM: {sysStats.ram} MB</span>
          </span>
          {isTracking && (
            <>
              <span className="w-px h-3.5 bg-[var(--border-primary)]" />
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse text-blue-600 dark:text-blue-400" />
                <span>LATENCY: {latency}ms</span>
              </span>
              <span className="w-px h-3.5 bg-[var(--border-primary)]" />
              <span className="text-red-500 font-bold">FPS: 60</span>
            </>
          )}
        </div>

        <span className="hidden sm:inline h-4 w-px bg-[var(--border-primary)]" />

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:opacity-85 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            onClick={() => setShowInfoModal(true)}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:opacity-85 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="System Diagnostics"
          >
            <Info className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-xl bg-[var(--bg-secondary)] hover:opacity-85 border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Open Configurations"
          >
            <Settings className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-[var(--border-primary)]" />

          {/* Profile Menu Avatar */}
          <button
            className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:opacity-85 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
            title="Profile details"
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
