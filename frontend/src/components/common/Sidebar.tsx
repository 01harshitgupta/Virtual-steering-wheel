import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Compass, BarChart3, Settings, Zap, Power } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";

export default function Sidebar() {
  const location = useLocation();
  const { isConnected, isTracking, toggleTracking } = useStore();

  const menuItems = [
    { name: "Dashboard",   path: "/",            icon: LayoutDashboard },
    { name: "Calibration", path: "/calibration", icon: Compass },
    { name: "Analytics",   path: "/analytics",   icon: BarChart3 },
    { name: "Settings",    path: "/settings",    icon: Settings },
  ];

  return (
    <aside
      className="w-64 flex flex-col h-full z-10 select-none relative glass-card !rounded-none border-y-0 border-l-0"
    >
      {/* Animated left edge glow */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{
          background: "linear-gradient(180deg, transparent, rgba(220,38,38,0.6) 30%, rgba(249,115,22,0.4) 50%, rgba(220,38,38,0.6) 70%, transparent)",
        }}
      />

      {/* Top racing stripe */}
      <div className="h-[2px] w-full" style={{
        background: "linear-gradient(90deg, #7f1d1d, #dc2626 30%, #f97316 50%, #dc2626 70%, #7f1d1d)"
      }} />

      {/* Brand Header */}
      <div
        className="p-5 flex items-center gap-3.5 relative"
        style={{ borderBottom: "1px solid rgba(220,38,38,0.1)" }}
      >
        {/* Icon with animated ring */}
        <div className="relative shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 35% 35%, #3d0000, #150000)",
              border: "1px solid rgba(220,38,38,0.35)",
              boxShadow: "0 0 12px rgba(220,38,38,0.25)",
            }}
          >
            <Zap className="w-5 h-5" style={{ color: "#ef4444" }} />
          </div>
          {isTracking && (
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-black"
              style={{
                background: "#dc2626",
                boxShadow: "0 0 8px rgba(220,38,38,0.9)",
                animation: "red-heartbeat 1.5s ease-in-out infinite",
              }}
            />
          )}
        </div>

        <div>
          <h1
            className="font-black text-base leading-tight tracking-[0.15em] uppercase"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #ef4444 70%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DRIVESENSE
          </h1>
          <span className="text-[9px] font-bold uppercase tracking-[0.25em]" style={{ color: "rgba(220,38,38,0.5)" }}>
            AI v1.2 · RACING EDITION
          </span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  layoutId="active-nav-rb"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(220,38,38,0.18) 0%, rgba(249,115,22,0.08) 100%)",
                    borderLeft: "2px solid #dc2626",
                    boxShadow: "inset 0 0 20px rgba(220,38,38,0.05)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              {/* Hover glow bg */}
              {!isActive && (
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(220,38,38,0.06)" }}
                />
              )}

              <Icon
                className="w-4 h-4 z-10 transition-all duration-200"
                style={{
                  color: isActive ? "#ef4444" : "rgba(255,255,255,0.35)",
                  filter: isActive ? "drop-shadow(0 0 4px rgba(239,68,68,0.7))" : "none",
                }}
              />

              <motion.span
                whileHover={{ x: isActive ? 0 : 3 }}
                className="z-10 text-sm transition-colors duration-200"
                style={{
                  color: isActive ? "#f0f0f0" : "rgba(255,255,255,0.4)",
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: isActive ? "0.06em" : "0.02em",
                }}
              >
                {item.name}
              </motion.span>

              {/* Active right indicator */}
              {isActive && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: "#dc2626", boxShadow: "0 0 6px rgba(220,38,38,0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Connection & Control Footer */}
      <div
        className="p-4 flex flex-col gap-3 border-t border-[var(--border-secondary)] bg-black/10"
      >
        {/* Toggle Tracking */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={toggleTracking}
          className="w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden"
          style={
            isTracking
              ? {
                  background: "linear-gradient(135deg, #7f1d1d, #dc2626)",
                  border: "1px solid rgba(220,38,38,0.5)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(220,38,38,0.3), 0 4px 12px rgba(0,0,0,0.5)",
                }
              : {
                  background: "linear-gradient(135deg, #0d0000, #1a0000)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  color: "rgba(220,38,38,0.8)",
                }
          }
        >
          {/* Button shine */}
          <div className="absolute inset-0 opacity-20"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)" }} />
          <Power className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10">{isTracking ? "Stop Engine" : "Start Engine"}</span>
        </motion.button>

        {/* Status indicators */}
        <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid rgba(220,38,38,0.08)" }}>
          <div className="flex items-center justify-between text-[10px] px-1 font-mono">
            <span className="font-bold uppercase tracking-wider" style={{ color: "rgba(220,38,38,0.4)" }}>
              Link Server
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold" style={{ color: isConnected ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                {isConnected ? "CONNECTED" : "OFFLINE"}
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: isConnected ? "#22c55e" : "rgba(255,255,255,0.2)",
                  boxShadow: isConnected ? "0 0 6px rgba(34,197,94,0.8)" : "none",
                  animation: isConnected ? "red-heartbeat 2s ease-in-out infinite" : "none",
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] px-1 font-mono">
            <span className="font-bold uppercase tracking-wider" style={{ color: "rgba(220,38,38,0.4)" }}>
              Telemetry
            </span>
            <span
              className="font-black"
              style={{ color: isTracking ? "#f97316" : "rgba(255,255,255,0.25)" }}
            >
              {isTracking ? "● ACTIVE" : "○ STANDBY"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
