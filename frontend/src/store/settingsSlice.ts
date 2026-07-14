import type { StateCreator } from "zustand";
import type { StoreState, SystemSettings } from "./types";

export interface SettingsSlice {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
}

export const createSettingsSlice: StateCreator<StoreState, [], [], SettingsSlice> = (set) => ({
  settings: {
    wsUrl: "ws://localhost:8000",
    webcamId: "default",
    deadzone: 5,
    sensitivity: 1.5,
    autoCenter: true,
    gestureControlMode: "distance",
    virtualOutputMode: "wasd",
    trackingProfile: "hands",
    autoConnect: true,
    enableVibrations: false,
  },
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
});
