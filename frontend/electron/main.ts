import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { spawn, ChildProcess } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { registerIpcHandlers } from "./ipc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CPU Usage dynamic statistics helpers
function getCpuTimes() {
  const cpus = os.cpus();
  let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
  for (const cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  return { idle, total };
}

let lastCpuInfo = getCpuTimes();

function calculateCpuPercentage() {
  const current = getCpuTimes();
  const idleDiff = current.idle - lastCpuInfo.idle;
  const totalDiff = current.total - lastCpuInfo.total;
  lastCpuInfo = current;

  if (totalDiff === 0) return 0;
  return Math.round((1 - idleDiff / totalDiff) * 100);
}

const logFile = path.join(app.getPath("userData"), "electron_debug.log");
try { fs.writeFileSync(logFile, "=== DRIVE SENSE LOG ===\r\n"); } catch (e) {}

function logDebug(msg: string) {
  console.log(msg);
  try { fs.appendFileSync(logFile, `[LOG] ${msg}\r\n`); } catch (e) {}
}

function logError(msg: string) {
  console.error(msg);
  try { fs.appendFileSync(logFile, `[ERR] ${msg}\r\n`); } catch (e) {}
}

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let powershellProcess: ChildProcess | null = null;

// Persistent PowerShell simulator for zero-dependency key injections
function initKeyboardHook() {
  if (powershellProcess) return;
  try {
    logDebug("[KeyboardHook] Spawning persistent PowerShell key injector...");
    powershellProcess = spawn("powershell", ["-NoExit", "-Command", "-"], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    powershellProcess.stdout?.on("data", (data) => {
      logDebug(`[PowerShell Stdout]: ${data.toString().trim()}`);
    });

    powershellProcess.stderr?.on("data", (data) => {
      logError(`[PowerShell Stderr Error]: ${data.toString().trim()}`);
    });
    
    // Using single-quoted script blocks to avoid quote escaping issues in PowerShell
    const initCode = `
Add-Type -TypeDefinition '
using System;
using System.Runtime.InteropServices;
public class KeyboardHelper {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);
    [DllImport("user32.dll")]
    public static extern uint MapVirtualKey(uint uCode, uint uMapType);

    public static void Dn(byte vk) {
        byte scan = (byte)MapVirtualKey(vk, 0);
        uint flags = 0;
        if (vk >= 33 && vk <= 46) {
            flags |= 1; // KEYEVENTF_EXTENDEDKEY
        }
        keybd_event(vk, scan, flags, 0);
    }
    public static void Up(byte vk) {
        byte scan = (byte)MapVirtualKey(vk, 0);
        uint flags = 2; // KEYEVENTF_KEYUP
        if (vk >= 33 && vk <= 46) {
            flags |= 1; // KEYEVENTF_EXTENDEDKEY
        }
        keybd_event(vk, scan, flags, 0);
    }
}';
`;
    powershellProcess.stdin?.write(initCode + "\r\n");
  } catch (err) {
    logError("[KeyboardHook] Failed to start PowerShell injector: " + err);
  }
}

function sendKeyAction(action: "Dn" | "Up", vk: number) {
  if (!powershellProcess) {
    initKeyboardHook();
  }
  if (!powershellProcess) return;
  try {
    logDebug(`[KeyboardHook] Injecting key action: ${action} for VK: ${vk}`);
    powershellProcess.stdin?.write(`[KeyboardHelper]::${action}(${vk})\r\n`);
  } catch (err) {
    logError("[KeyboardHook] Failed to write key event: " + err);
  }
}

// Find and launch the C++ backend executable
function startBackend() {
  if (backendProcess) return;

  let backendPath = "";

  if (!app.isPackaged) {
    // Development search paths
    const searchPaths = [
      path.join(__dirname, "../../backend/build/Debug/DriveSenseBackend.exe"),
      path.join(__dirname, "../../backend/build/Release/DriveSenseBackend.exe"),
      path.join(__dirname, "../../backend/build/DriveSenseBackend.exe"),
      path.join(__dirname, "../../backend/build/bin/Debug/DriveSenseBackend.exe"),
      path.join(__dirname, "../../backend/build/bin/Release/DriveSenseBackend.exe"),
      path.join(__dirname, "../../backend/build/bin/DriveSenseBackend.exe"),
    ];

    for (const p of searchPaths) {
      if (fs.existsSync(p)) {
        backendPath = p;
        break;
      }
    }
  } else {
    // Production path bundled as extraResource
    const prodPaths = [
      path.join(process.resourcesPath, "bin/DriveSenseBackend.exe"),
      path.join(process.resourcesPath, "bin/bin/DriveSenseBackend.exe"),
    ];
    for (const p of prodPaths) {
      if (fs.existsSync(p)) {
        backendPath = p;
        break;
      }
    }
  }

  if (!backendPath) {
    logError("[Launcher] DriveSense C++ Backend binary not found. Running in UI-only Standby mode.");
    return;
  }

  logDebug(`[Launcher] Spawning C++ Backend process at: ${backendPath}`);
  try {
    // Spawn backend binary
    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath),
      stdio: ["ignore", "pipe", "pipe"],
    });

    backendProcess.stdout?.on("data", (data) => {
      logDebug(`[C++ Backend]: ${data.toString().trim()}`);
    });

    backendProcess.stderr?.on("data", (data) => {
      logError(`[C++ Backend Error]: ${data.toString().trim()}`);
    });

    backendProcess.on("close", (code) => {
      logDebug(`[Launcher] C++ Backend exited with code: ${code}`);
      backendProcess = null;
    });

    backendProcess.on("error", (err) => {
      logError("[Launcher] Failed to start C++ Backend process: " + err);
      backendProcess = null;
    });
  } catch (err) {
    logError("[Launcher] Critical exception spawning C++ Backend: " + err);
  }
}

