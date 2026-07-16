import { useStore } from "../store/useStore";
import TelemetryChart from "../components/charts/TelemetryChart";
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Clock } from "lucide-react";

export default function Analytics() {
  const { history, isTracking } = useStore();

  // Compute stats
  const totalPoints = history.length;
  const avgConfidence = Math.round(history.reduce((acc, h) => acc + h.confidence, 0) / totalPoints) || 95;
  const avgLatency = Math.round(history.reduce((acc, h) => acc + h.latency, 0) / totalPoints) || 14;
  const maxSpeed = Math.round(Math.max(...history.map((h) => h.speed), 85));
  const maxAngle = Math.round(Math.max(...history.map((h) => Math.abs(h.angle)), 32));

  const stats = [
    { name: "Max Steering Lock", value: `${maxAngle}°`, icon: TrendingUp, color: "text-cyan-400" },
    { name: "Max Speed Registered", value: `${maxSpeed} km/h`, icon: Cpu, color: "text-sky-400" },
    { name: "Average Latency", value: `${avgLatency} ms`, icon: Clock, color: "text-rose-400" },
    { name: "Tracking Confidence", value: `${avgConfidence}%`, icon: ShieldAlert, color: "text-emerald-400" },
  ];

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 select-none max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-[var(--border-secondary)] pb-5">
        <h1 className="text-3xl font-black tracking-tight" style={{
          background: "linear-gradient(135deg, var(--text-primary) 0%, var(--accent-bright) 70%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Telemetry Analytics
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-widest">
          Analyze historical input data and steering diagnostics
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl shadow-lg flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">{item.name}</span>
                <span className="text-2xl font-black font-mono text-[var(--text-primary)] mt-1">{item.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl bg-[var(--border-secondary)] ${item.color} border border-[var(--border-primary)]`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Chart display */}
      <TelemetryChart />

      {/* Telemetry Logs Table */}
      <div className="glass-card rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[var(--border-secondary)] flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-500" />
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]/80">
            Real-Time Input Logs
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--bg-primary)]/60 text-[var(--text-secondary)] font-semibold border-b border-[var(--border-secondary)] uppercase tracking-wider font-mono">
              <tr>
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Steering Angle</th>
                <th className="p-4">Vehicle Speed</th>
                <th className="p-4">Sync Latency</th>
                <th className="p-4">Confidence</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-secondary)]/60 font-mono text-[var(--text-primary)]/90">
              {history.slice(-8).reverse().map((log, idx) => (
                <tr key={idx} className="hover:bg-[var(--border-secondary)]/20 transition-colors">
                  <td className="p-4 pl-6 text-[var(--text-secondary)]/70">{log.time}</td>
                  <td className={`p-4 font-bold ${log.angle > 10 ? "text-cyan-500" : log.angle < -10 ? "text-cyan-500" : "text-[var(--text-primary)]"}`}>
                    {Math.round(log.angle)}°
                  </td>
                  <td className="p-4">{Math.round(log.speed)} km/h</td>
                  <td className="p-4">{log.latency} ms</td>
                  <td className="p-4 text-emerald-500 font-bold">{log.confidence}%</td>
                  <td className="p-4 pr-6">
                    {isTracking ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                        TRACKING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-[var(--border-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)] font-semibold">
                        STANDBY
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}