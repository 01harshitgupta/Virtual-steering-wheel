import { Activity, Gauge, Navigation2, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function StatsGrid() {
  const { steeringAngle, speed, latency, confidence, isTracking } = useStore();

  const stats = [
    {
      name: "Steering Angle",
      value: `${isTracking ? Math.round(steeringAngle) : 0}°`,
      icon: Navigation2,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-100 dark:border-blue-900/40",
      glowColor: "shadow-blue-500/5",
      rotationStyle: { transform: `rotate(${isTracking ? steeringAngle : 0}deg)` },
      subText: isTracking
        ? steeringAngle > 5
          ? "Turning Right"
          : steeringAngle < -5
          ? "Turning Left"
          : "Centered"
        : "Standby",
    },
    {
      name: "Velocity",
      value: `${isTracking ? Math.round(speed) : 0} km/h`,
      icon: Gauge,
      color: "text-slate-700 dark:text-slate-350",
      bgColor: "bg-slate-100 dark:bg-slate-900/40",
      borderColor: "border-slate-200 dark:border-slate-800/80",
      glowColor: "shadow-slate-500/5",
      subText: isTracking ? (speed > 80 ? "High Speed" : "Cruising") : "Engine Off",
    },
    {
      name: "Detection Confidence",
      value: `${isTracking ? Math.round(confidence) : 0}%`,
      icon: Activity,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      borderColor: "border-emerald-100 dark:border-emerald-900/40",
      glowColor: "shadow-emerald-500/5",
      subText: isTracking ? "Perfect Tracking" : "No Signal",
    },
    {
      name: "Latency",
      value: `${isTracking ? latency : 0} ms`,
      icon: Zap,
      color: "text-red-500 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-100 dark:border-red-900/40",
      glowColor: "shadow-red-500/5",
      subText: isTracking ? "Real-time sync" : "Offline",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`glass-card p-5 rounded-2xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:translate-y-[-2px] border ${stat.borderColor} shadow-sm ${stat.glowColor}`}
          >
            {/* Background design glow */}
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full filter blur-[40px] opacity-10 ${stat.bgColor}`} />

            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">
                {stat.name}
              </span>
              <div
                className={`p-2.5 rounded-xl ${stat.bgColor} ${stat.color} transition-transform duration-300`}
                style={stat.name === "Steering Angle" ? stat.rotationStyle : undefined}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tight text-[var(--text-primary)] font-mono">
                {stat.value}
              </span>
              <span className="text-[var(--text-secondary)] text-xs font-semibold mt-1">
                {stat.subText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
