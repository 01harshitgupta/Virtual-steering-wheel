import { Cpu, Terminal, ShieldAlert } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function BottomBar() {
  const { settings, isTracking, isConnected } = useStore();

  return (
    <footer className="h-10 border-t border-slate-200 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between select-none z-10 w-full text-[10px] font-semibold text-slate-400 font-mono">
      {/* Left: Logger outputs */}
      <div className="flex items-center gap-2 text-slate-500">
        <Terminal className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Log:</span>
        <span className="truncate max-w-[200px] sm:max-w-md text-slate-600">
          {isTracking
            ? isConnected
              ? "Receiving hardware frames from virtual controller link..."
              : "Active JavaScript Motion Engine started. Streaming coordinates."
            : "System idle. Toggle tracking to begin stream."}
        </span>
      </div>

      {/* Right: Port configuration and bindings check */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Cpu className="w-3.5 h-3.5 text-blue-500" />
          <span>PORT: {settings.wsUrl.split(":").pop() || "8000"}</span>
        </div>
        <span className="h-3.5 w-px bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-slate-500 uppercase tracking-wide">Output: SendInput API</span>
        </div>
      </div>
    </footer>
  );
}
