import { useRef, useState, useEffect, useCallback } from "react";
import CameraFeed from "../camera/CameraFeed";
import { Camera, Minus, Maximize2, Minimize2, X, GripHorizontal } from "lucide-react";

interface Props {
  defaultX?: number;
  defaultY?: number;
}

export default function DraggableCameraWindow({ defaultX = 60, defaultY = 80 }: Props) {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const dragOffset = useRef({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const W_NORMAL  = 360;
  const W_EXPANDED = 560;
  const W = isExpanded ? W_EXPANDED : W_NORMAL;

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = windowRef.current!.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      // Clamp within viewport
      const maxX = window.innerWidth  - (windowRef.current?.offsetWidth  ?? W_NORMAL);
      const maxY = window.innerHeight - (windowRef.current?.offsetHeight ?? 200);
      setPos({ x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) });
    };

    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  // Restore button — shown when camera is hidden
  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-24 right-6 z-[1000] flex items-center gap-2 px-3 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase transition-all"
        style={{
          background: "rgba(220,38,38,0.15)",
          border: "1px solid rgba(220,38,38,0.4)",
          color: "#ef4444",
          boxShadow: "0 0 20px rgba(220,38,38,0.2)",
        }}
      >
        <Camera className="w-3.5 h-3.5" />
        Show Camera
      </button>
    );
  }

  return (
    <div
      ref={windowRef}
      className="fixed z-[1000] select-none"
      style={{
        left: pos.x,
        top:  pos.y,
        width: W,
        transition: isDragging ? "none" : "width 0.25s cubic-bezier(0.16,1,0.3,1)",
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* Drop shadow + glow wrapper */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          boxShadow: isDragging
            ? "0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(220,38,38,0.25)"
            : "0 16px 48px rgba(0,0,0,0.8), 0 0 20px rgba(220,38,38,0.12)",
          border: "1px solid rgba(220,38,38,0.28)",
          background: "#0a0000",
          transition: "box-shadow 0.2s ease",
        }}
      >
        {/* ─── Title bar (drag handle) ─────────────────────── */}
        <div
          onMouseDown={onMouseDown}
          className="flex items-center justify-between px-3 py-2"
          style={{
            background: "linear-gradient(90deg, #150000 0%, #0d0000 100%)",
            borderBottom: "1px solid rgba(220,38,38,0.15)",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          {/* Left: icon + label + drag hint */}
          <div className="flex items-center gap-2 pointer-events-none">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "#dc2626",
                boxShadow: "0 0 6px rgba(220,38,38,0.8)",
                animation: "red-heartbeat 1.5s ease-in-out infinite",
              }}
            />
            <span
              className="text-[10px] font-black tracking-[0.2em] uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Camera Feed
            </span>
            <GripHorizontal className="w-3.5 h-3.5 ml-1" style={{ color: "rgba(255,255,255,0.2)" }} />
          </div>

          {/* Right: window controls */}
          <div className="flex items-center gap-1 pointer-events-auto" onMouseDown={e => e.stopPropagation()}>
            {/* Minimize toggle */}
            <button
              onClick={() => setIsMinimized(v => !v)}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(250,204,21,0.15)", color: "#facc15" }}
              title={isMinimized ? "Restore" : "Minimize"}
            >
              <Minus className="w-3 h-3" />
            </button>

            {/* Expand toggle */}
            {!isMinimized && (
              <button
                onClick={() => setIsExpanded(v => !v)}
                className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                title={isExpanded ? "Shrink" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
              </button>
            )}

            {/* Close */}
            <button
              onClick={() => setIsVisible(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
              title="Hide Camera"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ─── Camera content ──────────────────────────────── */}
        {!isMinimized && (
          <div style={{ pointerEvents: isDragging ? "none" : "auto" }}>
            <CameraFeed
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(v => !v)}
            />
          </div>
        )}

        {/* Minimized pill */}
        {isMinimized && (
          <div
            className="flex items-center justify-center gap-2 py-2"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <Camera className="w-4 h-4" style={{ color: "rgba(220,38,38,0.5)" }} />
            <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
              Camera Minimized
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
