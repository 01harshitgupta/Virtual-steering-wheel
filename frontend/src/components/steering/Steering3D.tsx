import { useEffect, useState, useRef } from "react";
import { useStore } from "../../store/useStore";
import { motion, useSpring, useTransform } from "framer-motion";

export default function Steering3D() {
  const { steeringAngle, speed, gesture, isTracking } = useStore();

  // Clamp steering angle
  const angleClamped = Math.max(-95, Math.min(95, steeringAngle));
  
  // Smooth Framer Motion spring for wheel rotation inertia
  const smoothAngle = useSpring(0, { stiffness: 220, damping: 26 });
  
  useEffect(() => {
    smoothAngle.set(isTracking ? angleClamped : 0);
  }, [steeringAngle, isTracking, angleClamped]);

  // Compute active F1 Gear and RPM dynamically based on speed
  let gear = "N";
  let rpm = 0;
  
  if (isTracking && speed > 2) {
    if (speed > 175) gear = "8";
    else if (speed > 145) gear = "7";
    else if (speed > 115) gear = "6";
    else if (speed > 90) gear = "5";
    else if (speed > 65) gear = "4";
    else if (speed > 45) gear = "3";
    else if (speed > 25) gear = "2";
    else gear = "1";

    const gearNum = parseInt(gear);
    const gearMinSpeed = gearNum === 1 ? 0 : (gearNum - 1) * 25;
    const gearMaxSpeed = gearNum * 25;
    const speedInGear = speed - gearMinSpeed;
    const range = gearMaxSpeed - gearMinSpeed;
    const rpmPct = Math.min(1, Math.max(0, speedInGear / range));
    // F1 RPM sweeps from 5000 to 14800
    rpm = Math.round(5000 + rpmPct * 9500);
  } else if (isTracking) {
    rpm = 1200; // Idle RPM
  }

  // F1 LED Shift light logic (15 LEDs total)
  const renderShiftLeds = () => {
    const leds = [];
    const ledThresholds = Array.from({ length: 15 }, (_, i) => 5000 + i * 600); // 5000 to 14000 RPM
    
    // Check if redline threshold exceeded (rapid flash warning)
    const isRedline = rpm >= 13800;

    for (let i = 0; i < 15; i++) {
      const active = rpm >= ledThresholds[i];
      let colorClass = "bg-neutral-800 border-neutral-900 shadow-none";
      
      if (active) {
        if (isRedline) {
          colorClass = "bg-[#ff1744] border-red-800 shadow-[0_0_8px_#ff1744] animate-led-flash";
        } else if (i < 5) {
          colorClass = "bg-[#00ff95] border-green-800 shadow-[0_0_8px_#00ff95]";
        } else if (i < 10) {
          colorClass = "bg-[#ff9800] border-orange-800 shadow-[0_0_8px_#ff9800]";
        } else {
          colorClass = "bg-[#ff1744] border-red-800 shadow-[0_0_8px_#ff1744]";
        }
      }

      leds.push(
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full border transition-all duration-75 ${colorClass}`}
        />
      );
    }
    return leds;
  };

  const direction = angleClamped < -8 ? "LEFT" : angleClamped > 8 ? "RIGHT" : "CENTER";
  const dirColor = angleClamped < -8 ? "#ff9800" : angleClamped > 8 ? "#ff1744" : "#00ff95";

  return (
    <div className="glass-card rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-6 h-[440px] shadow-2xl border-slate-800/80">
      
      {/* 1. F1 Shift Light HUD Cluster */}
      <div className="w-full flex flex-col items-center gap-1.5 z-20">
        <div className="flex items-center gap-1 bg-[#050816]/95 px-4 py-2 border border-slate-800 rounded-lg shadow-xl">
          {renderShiftLeds()}
        </div>
        <div className="flex justify-between w-full max-w-[200px] px-1 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">
          <span>5000 RPM</span>
          <span>10000</span>
          <span className="text-[#ff1744]">SHIFT</span>
        </div>
      </div>

      {/* 2. Steering Arena */}
      <div className="flex-1 w-full flex items-center justify-center relative overflow-hidden my-2">
        {/* Holographic Target Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
          <div className="w-64 h-64 border border-dashed border-[#00e5ff]/10 rounded-full animate-spin" style={{ animationDuration: "35s" }} />
          <div className="w-80 h-80 border border-dashed border-[#00e5ff]/5 rounded-full animate-spin" style={{ animationDuration: "20s", animationDirection: "reverse" }} />
          <div className="w-px h-full bg-[#00e5ff]/5" />
          <div className="h-px w-full bg-[#00e5ff]/5" />
        </div>

        {/* HERO STEERING WHEEL */}
        <motion.div
          style={{ rotate: smoothAngle }}
          className="relative z-10 w-[270px] h-[270px] flex items-center justify-center cursor-grab select-none pointer-events-none drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)]"
        >
          {/* F1 Steering Wheel Design (High-tech carbon texture shapes) */}
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <defs>
              <linearGradient id="carbonG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e2530" />
                <stop offset="50%" stopColor="#0f131c" />
                <stop offset="100%" stopColor="#080a0f" />
              </linearGradient>
              <radialGradient id="gripG" cx="45%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#1c2436" />
                <stop offset="80%" stopColor="#0d111b" />
                <stop offset="100%" stopColor="#05070c" />
              </radialGradient>
              <filter id="f1-shadow">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
              </filter>
            </defs>

            {/* Left Grip Handle */}
            <path
              d="M 55 70 C 40 85, 30 110, 30 145 C 30 180, 42 205, 55 220 C 65 230, 75 225, 75 200 C 75 185, 68 160, 68 145 C 68 130, 75 105, 75 90 C 75 75, 65 60, 55 70 Z"
              fill="url(#gripG)"
              stroke="#0a0f1d"
              strokeWidth="2"
              filter="url(#f1-shadow)"
            />

            {/* Right Grip Handle */}
            <path
              d="M 245 70 C 260 85, 270 110, 270 145 C 270 180, 258 205, 245 220 C 235 230, 225 225, 225 200 C 225 185, 232 160, 232 145 C 232 130, 225 105, 225 90 C 225 75, 235 60, 245 70 Z"
              fill="url(#gripG)"
              stroke="#0a0f1d"
              strokeWidth="2"
              filter="url(#f1-shadow)"
            />

            {/* Carbon Fiber Hub Center Plate */}
            <path
              d="M 70 80 L 230 80 C 240 80, 245 88, 240 100 L 215 210 C 210 225, 200 230, 180 230 L 120 230 C 100 230, 90 225, 85 210 L 60 100 C 55 88, 60 80, 70 80 Z"
              fill="url(#carbonG)"
              stroke="rgba(0, 229, 255, 0.2)"
              strokeWidth="2.5"
            />

            {/* Premium Gold Dial Accents (Motorsport style) */}
            <circle cx="95" cy="115" r="9" fill="#ff9800" stroke="#000" strokeWidth="2" />
            <line x1="95" y1="115" x2="95" y2="108" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            
            <circle cx="205" cy="115" r="9" fill="#00ff95" stroke="#000" strokeWidth="2" />
            <line x1="205" y1="115" x2="209" y2="120" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />

            <circle cx="95" cy="195" r="9" fill="#2563eb" stroke="#000" strokeWidth="2" />
            <circle cx="205" cy="195" r="9" fill="#ff1744" stroke="#000" strokeWidth="2" />

            {/* Steering wheel central screws */}
            <circle cx="115" cy="95" r="3" fill="#64748b" />
            <circle cx="185" cy="95" r="3" fill="#64748b" />
            <circle cx="110" cy="215" r="3" fill="#64748b" />
            <circle cx="190" cy="215" r="3" fill="#64748b" />

            {/* 3. Central Steering LCD screen casing */}
            <rect
              x="100"
              y="120"
              width="100"
              height="60"
              rx="4"
              fill="#050816"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1.5"
            />
          </svg>

          {/* HTML Overlay Inside LCD Screen Frame */}
          <div className="absolute w-[86px] h-[50px] bg-black/95 rounded-sm p-1 flex flex-col justify-between font-mono z-20 border border-slate-900">
            {/* LCD Header: Gear Shift lights indicator */}
            <div className="flex justify-between items-center text-[5.5px] text-slate-500 font-bold border-b border-slate-900 pb-0.5">
              <span>RPM {rpm}</span>
              <span className="text-[#00e5ff]">BIAS 52</span>
            </div>

            {/* LCD Center Display: Huge Active Gear + Speed */}
            <div className="flex-1 flex justify-around items-center py-0.5">
              {/* Huge Gear number */}
              <span
                className="text-[20px] font-black text-[#00ff95]"
                style={{ textShadow: "0 0 8px rgba(0,255,149,0.5)", fontFamily: "Orbitron" }}
              >
                {gear}
              </span>
              {/* Divider */}
              <div className="w-[1px] h-full bg-slate-900" />
              {/* Huge Speed */}
              <div className="flex flex-col items-center">
                <span
                  className="text-[13px] font-black text-[#f8fafc]"
                  style={{ fontFamily: "Orbitron" }}
                >
                  {isTracking ? Math.round(speed) : 0}
                </span>
                <span className="text-[4px] font-bold text-slate-600">KM/H</span>
              </div>
            </div>

            {/* LCD Footer Display: steering angle + active gesture */}
            <div className="flex justify-between items-center text-[5.5px] font-bold border-t border-slate-900 pt-0.5">
              <span className="text-[#ff9800]">ANG {Math.round(angleClamped)}°</span>
              <span className="text-slate-400 truncate max-w-[40px] uppercase">
                {gesture === "Cruising" ? "CRUISE" : gesture === "None" ? "N/A" : gesture}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Bottom Steering Stats HUD */}
      <div className="w-full flex items-center justify-between border-t border-slate-800/80 pt-3.5 z-20">
        <div className="flex flex-col text-left">
          <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-[0.2em]">Vector State</span>
          <span className="text-[11px] font-black tracking-wider uppercase font-mono mt-0.5" style={{ color: dirColor }}>
            {direction}
          </span>
        </div>

        {/* F1 styled RPM Segment meter */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 8 }).map((_, idx) => {
            const stepThreshold = 5000 + idx * 1200;
            const active = rpm >= stepThreshold;
            let ledColor = "rgba(255,255,255,0.05)";
            if (active) {
              ledColor = idx < 3 ? "#00ff95" : idx < 6 ? "#ff9800" : "#ff1744";
            }
            return (
              <div
                key={idx}
                className="w-1.5 h-3.5 rounded-sm transition-all duration-75"
                style={{
                  background: ledColor,
                  boxShadow: active ? `0 0 6px ${ledColor}` : "none",
                }}
              />
            );
          })}
        </div>

        <div className="flex flex-col text-right">
          <span className="text-[7.5px] text-slate-500 font-bold uppercase tracking-[0.2em]">Target Angle</span>
          <span className="text-[11px] font-black text-[#00e5ff] font-mono tracking-wider mt-0.5">
            {Math.round(angleClamped) > 0 ? "+" : ""}{Math.round(angleClamped)}°
          </span>
        </div>
      </div>

    </div>
  );
}