// Terminate the C++ backend process
function stopBackend() {
  if (!backendProcess) return;

  console.log("[Launcher] Terminating C++ Backend subprocess...");
  try {
    backendProcess.kill("SIGTERM");
    // Backup force kill after timeout if it hangs
    const processToKill = backendProcess;
    setTimeout(() => {
      try {
        processToKill.kill("SIGKILL");
      } catch {}
    }, 1500);
  } catch (err) {
    console.error("[Launcher] Error killing C++ Backend subprocess:", err);
  }
  backendProcess = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: "#020617",
    title: "DriveSense AI",
    webPreferences: {
      preload: fs.existsSync(path.join(__dirname, "preload.mjs"))
        ? path.join(__dirname, "preload.mjs")
        : path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false, // Prevents JS throttling when browser game is focused
    },
  });

  if (!app.isPackaged) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Lifecycle Hooks
app.whenReady().then(() => {
  // Launch backend executable
  startBackend();
  initKeyboardHook();

  // Register native bridges (IPC listeners)
  registerIpcHandlers({
    ping: () => "pong",
    getStatus: () => ({
      running: backendProcess !== null,
      pid: backendProcess?.pid,
    }),
    restart: () => {
      console.log("[IPC] Manual restart triggered via frontend...");
      stopBackend();
      startBackend();
    },
  });

  // Handle keypress requests from the frontend
  ipcMain.on("drivesense:send-key", (event, action: "Dn" | "Up", vk: number) => {
    sendKeyAction(action, vk);
  });

  // Handle logs from renderer
  ipcMain.on("drivesense:log", (event, level: "log" | "warn" | "error", ...args: any[]) => {
    const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
    if (level === "error") {
      logError(`[RENDERER] ${msg}`);
    } else {
      logDebug(`[RENDERER] ${msg}`);
    }
  });

  // Handle system stats queries from the frontend
  ipcMain.handle("drivesense:get-stats", () => {
    try {
      const metrics = app.getAppMetrics();
      let totalMemoryKB = 0;
      let totalCpuPercent = 0;

      metrics.forEach((m) => {
        totalMemoryKB += m.memory.workingSetSize || 0;
        totalCpuPercent += m.cpu.percentCPU || 0;
      });

      const totalMemoryMB = Math.round(totalMemoryKB / 1024);

      return {
        cpu: Math.min(100, Math.round(totalCpuPercent)),
        ram: totalMemoryMB || 110, // fallback to typical Electron baseline MB if 0
      };
    } catch {
      return {
        cpu: 1,
        ram: 120,
      };
    }
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("quit", () => {
  stopBackend();
  if (powershellProcess) {
    try {
      powershellProcess.stdin?.write("exit\n");
      powershellProcess.kill();
    } catch {}
    powershellProcess = null;
  }
});