export interface TelemetryPoint {
  time: string;
  angle: number;
  speed: number;
  latency: number;
  confidence: number;
}

export interface SystemSettings {
  wsUrl: string;
  webcamId: string;
  deadzone: number;
  sensitivity: number;
  autoCenter: boolean;
  gestureControlMode: "distance" | "height" | "keyboard";
  virtualOutputMode: "vjoy" | "wasd" | "arrows" | "mouse";
  trackingProfile: "face" | "hands";
  autoConnect: boolean;
  enableVibrations: boolean;
}

export interface StoreState {
  // Telemetry details
  steeringAngle: number;
  speed: number;
  latency: number;
  confidence: number;
  yaw: number;
  pitch: number;
  roll: number;
  gesture: string;

  // Connection & track state
  isConnected: boolean;
  isTracking: boolean;

  // Calibration state
  calibrationStep: number;
  centerOffset: number;
  leftBound: number;
  rightBound: number;

  // Global settings
  settings: SystemSettings;

  // Telemetry history lists
  history: TelemetryPoint[];

  // Core setters
  setSteeringAngle: (angle: number) => void;
  setSpeed: (speed: number) => void;
  setConnectionStatus: (connected: boolean) => void;
  setTrackingStatus: (tracking: boolean) => void;
  setCalibrationStep: (step: number) => void;
  setCalibrationBounds: (bounds: { center?: number; left?: number; right?: number }) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addTelemetryPoint: (point: TelemetryPoint) => void;
  clearHistory: () => void;
  toggleTracking: () => void;
  setGesture: (gesture: string) => void;
}
