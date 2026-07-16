import { Cpu, Terminal, ShieldAlert } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function BottomBar() {
  const { settings, isTracking, isConnected } = useStore();

  return (
    <footer className="h-10 border-t border-[var(--border-secondary)] glass-card !rounded-none border-x-0 border-b-0 px-6 flex items-center justify-between select-none z-10 w-full text-[10px] font-semibold text-[var(--text-secondary)] font-mono">
      {/* Left: Logger outputs */}
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Terminal className="w-3.5 h-3.5 text-red-500 animate-pulse" />
        <span className="text-[9px] uppercase font-bold tracking-wider">Log:</span>
        <span className="truncate max-w-[200px] sm:max-w-md text-[var(--text-primary)]/80">
          {isTracking
            ? isConnected
              ? "Receiving hardware frames from virtual controller link..."
              : "Active JavaScript Motion Engine started. Streaming coordinates."
            : "System idle. Toggle tracking to begin stream."}
        </span>
      </div>

      {/* Right: Port configuration and bindings check */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Cpu className="w-3.5 h-3.5 text-red-500/80" />
          <span>PORT: {settings.wsUrl.split(":").pop() || "8000"}</span>
        </div>
        <span className="h-3.5 w-px bg-[var(--border-secondary)]" />
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500/80" />
          <span className="text-[var(--text-secondary)] uppercase tracking-wide">Output: SendInput API</span>
        </div>
      </div>
    </footer>
  );
}
