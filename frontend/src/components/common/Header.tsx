import { Settings, Info, Activity, X, HelpCircle, Key, Play, Sun, Moon, Cpu, HardDrive, User, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundEffects } from "../../utils/audio";

export default function Header() {
  const { isConnected, isTracking, latency } = useStore();
  const navigate = useNavigate();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for F1 theme
  const [sysStats, setSysStats] = useState({ cpu: 0, ram: 0 });
  
  const isElectron = !!(window as any).DriveSense;

  // Force dark class on document element
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Dynamically poll CPU & RAM telemetry from Electron main process
  useEffect(() => {
    const ds = (window as any).DriveSense;
    if (!ds || !ds.getSystemStats) {
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

  const handleNavClick = (path: string) => {
    SoundEffects.playClick();
    navigate(path);
  };

  const handleInfoModalOpen = () => {
    SoundEffects.playClick();
    setShowInfoModal(true);
  };

  const handleInfoModalClose = () => {
    SoundEffects.playClick();
    setShowInfoModal(false);
  };

  return (
    <header
      className="h-16 px-6 flex items-center justify-between select-none z-10 w-full relative bg-[#090e1a]/85 border-b border-[#00e5ff]/15 shadow-xl"
    >
      {/* Carbon texture layer */}
      <div className="absolute inset-0 carbon-bg opacity-30 pointer-events-none" />

      {/* Speed sweep overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 right-0 h-px animate-speed-line"
          style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.12), transparent)", animationDuration: "5s" }} />
      </div>

      {/* Left: Brand + status */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => handleNavClick("/")}>
          <Zap className="w-5 h-5 text-[#00e5ff] drop-shadow-[0_0_4px_#00e5ff] transition-all duration-300 group-hover:scale-110" />
          <span className="font-extrabold text-sm uppercase tracking-[0.2em] text-[#f8fafc]">
            DriveSense <span className="text-[#00e5ff] font-mono">Console</span>
          </span>
        </div>
        <span className="h-4 w-px bg-slate-800" />
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#050816] border border-[#00e5ff]/10"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? "bg-[#00ff95] animate-green-pulse" : "bg-neutral-700"
            }`}
          />
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
            {isConnected ? "Telemetry Linked" : "Telemetry Standby"}
          </span>
        </div>
      </div>

      {/* Right: Telemetry bar + actions */}
      <div className="flex items-center gap-4 relative z-10">
        <div
          className="hidden md:flex items-center gap-4 text-[9px] font-mono font-bold px-4 py-1.5 rounded-lg border border-[#00e5ff]/10 bg-[#050816]/75 text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-[#00e5ff]" />
            <span>CPU: {sysStats.cpu}%</span>
          </span>
          <span className="w-px h-3 bg-slate-800" />
          <span className="flex items-center gap-1.5">
            <HardDrive className="w-3 h-3 text-[#00e5ff]" />
            <span>RAM: {sysStats.ram} MB</span>
          </span>
          {isTracking && (
            <>
              <span className="w-px h-3 bg-slate-800" />
              <span className="flex items-center gap-1.5 text-[#ff9800]">
                <Activity className="w-3 h-3 animate-pulse" />
                <span>{latency}ms</span>
              </span>
              <span className="w-px h-3 bg-slate-800" />
              <span className="text-[#00ff95]" style={{ textShadow: "0 0 6px rgba(0,255,149,0.4)" }}>60 FPS</span>
            </>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {!isElectron && (
            <a
              href="https://github.com/01harshitgupta/Virtual-steering-wheel/raw/main/frontend/dist-build/DriveSense%20AI%20Setup%201.0.0.exe"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff]/20 font-black text-[9px] uppercase tracking-wider transition-all cursor-pointer mr-1.5"
              title="Download Windows Desktop App"
            >
              <Zap className="w-3.5 h-3.5 fill-[#00e5ff]/20 animate-pulse text-[#00e5ff]" />
              <span>Download Desktop App</span>
            </a>
          )}
          <button
            onClick={handleInfoModalOpen}
            className="p-2 rounded-lg border border-slate-800 bg-[#0d1425]/50 text-slate-400 hover:text-[#f8fafc] hover:bg-slate-800 transition-all cursor-pointer"
            title="Cockpit Guide"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavClick("/settings")}
            className="p-2 rounded-lg border border-slate-800 bg-[#0d1425]/50 text-slate-400 hover:text-[#f8fafc] hover:bg-slate-800 transition-all cursor-pointer"
            title="Cockpit Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <span className="h-4 w-px bg-slate-800" />
          <button
            className="w-8 h-8 rounded-lg border border-slate-800 bg-[#0d1425]/50 flex items-center justify-center text-slate-400 hover:text-[#f8fafc] hover:bg-slate-800 transition-all cursor-pointer"
            title="User Profile"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Help / Information Modal Popover overlay */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 bg-[#050816]/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
              className="glass-card w-full max-w-md p-6 rounded-2xl border border-slate-850 shadow-2xl flex flex-col gap-4 relative bg-[#0d1425]/95"
            >
              {/* Corner brackets styling for F1 HUD look */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#00e5ff]/50" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00e5ff]/50" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00e5ff]/50" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#00e5ff]/50" />

              <button
                onClick={handleInfoModalClose}
                className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <HelpCircle className="w-5 h-5 text-[#00e5ff] drop-shadow-[0_0_4px_#00e5ff]" />
                <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-[#f8fafc]">
                  Cockpit Telemetry Guide
                </h3>
              </div>

              <div className="flex flex-col gap-4 text-xs text-slate-400 leading-relaxed font-sans">
                <p>
                  DriveSense AI bridges real-time hand-steering from your webcam to trigger native keyboard events in browser racing simulators (such as arrow/WASD inputs).
                </p>

                <div className="flex flex-col gap-2 bg-[#050816] p-3 rounded-lg border border-slate-800">
                  <div className="flex items-start gap-2">
                    <Play className="w-3.5 h-3.5 text-[#00e5ff] mt-0.5 shrink-0" />
                    <span>
                      Toggle <strong>Start Engine</strong> in the cockpit header to launch tracking.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Key className="w-3.5 h-3.5 text-[#00e5ff] mt-0.5 shrink-0" />
                    <span>
                      Focus any web game tab to capture virtual steering commands instantly.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-slate-800 pt-3">
                  <span className="font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                    Default Virtual Bindings:
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500 font-mono text-[10px]">
                    <li>Tilt hands left/right: Turns A / D (ArrowLeft / ArrowRight)</li>
                    <li>Raise thumbs (Right Hand): Accelerates W (ArrowUp)</li>
                    <li>Lower thumbs (Left Hand): Brakes S (ArrowDown)</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleInfoModalClose}
                className="w-full py-2.5 rounded-lg bg-[#00e5ff]/10 text-[#00e5ff] border border-[#00e5ff]/25 hover:bg-[#00e5ff]/15 text-[10px] font-black uppercase tracking-widest mt-2 transition-all cursor-pointer"
              >
                Close Systems Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
