import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreState } from "./types";
import { createSteeringSlice } from "./steeringSlice";
import { createSettingsSlice } from "./settingsSlice";
import { createAnalyticsSlice } from "./analyticsSlice";
import { createSystemSlice } from "./systemSlice";

export * from "./types";

export const useStore = create<StoreState>()(
  persist(
    (set, get, store) => ({
      ...createSteeringSlice(set, get, store),
      ...createSettingsSlice(set, get, store),
      ...createAnalyticsSlice(set, get, store),
      ...createSystemSlice(set, get, store),
    }),
    {
      name: "drivesense-settings-storage",
      partialize: (state) => ({ settings: state.settings }), // Only persist configuration settings
    }
  )
);

// Separate modular store references for clean architecture interfaces
export const useCameraStore = useStore;
export const useSteeringStore = useStore;
export const useSettingsStore = useStore;
export const useAnalyticsStore = useStore;
export const useSystemStore = useStore;
