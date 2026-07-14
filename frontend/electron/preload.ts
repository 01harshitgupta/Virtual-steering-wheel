import { contextBridge, ipcRenderer } from "electron";

// Safely expose native APIs to the React renderer context
contextBridge.exposeInMainWorld("DriveSense", {
  version: "1.0.0",
  ping: () => ipcRenderer.invoke("drivesense:ping"),
  getBackendStatus: () => ipcRenderer.invoke("drivesense:get-backend-status"),
  restartBackend: () => ipcRenderer.invoke("drivesense:restart-backend"),
  sendKey: (action: "Dn" | "Up", vk: number) => ipcRenderer.send("drivesense:send-key", action, vk),
  getSystemStats: () => ipcRenderer.invoke("drivesense:get-stats"),
  log: (level: "log" | "warn" | "error", ...args: any[]) => ipcRenderer.send("drivesense:log", level, ...args),
});