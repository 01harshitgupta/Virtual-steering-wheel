import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Settings as SettingsIcon, Link2, Sliders, Shield, Gamepad } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings } = useStore();
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  // Query webcam lists
  useEffect(() => {
    async function getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoDevices);
      } catch (err) {
        console.warn("Could not query media device lists:", err);
      }
    }
    getCameras();
  }, []);

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 select-none max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-[var(--border-secondary)] pb-5">
        <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
          System Settings
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-widest">
          Configure tracking bindings, websocket server links, and parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Setup */}
        <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]/80 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
            <Link2 className="w-4 h-4 text-cyan-500" />
            Link Configuration
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">WebSocket Server Address</label>
              <input
                type="text"
                value={settings.wsUrl}
                onChange={(e) => updateSettings({ wsUrl: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] text-sm font-mono text-cyan-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)]/35 rounded-xl border border-[var(--border-secondary)]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">Auto-Connect</span>
                <span className="text-[10px] text-[var(--text-secondary)]/80">Reconnect on socket timeouts</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoConnect}
                onChange={(e) => updateSettings({ autoConnect: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Camera Selector */}
        <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]/80 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            Device Selector
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Target Video Feed Device</label>
              <select
                value={settings.webcamId}
                onChange={(e) => updateSettings({ webcamId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
              >
                <option value="default">Default System Camera</option>
                {cameras.map((cam, idx) => (
                  <option key={idx} value={cam.deviceId}>
                    {cam.label || `Camera ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Tracking Profile</label>
              <select
                value={settings.trackingProfile}
                onChange={(e) => updateSettings({ trackingProfile: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
              >
                <option value="face">Face Mesh Pose (Yaw/Pitch)</option>
                <option value="hands">Hand Tilt (Yaw Axis)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Control Tuning */}
        <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]/80 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
            <Sliders className="w-4 h-4 text-cyan-500" />
            Control Tuning
          </h2>

          <div className="flex flex-col gap-4">
            {/* Sensitivity */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <span>Steering Lock Ratio</span>
                <span className="font-mono text-cyan-500">{settings.sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={settings.sensitivity}
                onChange={(e) => updateSettings({ sensitivity: parseFloat(e.target.value) })}
                className="w-full h-1 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Deadzone */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                <span>Steering Deadzone</span>
                <span className="font-mono text-cyan-500">{settings.deadzone}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={settings.deadzone}
                onChange={(e) => updateSettings({ deadzone: parseInt(e.target.value) })}
                className="w-full h-1 bg-[var(--bg-primary)] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Gesture Speed/Brake trigger mode */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Webcam Speed/Brake Gesture Trigger</label>
              <select
                value={settings.gestureControlMode}
                onChange={(e) => updateSettings({ gestureControlMode: e.target.value as any })}
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
              >
                <option value="distance">Hand Distance Mode (Push forward to speed up, bring close to brake)</option>
                <option value="height">Hand Elevation Mode (Lift hands high to speed up, lower to brake)</option>
                <option value="keyboard">Keyboard Hybrid Mode (Use W / S / Space keys manually)</option>
              </select>
            </div>

            {/* Auto center force */}
            <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)]/35 rounded-xl border border-[var(--border-secondary)]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">Auto-Centering Spring Force</span>
                <span className="text-[10px] text-[var(--text-secondary)]/80">Auto-align when face detection is lost</span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCenter}
                onChange={(e) => updateSettings({ autoCenter: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Game bindings */}
        <div className="glass-card p-6 rounded-2xl shadow-xl flex flex-col gap-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]/80 flex items-center gap-2 border-b border-[var(--border-secondary)] pb-3">
            <Gamepad className="w-4 h-4 text-rose-500" />
            Game Integration
          </h2>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Virtual Output Mode</label>
              <select
                value={settings.virtualOutputMode}
                onChange={(e) => updateSettings({ virtualOutputMode: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-primary)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-cyan-500/50"
              >
                <option value="vjoy">DirectX Gamepad Emulation (vJoy)</option>
                <option value="wasd">Keyboard Mapping (A / D / W / S)</option>
                <option value="arrows">Keyboard Mapping (Arrow Keys)</option>
                <option value="mouse">Mouse Emulation (X-Axis Lock)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-primary)]/35 rounded-xl border border-[var(--border-secondary)]">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">Enable Gamepad Vibrations</span>
                <span className="text-[10px] text-[var(--text-secondary)]/80">Send force feedback haptics</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enableVibrations}
                onChange={(e) => updateSettings({ enableVibrations: e.target.checked })}
                className="w-4 h-4 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
