import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Compass, BarChart3, Settings, Shield, Power } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../store/useStore";

export default function Sidebar() {
  const location = useLocation();
  const { isConnected, isTracking, toggleTracking } = useStore();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Calibration", path: "/calibration", icon: Compass },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-[var(--border-primary)] bg-[var(--bg-card)] backdrop-blur-md flex flex-col h-full z-10 select-none transition-colors duration-200">
      {/* Brand Header with BMW Stripe */}
      <div className="h-[2px] w-full bmw-stripes" />
      <div className="p-6 flex items-center gap-3.5 border-b border-[var(--border-secondary)]">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center shadow-sm shadow-blue-500/5 transition-colors duration-200">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          {isTracking && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </div>
        <div>
          <h1 className="font-extrabold text-base leading-tight tracking-wider text-[var(--text-primary)] uppercase transition-colors duration-200">
            DRIVESENSE
          </h1>
          <span className="text-[9px] text-[var(--text-secondary)] font-semibold uppercase tracking-widest leading-none transition-colors duration-200">
            BMW EDITION v1.2
          </span>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors group"
            >
              {/* Background slide active animation */}
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-[var(--bg-secondary)] border-l-2 border-blue-600 rounded-xl transition-colors duration-200"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon
                className={`w-4 h-4 z-10 transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600"
                    : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                }`}
              />

              <motion.span
                whileHover={{ x: isActive ? 0 : 2 }}
                className={`z-10 transition-colors duration-200 ${
                  isActive
                    ? "font-semibold text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]"
                }`}
              >
                {item.name}
              </motion.span>
            </Link>
          );
        })}
      </nav>

      {/* Connection & Control Footer */}
      <div className="p-4 border-t border-[var(--border-secondary)] bg-[var(--bg-secondary)]/50">
        {/* Toggle Tracking Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleTracking}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
            isTracking
              ? "bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-500/10"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:shadow-blue-500/10"
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{isTracking ? "Stop Console" : "Start Console"}</span>
        </motion.button>

        {/* Live Status Indicators */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-col gap-2">
          {/* Connection status */}
          <div className="flex items-center justify-between text-[10px] px-1 font-mono">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Link Server</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                {isConnected ? "CONNECTED" : "OFFLINE"}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected
                    ? "bg-blue-500 animate-pulse shadow-md shadow-blue-500/20"
                    : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Core hardware check */}
          <div className="flex items-center justify-between text-[10px] px-1 font-mono">
            <span className="text-slate-400 font-semibold uppercase tracking-wider">Telemetry</span>
            <span className="text-blue-600 font-extrabold">
              {isTracking ? "ACTIVE SIM" : "STANDBY"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
