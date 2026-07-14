import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Video, Eye, EyeOff, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import { useStore } from "../../store/useStore";

interface Props {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function CameraFeed({ isExpanded = false, onToggleExpand }: Props) {
  const { isTracking } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebcam, setHasWebcam] = useState<boolean | null>(null);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Camera settings
  const [isFlipped, setIsFlipped] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const prevAngleRef = useRef<number>(0);
  const lastResultsRef = useRef<any>(null);
  const handsRef = useRef<any>(null);
  const isProcessingFrame = useRef(false);

  const cdnSourceRef = useRef<string>("https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240");

  // Helper helper to dynamically inject external scripts
  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });
  };

  // 1. Load MediaPipe script dynamically with fallback
  useEffect(() => {
    async function initScripts() {
      console.log("[CameraFeed] Attempting to load MediaPipe Hands from jsDelivr...");
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js");
        console.log("[CameraFeed] MediaPipe Hands loaded from jsDelivr successfully!");
        cdnSourceRef.current = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240";
        setMediaPipeLoaded(true);
      } catch (err) {
        console.warn("[CameraFeed] jsDelivr load failed. Attempting unpkg fallback...", err);
        try {
          await loadScript("https://unpkg.com/@mediapipe/hands@0.4.1675469240/hands.js");
          console.log("[CameraFeed] MediaPipe Hands loaded from unpkg successfully!");
          cdnSourceRef.current = "https://unpkg.com/@mediapipe/hands@0.4.1675469240";
          setMediaPipeLoaded(true);
        } catch (err2) {
          console.error("[CameraFeed] All CDNs failed to load MediaPipe Hands script!", err2);
        }
      }
    }
    initScripts();
  }, []);

  // 2. Initialize MediaPipe model once loaded
  useEffect(() => {
    if (!mediaPipeLoaded) return;

    let hands: any = null;
    try {
      console.log("[CameraFeed] Initializing MediaPipe Hands using source:", cdnSourceRef.current);
      hands = new (window as any).Hands({
        locateFile: (file: string) => `${cdnSourceRef.current}/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        lastResultsRef.current = results;
      });

      handsRef.current = hands;
      console.log("[CameraFeed] MediaPipe Hands model initialized successfully!");
    } catch (err) {
      console.error("[CameraFeed] Failed to initialize MediaPipe Hands model constructor:", err);
    }

    return () => {
      if (hands) {
        try { hands.close(); } catch {}
      }
      handsRef.current = null;
      lastResultsRef.current = null;
    };
  }, [mediaPipeLoaded]);

  // 3. Setup standard camera stream (respects device settings, works reliably)
  useEffect(() => {
    if (!isTracking) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      return;
    }

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 360 },
          audio: false,
        });
        setStream(mediaStream);
        setHasWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play()
            .then(() => console.log("[CameraFeed] Webcam playback started successfully."))
            .catch((err) => console.warn("[CameraFeed] Explicit play call warning:", err));
        }
      } catch (err) {
        console.warn("[CameraFeed] Webcam access denied or unavailable:", err);
        setHasWebcam(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isTracking]);

  // 4. Main Canvas loop & Asynchronous frame feeder
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;

    const renderOverlay = () => {
      frameCount++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!isTracking) {
        // Draw standby screens
        ctx.fillStyle = "rgba(241, 245, 249, 0.9)";
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "rgba(0, 36, 107, 0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, w - 40, h - 40);

        ctx.fillStyle = "#00246b"; // BMW Navy
        ctx.font = "bold 13px font-mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText("VIDEO STREAM STANDBY", w / 2, h / 2 - 10);
        ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
        ctx.font = "11px sans-serif";
        ctx.fillText("Click 'Start Engine' to enable camera feeds", w / 2, h / 2 + 15);
        return;
      }

      // Feed camera frame to MediaPipe model asynchronously (concurrency locked)
      if (handsRef.current && videoRef.current && videoRef.current.readyState >= 2 && !isProcessingFrame.current) {
        isProcessingFrame.current = true;
        try {
          handsRef.current.send({ image: videoRef.current })
            .then(() => {
              isProcessingFrame.current = false;
            })
            .catch((err: any) => {
              isProcessingFrame.current = false;
              console.warn("[CameraFeed] MediaPipe frame send async error:", err);
            });
        } catch (err) {
          isProcessingFrame.current = false;
          console.error("[CameraFeed] MediaPipe frame send sync error:", err);
        }
      }

      // Draw crosshairs
      ctx.strokeStyle = "rgba(0, 163, 224, 0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 40, w - 80, h - 80);

      // Center crosshair
      ctx.beginPath();
      ctx.moveTo(w / 2 - 20, h / 2);
      ctx.lineTo(w / 2 + 20, h / 2);
      ctx.moveTo(w / 2, h / 2 - 20);
      ctx.lineTo(w / 2, h / 2 + 20);
      ctx.stroke();

      const results = lastResultsRef.current;
      let leftHand = null;
      let rightHand = null;

      // Extract left and right hands from landmarks results
      if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        if (results.multiHandLandmarks.length === 1) {
          const hand = results.multiHandLandmarks[0];
          if (hand[0].x < 0.5) {
            leftHand = hand;
          } else {
            rightHand = hand;
          }
        } else if (results.multiHandLandmarks.length >= 2) {
          const sorted = [...results.multiHandLandmarks].sort((a, b) => a[0].x - b[0].x);
          leftHand = sorted[0];
          rightHand = sorted[1];
        }
      }

      const handsDetected = leftHand !== null || rightHand !== null;

      if (handsDetected) {
        let leftHandX = -1, leftHandY = -1;
        let rightHandX = -1, rightHandY = -1;
        const { isConnected, settings, setSteeringAngle } = useStore.getState();

        // 1. Process Left Hand
        let leftThumbPressed = false;
        if (leftHand) {
          leftHandX = isFlipped ? (1 - leftHand[9].x) * w : leftHand[9].x * w;
          leftHandY = leftHand[9].y * h;

          // 3D Scale-Invariant fold ratio calculation (Wrist 0 to MCP 9 vs Thumb Tip 4 to Index MCP 5)
          const dx9 = leftHand[0].x - leftHand[9].x;
          const dy9 = leftHand[0].y - leftHand[9].y;
          const dz9 = (leftHand[0].z || 0) - (leftHand[9].z || 0);
          const handSize = Math.sqrt(dx9 * dx9 + dy9 * dy9 + dz9 * dz9);

          const dx5 = leftHand[4].x - leftHand[5].x;
          const dy5 = leftHand[4].y - leftHand[5].y;
          const dz5 = (leftHand[4].z || 0) - (leftHand[5].z || 0);
          const thumbDist = Math.sqrt(dx5 * dx5 + dy5 * dy5 + dz5 * dz5);

          const ratio = thumbDist / (handSize || 1);
          leftThumbPressed = ratio < 0.65;

          if (showSkeleton) {
            drawSkeletonHand(leftHand, false, leftThumbPressed);
          }
        }

        // 2. Process Right Hand
        let rightThumbPressed = false;
        if (rightHand) {
          rightHandX = isFlipped ? (1 - rightHand[9].x) * w : rightHand[9].x * w;
          rightHandY = rightHand[9].y * h;

          // 3D Scale-Invariant fold ratio calculation (Wrist 0 to MCP 9 vs Thumb Tip 4 to Index MCP 5)
          const dx9 = rightHand[0].x - rightHand[9].x;
          const dy9 = rightHand[0].y - rightHand[9].y;
          const dz9 = (rightHand[0].z || 0) - (rightHand[9].z || 0);
          const handSize = Math.sqrt(dx9 * dx9 + dy9 * dy9 + dz9 * dz9);

          const dx5 = rightHand[4].x - rightHand[5].x;
          const dy5 = rightHand[4].y - rightHand[5].y;
          const dz5 = (rightHand[4].z || 0) - (rightHand[5].z || 0);
          const thumbDist = Math.sqrt(dx5 * dx5 + dy5 * dy5 + dz5 * dz5);

          const ratio = thumbDist / (handSize || 1);
          rightThumbPressed = ratio < 0.65;

          if (showSkeleton) {
            drawSkeletonHand(rightHand, true, rightThumbPressed);
          }
        }

        // 3. Compute Steering Angle (using raw coordinates to avoid mirroring sign-flips)
        if (leftHand && rightHand) {
          const rawDx = rightHand[9].x - leftHand[9].x;
          const rawDy = rightHand[9].y - leftHand[9].y;
          let angleVal = Math.atan2(rawDy, rawDx) * (180 / Math.PI);

          if (isFlipped) {
            angleVal = -angleVal;
          }

          if (Math.abs(angleVal) < settings.deadzone) {
            angleVal = 0;
          } else {
            angleVal = angleVal * settings.sensitivity;
          }
          angleVal = Math.max(-95, Math.min(95, angleVal));

          // Increased low-pass filtering smoothing (0.15 new, 0.85 history) to prevent any micro-fluctuations
          const smoothedAngle = angleVal * 0.15 + prevAngleRef.current * 0.85;
          prevAngleRef.current = smoothedAngle;
          setSteeringAngle(smoothedAngle);

          // Draw vector line connecting both hands
          ctx.strokeStyle = "rgba(0, 36, 107, 0.25)";
          ctx.lineWidth = 3;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(leftHandX, leftHandY);
          ctx.lineTo(rightHandX, rightHandY);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 4. Calculate Speed Throttle / Brake
        let currentSpeed = useStore.getState().speed;
        let activeGesture = "None";

        if (leftThumbPressed && rightThumbPressed) {
          currentSpeed = Math.max(0, currentSpeed - 12.0);
          activeGesture = "Brake (Override)";
        } else if (leftThumbPressed) {
          currentSpeed = Math.max(0, currentSpeed - 9.0);
          activeGesture = "Left Thumb (Brake)";
        } else if (rightThumbPressed) {
          currentSpeed = Math.min(220, currentSpeed + 6.0);
          activeGesture = "Right Thumb (Accelerator)";
        } else {
          currentSpeed = Math.max(0, currentSpeed - 1.5);
          activeGesture = "Cruising";
        }

        useStore.setState({ speed: currentSpeed, gesture: activeGesture });

        ctx.fillStyle = "#00246b";
        ctx.font = "bold 9px font-mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`BMW HAND DETECTED (${activeGesture})`, w / 2, h - 25);

      } else if (showSkeleton) {
        // Standby face overlay when hands are not detected
        const rawX = Math.sin(frameCount / 30) * 15;
        const centerX = isFlipped ? w / 2 - rawX : w / 2 + rawX;
        const centerY = h / 2 + Math.cos(frameCount / 25) * 8;

        ctx.strokeStyle = "rgba(0, 163, 224, 0.3)";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 55, 75, 0, 0, Math.PI * 2);
        ctx.stroke();

        const eyeL = { x: centerX - 18, y: centerY - 15 };
        const eyeR = { x: centerX + 18, y: centerY - 15 };
        const nose = { x: centerX, y: centerY + 5 };

        const points = [eyeL, eyeR, nose];
        points.forEach((pt, idx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = idx % 2 === 0 ? "#00a3e0" : "#e82b2b";
          ctx.fill();
        });
      }

      // Render system status
      ctx.fillStyle = "#00246b";
      ctx.font = "9px font-mono, monospace";
      ctx.textAlign = "left";
      ctx.fillText(mediaPipeLoaded ? "MEDIAPIPE ENGINE: ACTIVE" : "LOADING TRACKER MODULE...", 15, 20);
      ctx.fillText(handsDetected ? "SENSORS: LINK ACTIVE" : "SENSORS: STANDBY (HOLD HANDS UP)", 15, 32);

      ctx.textAlign = "right";
      ctx.fillText(`FPS: 60`, w - 15, 20);

      // Render detailed 21-joint skeletal hand model with glowing rings
      function drawSkeletonHand(landmarks: any[], isRight: boolean, isThumbPressed: boolean) {
        const joints = [
          [0, 1, 2, 3, 4],       // Thumb
          [0, 5, 6, 7, 8],       // Index
          [9, 10, 11, 12],       // Middle
          [13, 14, 15, 16],      // Ring
          [0, 17, 18, 19, 20],   // Pinky
          [5, 9, 13, 17]         // Palm base connections
        ];

        const handColor = isRight ? "#e82b2b" : "#00a3e0"; 
        const glowColor = isRight ? "rgba(232, 43, 43, 0.4)" : "rgba(0, 163, 224, 0.4)";

        const hx = isFlipped ? (1 - landmarks[9].x) * w : landmarks[9].x * w;
        const hy = landmarks[9].y * h;

        ctx.strokeStyle = isRight ? "rgba(232, 43, 43, 0.6)" : "rgba(0, 163, 224, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(hx, hy, 24, frameCount * (isRight ? -0.02 : 0.02), frameCount * (isRight ? -0.02 : 0.02) + Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2.5;

        joints.forEach((jointList) => {
          ctx.beginPath();
          for (let i = 0; i < jointList.length; i++) {
            const pt = landmarks[jointList[i]];
            const px = isFlipped ? (1 - pt.x) * w : pt.x * w;
            const py = pt.y * h;
            if (i === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.stroke();
        });

        landmarks.forEach((landmark, idx) => {
          const px = isFlipped ? (1 - landmark.x) * w : landmark.x * w;
          const py = landmark.y * h;

          ctx.beginPath();
          ctx.arc(px, py, idx === 4 || idx === 8 ? 4.5 : 3, 0, Math.PI * 2);
          
          if (idx === 4 && isThumbPressed) {
            ctx.fillStyle = "#e82b2b";
          } else {
            ctx.fillStyle = idx === 4 || idx === 8 ? handColor : "#ffffff";
          }
          ctx.fill();

          ctx.strokeStyle = handColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, idx === 4 || idx === 8 ? 4.5 : 3, 0, Math.PI * 2);
          ctx.stroke();
        });

        // 3D Scale-Invariant fold ratio calculation for display
        const dx9 = landmarks[0].x - landmarks[9].x;
        const dy9 = landmarks[0].y - landmarks[9].y;
        const dz9 = (landmarks[0].z || 0) - (landmarks[9].z || 0);
        const handSize = Math.sqrt(dx9 * dx9 + dy9 * dy9 + dz9 * dz9);

        const dx5 = landmarks[4].x - landmarks[5].x;
        const dy5 = landmarks[4].y - landmarks[5].y;
        const dz5 = (landmarks[4].z || 0) - (landmarks[5].z || 0);
        const thumbDist = Math.sqrt(dx5 * dx5 + dy5 * dy5 + dz5 * dz5);

        const ratio = thumbDist / (handSize || 1);

        // Draw live ratio floating badge near the thumb tip (landmark 4)
        const tx = isFlipped ? (1 - landmarks[4].x) * w : landmarks[4].x * w;
        const ty = landmarks[4].y * h;

        ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
        ctx.fillRect(tx - 32, ty - 22, 64, 11);

        ctx.strokeStyle = handColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(tx - 32, ty - 22, 64, 11);

        ctx.fillStyle = ratio < 0.65 ? (isRight ? "#ff4d4d" : "#33b5e5") : "#ffffff";
        ctx.font = "bold 7px font-mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`FOLD: ${ratio.toFixed(2)}`, tx, ty - 14);

        ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
        ctx.fillRect(hx - 32, hy + 30, 64, 12);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7px font-mono, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`${isRight ? "R" : "L"}_DET: ${Math.round(hx)},${Math.round(hy)}`, hx, hy + 38);
      }

      animationId = requestAnimationFrame(renderOverlay);
    };

    renderOverlay();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isTracking, isFlipped, showSkeleton, mediaPipeLoaded]);

  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
      {/* Feed Panel Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              MediaPipe Skeletal Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Press thumb down: Left Hand = Brake • Right Hand = Accelerate
            </p>
          </div>
        </div>

        {/* Dropdowns & Visibility controls */}
        {isTracking && (
          <div className="flex items-center gap-2.5">
            {/* Expanded view toggle */}
            {onToggleExpand && (
              <button
                onClick={onToggleExpand}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                title={isExpanded ? "Collapse View" : "Expand View for Hands"}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Flip Feed control */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isFlipped
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
              }`}
              title="Mirror Camera Output"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Skeleton visual check */}
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                showSkeleton
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
              }`}
              title="Toggle Landmarks Overlay"
            >
              {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      <div className={`relative rounded-xl bg-slate-900 border border-slate-100 overflow-hidden flex items-center justify-center transition-all duration-300 ${
        isExpanded ? "h-[480px]" : "aspect-video"
      }`}>
        {/* Hidden video element used to capture camera stream for MediaPipe */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen ${
            isFlipped ? "scale-x-[-1]" : ""
          } ${hasWebcam && isTracking ? "block" : "hidden"}`}
        />

        {(!hasWebcam || !isTracking) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 z-0 bg-slate-100">
            {hasWebcam === false && isTracking ? (
              <>
                <CameraOff className="w-12 h-12 text-red-500/50" />
                <span className="text-xs text-red-600 font-bold font-mono">
                  CAMERA ACCESS ERROR
                </span>
                <span className="text-[10px] text-slate-400 px-8 text-center leading-normal">
                  Grant permission to access your webcam or check device connections.
                </span>
              </>
            ) : (
              <>
                <Camera className="w-12 h-12 text-slate-300 animate-pulse" />
                <span className="text-xs text-slate-400 font-bold tracking-wider font-mono">
                  {mediaPipeLoaded ? "CAMERA FEED OFF" : "LOADING TRACKER MODULE..."}
                </span>
              </>
            )}
          </div>
        )}

        {/* Overlay mesh */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none"
        />
      </div>
    </div>
  );
}
