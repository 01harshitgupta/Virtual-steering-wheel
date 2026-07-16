import { useStore } from "../../store/useStore";
import { Keyboard, Gamepad, CheckCircle, AlertCircle, Clock, ShieldAlert } from "lucide-react";

export default function InputDebugPanel() {
  const { steeringAngle, gesture, latency, heldKeys, controllerState, compatStatus } = useStore();

  // Normalize trigger outputs to percentages
  const leftTriggerPercent = Math.round((controllerState.leftTrigger / 255) * 100);
  const rightTriggerPercent = Math.round((controllerState.rightTrigger / 255) * 100);

  // Normalize stick to offset percentage (-50% to 50%)
  const stickXOffset = (controllerState.leftStickX / 32768) * 50;

  // Determine button state visualizers
  const isA = (controllerState.buttons & 0x1000) !== 0;
  const isX = (controllerState.buttons & 0x4000) !== 0;

  return (
    <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-6 select-none">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-[var(--border-secondary)] pb-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-cyan-500" />
          <h2 className="text-md font-black uppercase tracking-wider text-[var(--text-primary)]/80">
            Input Debug Console
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
          <Clock className="w-3.5 h-3.5 text-cyan-500" />
          <span>Latency:</span>
          <span className={`font-mono font-bold ${latency < 10 ? "text-emerald-500" : "text-amber-500"}`}>
            {latency} ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Active Outputs & Compatibility Status */}
        <div className="flex flex-col gap-5">
          {/* Output Mode Status */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider">
              Output Routing Mode
            </span>
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-primary)]/45 border border-[var(--border-secondary)] rounded-xl">
              {compatStatus.activeMode === "xbox_controller" ? (
                <Gamepad className="w-5 h-5 text-rose-500" />
              ) : (
                <Keyboard className="w-5 h-5 text-cyan-500" />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase">
                  {compatStatus.activeMode === "xbox_controller"
                    ? "Xbox 360 Controller (ViGEm)"
                    : compatStatus.activeMode === "arrows"
                    ? "Keyboard (Arrow Keys)"
                    : "Keyboard (WASD)"}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                  {compatStatus.activeMode === "xbox_controller"
                    ? "Injecting virtual driver device states"
                    : "Injecting hardware scan codes"}
                </span>
              </div>
            </div>
          </div>

          {/* Browser / Game Compatibility Flags */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider">
              Compatibility Indicators
            </span>
            <div className="flex flex-col gap-2 bg-[var(--bg-primary)]/20 p-3 rounded-xl border border-[var(--border-secondary)]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Scan Code Emulation:</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-950/20" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Low-Level Input Driver:</span>
                {compatStatus.vigemInstalled ? (
                  <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-950/20" />
                    ViGEm Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 font-bold text-amber-500">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Missing ViGEmBus
                  </span>
                )}
              </div>
            </div>
            {!compatStatus.vigemInstalled && compatStatus.activeMode === "xbox_controller" && (
              <p className="text-[10px] text-amber-500/90 leading-normal flex items-start gap-1 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Xbox controller mode is currently falling back to Keyboard (WASD) because the ViGEmBus kernel driver is not installed on this PC.
                </span>
              </p>
            )}
          </div>

          {/* Held Keys (Keyboard mode) */}
          {compatStatus.activeMode !== "xbox_controller" && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider">
                Virtual Key States (Held)
              </span>
              <div className="flex flex-wrap gap-2 p-3 bg-[var(--bg-primary)]/20 rounded-xl border border-[var(--border-secondary)] min-h-[46px] items-center">
                {heldKeys.length === 0 ? (
                  <span className="text-xs text-[var(--text-secondary)]/70 font-medium italic">
                    No keys currently pressed
                  </span>
                ) : (
                  heldKeys.map((key, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-xs font-mono font-bold rounded-md animate-pulse"
                    >
                      {key}
                    </span>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Virtual Controller Stick & Trigger Visualization */}
        <div className="flex flex-col gap-5 border-l border-[var(--border-secondary)] pl-0 md:pl-6">
          <span className="text-xs font-bold uppercase text-[var(--text-secondary)] tracking-wider">
            Virtual Controller Debug
          </span>

          <div className="flex flex-col gap-4 bg-[var(--bg-primary)]/45 border border-[var(--border-secondary)] rounded-xl p-4">
            {/* Steering angle indicator */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Steering Wheel Angle:</span>
                <span className="font-mono text-[var(--text-primary)] font-bold">
                  {steeringAngle.toFixed(1)}°
                </span>
              </div>
              <div className="h-2 bg-[var(--bg-primary)]/80 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-cyan-500 transition-all duration-75"
                  style={{
                    left: steeringAngle < 0 ? `calc(50% + ${Math.max(-50, (steeringAngle / 90) * 50)}%)` : "50%",
                    right: steeringAngle >= 0 ? `calc(50% - ${Math.min(50, (steeringAngle / 90) * 50)}%)` : "50%",
                  }}
                />
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-[var(--border-secondary)]" />
              </div>
            </div>

            {/* Left Stick X visualizer */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                Left Stick X (Axis)
              </span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)]/80 border border-[var(--border-secondary)] relative flex items-center justify-center">
                  <div className="absolute w-2 h-2 rounded-full bg-[var(--text-secondary)]/50" />
                  <div
                    className="absolute w-4 h-4 rounded-full bg-rose-500 shadow-md shadow-rose-500/30 transition-all duration-75"
                    style={{ transform: `translateX(${stickXOffset}px)` }}
                  />
                </div>
                <div className="flex flex-col gap-0.5 text-xs font-mono">
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)]">Value:</span>
                    <span className="text-[var(--text-primary)] font-bold">{controllerState.leftStickX}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)]">Percent:</span>
                    <span className="text-[var(--text-primary)] font-bold">{Math.round((controllerState.leftStickX / 32768) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Triggers visualizer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                  <span>LT (Brake)</span>
                  <span className="font-mono">{leftTriggerPercent}%</span>
                </div>
                <div className="h-6 bg-[var(--bg-primary)]/80 border border-[var(--border-secondary)] rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-red-500/20 border-r border-red-500 transition-all duration-75"
                    style={{ width: `${leftTriggerPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                  <span>RT (Gas)</span>
                  <span className="font-mono">{rightTriggerPercent}%</span>
                </div>
                <div className="h-6 bg-[var(--bg-primary)]/80 border border-[var(--border-secondary)] rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500/20 border-r border-emerald-500 transition-all duration-75"
                    style={{ width: `${rightTriggerPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Controller Buttons visualizer */}
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                Gamepad Buttons
              </span>
              <div className="flex gap-3">
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isA
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-[var(--border-secondary)] text-[var(--text-secondary)]/50 border-[var(--border-primary)]"
                  }`}
                >
                  Button A (Nitro)
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isX
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                      : "bg-[var(--border-secondary)] text-[var(--text-secondary)]/50 border-[var(--border-primary)]"
                  }`}
                >
                  Button X (Horn)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
