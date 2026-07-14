import type { StateCreator } from "zustand";
import type { StoreState, TelemetryPoint } from "./types";

export interface AnalyticsSlice {
  history: TelemetryPoint[];
  addTelemetryPoint: (point: TelemetryPoint) => void;
  clearHistory: () => void;
}

export const createAnalyticsSlice: StateCreator<StoreState, [], [], AnalyticsSlice> = (set) => ({
  history: Array.from({ length: 30 }, (_, i) => {
    const time = new Date(Date.now() - (30 - i) * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return {
      time,
      angle: 0,
      speed: 0,
      latency: 15,
      confidence: 95,
    };
  }),
  addTelemetryPoint: (point) =>
    set((state) => {
      const newHistory = [...state.history.slice(1), point];
      return { history: newHistory };
    }),
  clearHistory: () => set({ history: [] }),
});
