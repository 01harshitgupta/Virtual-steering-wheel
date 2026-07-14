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
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Telemetry Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-widest">
          Analyze historical input data and steering diagnostics
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800/80 shadow-lg flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{item.name}</span>
                <span className="text-2xl font-bold font-mono text-white mt-1">{item.value}</span>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-900 ${item.color} border border-slate-800`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Chart display */}
      <TelemetryChart />

      {/* Telemetry Logs Table */}
      <div className="glass-card rounded-2xl border border-slate-800/80 shadow-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Real-Time Input Logs
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-900 uppercase tracking-wider font-mono">
              <tr>
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Steering Angle</th>
                <th className="p-4">Vehicle Speed</th>
                <th className="p-4">Sync Latency</th>
                <th className="p-4">Confidence</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60 font-mono text-slate-300">
              {history.slice(-8).reverse().map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-900/20 transition-colors">
                  <td className="p-4 pl-6 text-slate-500">{log.time}</td>
                  <td className={`p-4 font-bold ${log.angle > 10 ? "text-cyan-400" : log.angle < -10 ? "text-cyan-400" : "text-slate-300"}`}>
                    {Math.round(log.angle)}°
                  </td>
                  <td className="p-4">{Math.round(log.speed)} km/h</td>
                  <td className="p-4">{log.latency} ms</td>
                  <td className="p-4 text-emerald-400">{log.confidence}%</td>
                  <td className="p-4 pr-6">
                    {isTracking ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        TRACKING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-900 text-slate-500 border border-slate-800 font-semibold">
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