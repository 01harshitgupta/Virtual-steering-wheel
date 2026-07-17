import { Cpu, Terminal, ShieldAlert } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function BottomBar() {
  const { settings, isTracking, isConnected } = useStore();

  return (
    <footer className="h-10 border-t border-[#00e5ff]/15 bg-[#090e1a]/95 px-6 flex items-center justify-between select-none z-10 w-full text-[9px] font-bold text-slate-500 font-mono">
      {/* Carbon overlay */}
      <div className="absolute inset-0 carbon-bg opacity-20 pointer-events-none" />

      {/* Left: Logger outputs */}
      <div className="flex items-center gap-2 relative z-10">
        <Terminal className="w-3.5 h-3.5 text-[#00e5ff] animate-pulse" />
        <span className="uppercase tracking-widest text-[#00e5ff]/80">LOG:</span>
        <span className="truncate max-w-[200px] sm:max-w-md text-slate-300 font-medium">
          {isTracking
            ? isConnected
              ? "Telemetry socket stream synchronized. Direct hardware injection active."
              : "Optical scanner pipeline active. Injecting scancodes via local WebSocket."
            : "Engine offline. Toggle Start Engine to initiate system scan."}
        </span>
      </div>

      {/* Right: Port configuration and bindings check */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#00e5ff]/70" />
          <span>PORT: {settings.wsUrl.split(":").pop() || "8000"}</span>
        </div>
        <span className="h-3.5 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#00e5ff]/70" />
          <span className="uppercase tracking-wider">OUT: SENDINPUT DRIVER</span>
        </div>
      </div>
    </footer>
  );
}
