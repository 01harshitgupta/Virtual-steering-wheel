import type { StateCreator } from "zustand";
import type { StoreState } from "./types";

export interface SteeringSlice {
  steeringAngle: number;
  yaw: number;
  pitch: number;
  roll: number;
  setSteeringAngle: (angle: number) => void;
}

export const createSteeringSlice: StateCreator<StoreState, [], [], SteeringSlice> = (set) => ({
  steeringAngle: 0,
  yaw: 0,
  pitch: 0,
  roll: 0,
  setSteeringAngle: (angle) => set({ steeringAngle: angle }),
});
