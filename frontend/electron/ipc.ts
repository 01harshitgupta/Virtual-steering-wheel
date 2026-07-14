import { ipcMain } from "electron";

interface BackendStatus {
  running: boolean;
  pid?: number;
  error?: string;
}

export function registerIpcHandlers(handlers: {
  ping: () => string;
  getStatus: () => BackendStatus;
  restart: () => void;
}) {
  // Clear any existing handlers to prevent duplicates during hot reloads
  ipcMain.removeHandler("drivesense:ping");
  ipcMain.removeHandler("drivesense:get-backend-status");
  ipcMain.removeHandler("drivesense:restart-backend");

  ipcMain.handle("drivesense:ping", () => {
    return handlers.ping();
  });

  ipcMain.handle("drivesense:get-backend-status", () => {
    return handlers.getStatus();
  });

  ipcMain.handle("drivesense:restart-backend", async () => {
    try {
      handlers.restart();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}