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
    <div className="glass-card p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col gap-6 select-none bg-slate-900/50 backdrop-blur-md">
      {/* Panel Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-cyan-400" />
          <h2 className="text-md font-bold uppercase tracking-wider text-slate-200">
            Input Debug Console
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Latency:</span>
          <span className={`font-mono font-bold ${latency < 10 ? "text-emerald-400" : "text-amber-400"}`}>
            {latency} ms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Active Outputs & Compatibility Status */}
        <div className="flex flex-col gap-5">
          {/* Output Mode Status */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Output Routing Mode
            </span>
            <div className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800/50 rounded-xl">
              {compatStatus.activeMode === "xbox_controller" ? (
                <Gamepad className="w-5 h-5 text-rose-400" />
              ) : (
                <Keyboard className="w-5 h-5 text-cyan-400" />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-200 uppercase">
                  {compatStatus.activeMode === "xbox_controller"
                    ? "Xbox 360 Controller (ViGEm)"
                    : compatStatus.activeMode === "arrows"
                    ? "Keyboard (Arrow Keys)"
                    : "Keyboard (WASD)"}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {compatStatus.activeMode === "xbox_controller"
                    ? "Injecting virtual driver device states"
                    : "Injecting hardware scan codes"}
                </span>
              </div>
            </div>
          </div>

          {/* Browser / Game Compatibility Flags */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
              Compatibility Indicators
            </span>
            <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Scan Code Emulation:</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5 fill-emerald-950" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Low-Level Input Driver:</span>
                {compatStatus.vigemInstalled ? (
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5 fill-emerald-950" />
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
              <p className="text-[10px] text-amber-400/80 leading-normal flex items-start gap-1 bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
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
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Virtual Key States (Held)
              </span>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-900 min-h-[46px] items-center">
                {heldKeys.length === 0 ? (
                  <span className="text-xs text-slate-600 font-medium italic">
                    No keys currently pressed
                  </span>
                ) : (
                  heldKeys.map((key, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono font-bold rounded-md animate-pulse"
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
        <div className="flex flex-col gap-5 border-l border-slate-800/40 pl-0 md:pl-6">
          <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Virtual Controller Debug
          </span>

          <div className="flex flex-col gap-4 bg-slate-950/80 border border-slate-800/50 rounded-xl p-4">
            {/* Steering angle indicator */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Steering Wheel Angle:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {steeringAngle.toFixed(1)}°
                </span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-cyan-500 transition-all duration-75"
                  style={{
                    left: steeringAngle < 0 ? `calc(50% + ${Math.max(-50, (steeringAngle / 90) * 50)}%)` : "50%",
                    right: steeringAngle >= 0 ? `calc(50% - ${Math.min(50, (steeringAngle / 90) * 50)}%)` : "50%",
                  }}
                />
                <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-slate-700" />
              </div>
            </div>

            {/* Left Stick X visualizer */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Left Stick X (Axis)
              </span>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 relative flex items-center justify-center">
                  <div className="absolute w-2 h-2 rounded-full bg-slate-700" />
                  <div
                    className="absolute w-4 h-4 rounded-full bg-rose-500 shadow-md shadow-rose-500/30 transition-all duration-75"
                    style={{ transform: `translateX(${stickXOffset}px)` }}
                  />
                </div>
                <div className="flex flex-col gap-0.5 text-xs font-mono">
                  <div className="flex gap-2">
                    <span className="text-slate-500">Value:</span>
                    <span className="text-slate-200 font-bold">{controllerState.leftStickX}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-slate-500">Percent:</span>
                    <span className="text-slate-200 font-bold">{Math.round((controllerState.leftStickX / 32768) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Triggers visualizer */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>LT (Brake)</span>
                  <span className="font-mono">{leftTriggerPercent}%</span>
                </div>
                <div className="h-6 bg-slate-900 border border-slate-800/80 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-red-500/20 border-r border-red-500 transition-all duration-75"
                    style={{ width: `${leftTriggerPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                  <span>RT (Gas)</span>
                  <span className="font-mono">{rightTriggerPercent}%</span>
                </div>
                <div className="h-6 bg-slate-900 border border-slate-800/80 rounded-md overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500/20 border-r border-emerald-500 transition-all duration-75"
                    style={{ width: `${rightTriggerPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Controller Buttons visualizer */}
            <div className="flex flex-col gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Gamepad Buttons
              </span>
              <div className="flex gap-3">
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isA
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-900/50 text-slate-600 border-slate-800/60"
                  }`}
                >
                  Button A (Nitro)
                </div>
                <div
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    isX
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-slate-900/50 text-slate-600 border-slate-800/60"
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
