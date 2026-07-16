import { useState } from "react";
import { useStore } from "../store/useStore";
import CameraFeed from "../components/camera/CameraFeed";
import { Compass, CheckCircle2, ChevronRight, HelpCircle, ArrowLeftRight } from "lucide-react";

export default function Calibration() {
  const { calibrationStep, setCalibrationStep, setCalibrationBounds, isTracking } = useStore();
  const [centerOffsetVal, setCenterOffsetVal] = useState(0);
  const [leftBoundVal, setLeftBoundVal] = useState(-30);
  const [rightBoundVal, setRightBoundVal] = useState(30);

  const steps = [
    { title: "Introduction", desc: "Position your webcam properly" },
    { title: "Center Position", desc: "Look straight at the screen" },
    { title: "Left Limit", desc: "Turn all the way to the left" },
    { title: "Right Limit", desc: "Turn all the way to the right" },
    { title: "Review", desc: "Verify calibrated settings" },
  ];

  const handleNextStep = () => {
    if (calibrationStep === 1) {
      // Calibrate Center
      const offset = 0; // simulated
      setCenterOffsetVal(offset);
      setCalibrationBounds({ center: offset });
    } else if (calibrationStep === 2) {
      // Calibrate Left
      const left = -45; // simulated
      setLeftBoundVal(left);
      setCalibrationBounds({ left });
    } else if (calibrationStep === 3) {
      // Calibrate Right
      const right = 45; // simulated
      setRightBoundVal(right);
      setCalibrationBounds({ right });
    }

    setCalibrationStep(Math.min(calibrationStep + 1, 4));
  };

  const handleReset = () => {
    setCalibrationStep(0);
    setCalibrationBounds({ center: 0, left: -45, right: 45 });
  };

  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 select-none max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="border-b border-[var(--border-secondary)] pb-5">
        <h1 className="text-3xl font-black tracking-tight" style={{
          background: "linear-gradient(135deg, var(--text-primary) 0%, var(--accent-bright) 70%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          Calibration Wizard
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-widest">
          Align sensors and configure steering boundaries
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Live Feed for alignment */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <CameraFeed />

          {/* Quick instructions panel */}
          <div className="glass-card p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            <HelpCircle className="w-5 h-5 text-cyan-500 shrink-0" />
            <div>
              <span className="font-black text-[var(--text-primary)] block mb-1">Calibration Pro-Tips:</span>
              Ensure your face is well-lit and directly in front of the camera. Remove sunglasses, hats, or anything obstructing your eye/nose visibility to improve detection accuracy.
            </div>
          </div>
        </div>

        {/* Right Side: Step Wizard */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Step tracker timeline */}
          <div className="glass-card p-5 rounded-2xl shadow-xl flex flex-col gap-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]/80 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-500" />
              Progress Timeline
            </h2>

            <div className="flex flex-col gap-3.5 relative pl-4 border-l border-[var(--border-secondary)] ml-2 py-1">
              {steps.map((step, idx) => {
                const isCurrent = calibrationStep === idx;
                const isPassed = calibrationStep > idx;

                return (
                  <div key={idx} className="relative flex flex-col gap-0.5">
                    {/* Circle Node */}
                    <div
                      className={`absolute left-[-21px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isCurrent
                          ? "bg-cyan-500 border-cyan-500 shadow-md shadow-cyan-500/40 scale-110"
                          : isPassed
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-[var(--bg-primary)] border-[var(--border-primary)]"
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold ${
                        isCurrent ? "text-cyan-500 font-bold" : isPassed ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]/50"
                      }`}
                    >
                      {step.title}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]/80">{step.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive instruction card */}
          <div className="glass-card p-6 rounded-2xl shadow-xl min-h-[220px] flex flex-col justify-between">
            {/* Step Content */}
            {calibrationStep === 0 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-black text-[var(--text-primary)]">1. Connect & Position</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Welcome to the DriveSense Calibration setup. Before continuing, make sure your webcam tracking state is turned on.
                </p>
                {!isTracking && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
                    Warning: Camera feed is stopped. Please start tracking first using the sidebar control.
                  </div>
                )}
              </div>
            )}

            {calibrationStep === 1 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-black text-[var(--text-primary)]">2. Centering Alignment</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Relax, sit in your normal driving posture, look directly at the center of your screen, and keep your face stable.
                </p>
              </div>
            )}

            {calibrationStep === 2 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-black text-[var(--text-primary)]">3. Maximum Left Lock</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Tilt or rotate your head (or hand) to the left to the maximum extent you wish to use for steering control, then hold.
                </p>
              </div>
            )}

            {calibrationStep === 3 && (
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-black text-[var(--text-primary)]">4. Maximum Right Lock</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Tilt or rotate your head (or hand) to the right to the maximum extent you wish to use for steering control, then hold.
                </p>
              </div>
            )}

            {calibrationStep === 4 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="text-lg font-black text-[var(--text-primary)]">Calibration Complete!</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Sensors successfully mapped to your range of motion. Live boundaries are listed below.
                </p>
                <div className="grid grid-cols-3 gap-2 bg-[var(--bg-primary)]/45 p-3 rounded-xl border border-[var(--border-secondary)] font-mono text-center">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--text-secondary)]/85">LEFT LOCK</span>
                    <span className="text-xs font-bold text-rose-500">{leftBoundVal}°</span>
                  </div>
                  <div className="flex flex-col border-x border-[var(--border-secondary)]">
                    <span className="text-[10px] text-[var(--text-secondary)]/85">CENTER</span>
                    <span className="text-xs font-bold text-cyan-500">{centerOffsetVal}°</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--text-secondary)]/85">RIGHT LOCK</span>
                    <span className="text-xs font-bold text-emerald-500">{rightBoundVal}°</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-[var(--border-secondary)]">
              {calibrationStep > 0 && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}

              {calibrationStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  disabled={calibrationStep === 0 && !isTracking}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-cyan-500/10 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                >
                  <span>
                    {calibrationStep === 0
                      ? "Get Started"
                      : calibrationStep === 1
                      ? "Capture Center"
                      : calibrationStep === 2
                      ? "Capture Left"
                      : "Capture Right"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleReset}
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[var(--border-secondary)] hover:bg-[var(--border-primary)] text-[var(--text-primary)] border border-[var(--border-primary)] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Recalibrate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}