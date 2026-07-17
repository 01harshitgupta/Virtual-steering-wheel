import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Compass, BarChart3, Settings, Zap, Power } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";
import { SoundEffects } from "../../utils/audio";

export default function Sidebar() {
  const location = useLocation();
  const { isConnected, isTracking, toggleTracking } = useStore();

  const menuItems = [
    { name: "Dashboard",   path: "/",            icon: LayoutDashboard },
    { name: "Calibration", path: "/calibration", icon: Compass },
    { name: "Analytics",   path: "/analytics",   icon: BarChart3 },
    { name: "Settings",    path: "/settings",    icon: Settings },
  ];

  const handleMenuClick = () => {
    SoundEffects.playClick();
  };

  const handleStartStop = () => {
    SoundEffects.playSelect();
    toggleTracking();
  };

  return (
    <aside
      className="w-60 flex flex-col h-full z-10 select-none relative bg-[#090e1a]/85 border-r border-[#00e5ff]/15 shadow-2xl"
    >
      {/* Carbon fiber texture layer */}
      <div className="absolute inset-0 carbon-bg opacity-40 pointer-events-none" />

      {/* Cyber grid lines overlay */}
      <div className="absolute inset-0 f1-cyber-grid opacity-30 pointer-events-none" />

      {/* Left glowing neon border line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{
          background: "linear-gradient(180deg, transparent, #2563eb 30%, #00e5ff 50%, #2563eb 70%, transparent)",
        }}
      />

      {/* Brand Header */}
      <div
        className="p-5 flex items-center gap-3 relative z-10 border-b border-[#00e5ff]/10 bg-[#0d1425]/60"
      >
        {/* Animated F1 icon container */}
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-b from-[#1e3a5f] to-[#050816]"
            style={{
              border: "1px solid rgba(0, 229, 255, 0.35)",
              boxShadow: "0 0 12px rgba(0, 229, 255, 0.25)",
            }}
          >
            <Zap className="w-5 h-5 text-[#00e5ff] drop-shadow-[0_0_4px_#00e5ff]" />
          </div>
          {isTracking && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black bg-[#00ff95] animate-green-pulse"
            />
          )}
        </div>

        <div>
          <span className="text-[12px] font-black tracking-[0.15em] text-[#f8fafc] uppercase block">
            DriveSense <span className="text-[#00e5ff] font-mono">F1</span>
          </span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
            Cockpit Console
          </span>
          <span className="text-[7px] font-extrabold text-[#00e5ff] uppercase tracking-[0.12em] block mt-0.5">
            By HARSHIT GUPTA
          </span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1.5 relative z-10">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleMenuClick}
              className="group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200"
              style={{
                background: isActive ? "rgba(0, 229, 255, 0.08)" : "transparent",
                border: isActive ? "1px solid rgba(0, 229, 255, 0.2)" : "1px solid transparent",
              }}
            >
              {/* Active overlay glow */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none opacity-20"
                  style={{
                    boxShadow: "inset 0 0 20px rgba(0, 229, 255, 0.3)",
                  }}
                />
              )}

              <Icon
                className="w-4.5 h-4.5 z-10 transition-all duration-200"
                style={{
                  color: isActive ? "#00e5ff" : "rgba(148, 163, 184, 0.6)",
                  filter: isActive ? "drop-shadow(0 0 4px #00e5ff)" : "none",
                }}
              />

              <span
                className="z-10 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-200"
                style={{
                  color: isActive ? "#f8fafc" : "rgba(148, 163, 184, 0.6)",
                }}
              >
                {item.name}
              </span>

              {/* Active right target dot */}
              {isActive && (
                <div
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#00e5ff]"
                  style={{ boxShadow: "0 0 8px #00e5ff" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Control Footer */}
      <div
        className="p-4 flex flex-col gap-3.5 border-t border-[#00e5ff]/10 bg-[#0d1425]/60 relative z-10"
      >
        {/* Toggle Engine Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartStop}
          className="w-full py-2.5 px-4 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden border"
          style={
            isTracking
              ? {
                  background: "rgba(255,23,68,0.12)",
                  borderColor: "rgba(255,23,68,0.45)",
                  color: "#ff1744",
                  boxShadow: "0 0 15px rgba(255,23,68,0.25)",
                }
              : {
                  background: "rgba(0,229,255,0.06)",
                  borderColor: "rgba(0,229,255,0.25)",
                  color: "#00e5ff",
                }
          }
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isTracking ? "Stop Engine" : "Start Engine"}</span>
        </motion.button>

        {/* Link Status summary */}
        <div className="flex flex-col gap-2 pt-2.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[9px] font-mono">
            <span className="font-bold uppercase tracking-widest text-slate-500">
              ECU LINK
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[8px]" style={{ color: isConnected ? "#00ff95" : "#94a3b8" }}>
                {isConnected ? "ONLINE" : "STANDBY"}
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? "bg-[#00ff95] animate-green-pulse" : "bg-neutral-700"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
