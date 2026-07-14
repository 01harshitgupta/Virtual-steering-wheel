import type { StateCreator } from "zustand";
import type { StoreState } from "./types";

export interface SystemSlice {
  speed: number;
  latency: number;
  confidence: number;
  gesture: string;
  isConnected: boolean;
  isTracking: boolean;
  calibrationStep: number;
  centerOffset: number;
  leftBound: number;
  rightBound: number;
  setSpeed: (speed: number) => void;
  setConnectionStatus: (connected: boolean) => void;
  setTrackingStatus: (tracking: boolean) => void;
  setCalibrationStep: (step: number) => void;
  setCalibrationBounds: (bounds: { center?: number; left?: number; right?: number }) => void;
  toggleTracking: () => void;
  setGesture: (gesture: string) => void;
}

export const createSystemSlice: StateCreator<StoreState, [], [], SystemSlice> = (set) => ({
  speed: 0,
  latency: 15,
  confidence: 98,
  gesture: "None",
  isConnected: false,
  isTracking: false,
  calibrationStep: 0,
  centerOffset: 0,
  leftBound: -45,
  rightBound: 45,
  setSpeed: (speed) => set({ speed }),
  setConnectionStatus: (isConnected) => set({ isConnected }),
  setTrackingStatus: (isTracking) => set({ isTracking }),
  setCalibrationStep: (calibrationStep) => set({ calibrationStep }),
  setCalibrationBounds: (bounds) =>
    set((state) => ({
      centerOffset: bounds.center !== undefined ? bounds.center : state.centerOffset,
      leftBound: bounds.left !== undefined ? bounds.left : state.leftBound,
      rightBound: bounds.right !== undefined ? bounds.right : state.rightBound,
    })),
  toggleTracking: () => set((state) => ({ isTracking: !state.isTracking })),
  setGesture: (gesture) => set({ gesture }),
});
