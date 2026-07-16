import { useEffect, useRef, useState } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Calibration from "./pages/Calibration";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { useStore } from "./store/useStore";
import LoadingScreen from "./components/LoadingScreen";

function App() {
  const { isTracking, isConnected, setSteeringAngle, setSpeed, addTelemetryPoint, settings, steeringAngle, gesture } = useStore();
  const [showLoader, setShowLoader] = useState(true);
  const keyStateRef = useRef({ left: false, right: false, up: false, down: false });

  // Handle WebSocket Connection based on Tracking status
  useEffect(() => {
    if (isTracking) {
      import("./services/websocket").then(({ webSocketService }) => {
        webSocketService.connect(settings.wsUrl);
      });
    } else {
      import("./services/websocket").then(({ webSocketService }) => {
        webSocketService.disconnect();
      });
    }
    return () => {
      import("./services/websocket").then(({ webSocketService }) => {
        webSocketService.disconnect();
      });
    };
  }, [isTracking, settings.wsUrl]);

  // Interactive Keyboard Controls for Offline Simulation Mode
  useEffect(() => {
    if (!isTracking || isConnected) return;

    // Track active key states
    const keys: Record<string, boolean> = {
      a: false, d: false, w: false, s: false,
      arrowleft: false, arrowright: false, arrowup: false, arrowdown: false,
      space: false, n: false, h: false
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === " ") {
        keys["space"] = true;
      } else if (key in keys) {
        keys[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === " ") {
        keys["space"] = false;
      } else if (key in keys) {
        keys[key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const intervalId = setInterval(() => {
      // Pull latest telemetry from store (integrates seamlessly with webcam tracking updates)
      let localAngle = useStore.getState().steeringAngle;
      let localSpeed = useStore.getState().speed;
      // 1. Steering calculations
      const leftActive = keys["a"] || keys["arrowleft"];
      const rightActive = keys["d"] || keys["arrowright"];
      const accelerateActive = keys["w"] || keys["arrowup"];
      const brakeActive = keys["space"];
      const reverseActive = keys["s"] || keys["arrowdown"];
      const nitroActive = keys["n"];
      const hornActive = keys["h"];

      const anyKeyActive = leftActive || rightActive || accelerateActive || brakeActive || reverseActive || nitroActive || hornActive;

      // If no keyboard keys are pressed, do not override webcam tracking states!
      if (!anyKeyActive) {
        const latencyVal = Math.round(11 + Math.random() * 4);
        const confidenceVal = Math.round(96 + Math.random() * 3);

        const timeStr = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // Still append telemetry points so the graphs and UI remain active
        addTelemetryPoint({
          time: timeStr,
          angle: localAngle,
          speed: localSpeed,
          latency: latencyVal,
          confidence: confidenceVal,
        });

        useStore.setState({
          latency: latencyVal,
          confidence: confidenceVal,
        });
        return;
      }

      if (leftActive && !rightActive) {
        localAngle = Math.max(-90, localAngle - 6);
      } else if (rightActive && !leftActive) {
        localAngle = Math.min(90, localAngle + 6);
      } else {
        // Auto centering spring logic
        if (localAngle > 0) {
          localAngle = Math.max(0, localAngle - 8);
        } else if (localAngle < 0) {
          localAngle = Math.min(0, localAngle + 8);
        }
      }

      // 2. Velocity and Gesture calculations
      let currentGesture = "None";

      if (brakeActive) {
        currentGesture = "Closed Fist (Brake)";
        localSpeed = Math.max(0, localSpeed - 8);
      } else if (nitroActive) {
        currentGesture = "Thumbs Up (Nitro)";
        localSpeed = Math.min(220, localSpeed + 6);
      } else if (reverseActive) {
        currentGesture = "Thumbs Down (Reverse)";
        localSpeed = Math.max(0, localSpeed - 3); // Decelerate / slow reverse
      } else if (accelerateActive) {
        localSpeed = Math.min(140, localSpeed + 3);
      } else if (hornActive) {
        currentGesture = "Point Finger (Horn)";
        localSpeed = Math.max(0, localSpeed - 1);
      } else {
        // Natural friction coasting deceleration
        localSpeed = Math.max(0, localSpeed - 1.5);
      }

      const latencyVal = Math.round(11 + Math.random() * 4);
      const confidenceVal = Math.round(96 + Math.random() * 3);

      // Dispatch inputs to state store
      setSteeringAngle(localAngle);
      setSpeed(localSpeed);

      // Append logs to telemetry charts
      const timeStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      addTelemetryPoint({
        time: timeStr,
        angle: localAngle,
        speed: localSpeed,
        latency: latencyVal,
        confidence: confidenceVal,
      });

      useStore.setState({
        latency: latencyVal,
        confidence: confidenceVal,
        gesture: currentGesture,
      });

    }, 50); // Fast 20Hz refresh rate for smooth responsiveness

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      clearInterval(intervalId);
    };
  }, [isTracking, isConnected, setSteeringAngle, setSpeed, addTelemetryPoint]);

  // Synchronize telemetry state with global OS keyboard injector
  useEffect(() => {
    const ds = (window as any).DriveSense;
    if (!ds) return;

    if (!isTracking) {
      // Release all key presses when tracking stops
      ds.sendKey("Up", 0x25); // ArrowLeft
      ds.sendKey("Up", 0x41); // A
      ds.sendKey("Up", 0x27); // ArrowRight
      ds.sendKey("Up", 0x44); // D
      ds.sendKey("Up", 0x26); // ArrowUp
      ds.sendKey("Up", 0x57); // W
      ds.sendKey("Up", 0x28); // ArrowDown
      ds.sendKey("Up", 0x53); // S
      ds.sendKey("Up", 0x20); // Space
      keyStateRef.current = { left: false, right: false, up: false, down: false };
      return;
    }

    const state = keyStateRef.current;

    // 1. Steering key injections (Left: ArrowLeft + A, Right: ArrowRight + D)
    if (steeringAngle < -8) {
      if (!state.left) {
        ds.sendKey("Dn", 0x25); ds.sendKey("Dn", 0x41);
        state.left = true;
      }
      if (state.right) {
        ds.sendKey("Up", 0x27); ds.sendKey("Up", 0x44);
        state.right = false;
      }
    } else if (steeringAngle > 8) {
      if (!state.right) {
        ds.sendKey("Dn", 0x27); ds.sendKey("Dn", 0x44);
        state.right = true;
      }
      if (state.left) {
        ds.sendKey("Up", 0x25); ds.sendKey("Up", 0x41);
        state.left = false;
      }
    } else {
      if (state.left) {
        ds.sendKey("Up", 0x25); ds.sendKey("Up", 0x41);
        state.left = false;
      }
      if (state.right) {
        ds.sendKey("Up", 0x27); ds.sendKey("Up", 0x44);
        state.right = false;
      }
    }

    // 2. Velocity key injections (Accelerate: ArrowUp + W, Brake: ArrowDown + S + Space)
    const isAccelerating = gesture.toLowerCase().includes("accelerat") || gesture.toLowerCase().includes("forward") || gesture.toLowerCase().includes("high") || gesture.toLowerCase().includes("raised") || gesture.toLowerCase().includes("nitro");
    const isBraking = gesture.toLowerCase().includes("brake") || gesture.toLowerCase().includes("closed");

    if (isAccelerating) {
      if (!state.up) {
        ds.sendKey("Dn", 0x26); ds.sendKey("Dn", 0x57);
        state.up = true;
      }
      if (state.down) {
        ds.sendKey("Up", 0x28); ds.sendKey("Up", 0x53); ds.sendKey("Up", 0x20);
        state.down = false;
      }
    } else if (isBraking) {
      if (!state.down) {
        ds.sendKey("Dn", 0x28); ds.sendKey("Dn", 0x53); ds.sendKey("Dn", 0x20);
        state.down = true;
      }
      if (state.up) {
        ds.sendKey("Up", 0x26); ds.sendKey("Up", 0x57);
        state.up = false;
      }
    } else {
      if (state.up) {
        ds.sendKey("Up", 0x26); ds.sendKey("Up", 0x57);
        state.up = false;
      }
      if (state.down) {
        ds.sendKey("Up", 0x28); ds.sendKey("Up", 0x53); ds.sendKey("Up", 0x20);
        state.down = false;
      }
    }
  }, [isTracking, steeringAngle, gesture]);

  return (
    <>
      {showLoader && <LoadingScreen onComplete={() => setShowLoader(false)} />}
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
      </Router>
    </>
  );
}

export default App;