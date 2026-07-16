import { BrowserWindow, app, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";
import os from "node:os";
import { fileURLToPath } from "node:url";
//#region electron/ipc.ts
function registerIpcHandlers(handlers) {
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
		} catch (err) {
			return {
				success: false,
				error: err.message
			};
		}
	});
}
//#endregion
//#region electron/main.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
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
	return {
		idle,
		total
	};
}
getCpuTimes();
var logFile = path.join(app.getPath("userData"), "electron_debug.log");
try {
	fs.writeFileSync(logFile, "=== DRIVE SENSE LOG ===\r\n");
} catch (e) {}
function logDebug(msg) {
	console.log(msg);
	try {
		fs.appendFileSync(logFile, `[LOG] ${msg}\r\n`);
	} catch (e) {}
}
function logError(msg) {
	console.error(msg);
	try {
		fs.appendFileSync(logFile, `[ERR] ${msg}\r\n`);
	} catch (e) {}
}
var mainWindow = null;
var backendProcess = null;
var powershellProcess = null;
function initKeyboardHook() {
	if (powershellProcess) return;
	try {
		logDebug("[KeyboardHook] Spawning persistent PowerShell key injector...");
		powershellProcess = spawn("powershell", [
			"-NoExit",
			"-Command",
			"-"
		], { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] });
		powershellProcess.stdout?.on("data", (data) => {
			logDebug(`[PowerShell Stdout]: ${data.toString().trim()}`);
		});
		powershellProcess.stderr?.on("data", (data) => {
			logError(`[PowerShell Stderr Error]: ${data.toString().trim()}`);
		});
		powershellProcess.stdin?.write("\nAdd-Type -TypeDefinition '\nusing System;\nusing System.Runtime.InteropServices;\npublic class KeyboardHelper {\n    [DllImport(\"user32.dll\")]\n    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);\n    public static void Dn(byte vk) { keybd_event(vk, 0, 0, 0); }\n    public static void Up(byte vk) { keybd_event(vk, 0, 2, 0); }\n}';\n\r\n");
	} catch (err) {
		logError("[KeyboardHook] Failed to start PowerShell injector: " + err);
	}
}
function sendKeyAction(action, vk) {
	if (!powershellProcess) initKeyboardHook();
	if (!powershellProcess) return;
	try {
		logDebug(`[KeyboardHook] Injecting key action: ${action} for VK: ${vk}`);
		powershellProcess.stdin?.write(`[KeyboardHelper]::${action}(${vk})\r\n`);
	} catch (err) {
		logError("[KeyboardHook] Failed to write key event: " + err);
	}
}
function startBackend() {
	if (backendProcess) return;
	let backendPath = "";
	if (!app.isPackaged) {
		const searchPaths = [
			path.join(__dirname, "../../backend/build/Debug/DriveSenseBackend.exe"),
			path.join(__dirname, "../../backend/build/Release/DriveSenseBackend.exe"),
			path.join(__dirname, "../../backend/build/DriveSenseBackend.exe"),
			path.join(__dirname, "../../backend/build/bin/Debug/DriveSenseBackend.exe"),
			path.join(__dirname, "../../backend/build/bin/Release/DriveSenseBackend.exe"),
			path.join(__dirname, "../../backend/build/bin/DriveSenseBackend.exe")
		];
		for (const p of searchPaths) if (fs.existsSync(p)) {
			backendPath = p;
			break;
		}
	} else {
		const prodPath = path.join(process.resourcesPath, "bin/DriveSenseBackend.exe");
		if (fs.existsSync(prodPath)) backendPath = prodPath;
	}
	if (!backendPath) {
		logError("[Launcher] DriveSense C++ Backend binary not found. Running in UI-only Standby mode.");
		return;
	}
	logDebug(`[Launcher] Spawning C++ Backend process at: ${backendPath}`);
	try {
		backendProcess = spawn(backendPath, [], {
			cwd: path.dirname(backendPath),
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
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
function stopBackend() {
	if (!backendProcess) return;
	console.log("[Launcher] Terminating C++ Backend subprocess...");
	try {
		backendProcess.kill("SIGTERM");
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
			preload: fs.existsSync(path.join(__dirname, "preload.mjs")) ? path.join(__dirname, "preload.mjs") : path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
			backgroundThrottling: false
		}
	});
	if (!app.isPackaged) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173");
		mainWindow.webContents.openDevTools();
	} else mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}
app.whenReady().then(() => {
	startBackend();
	initKeyboardHook();
	registerIpcHandlers({
		ping: () => "pong",
		getStatus: () => ({
			running: backendProcess !== null,
			pid: backendProcess?.pid
		}),
		restart: () => {
			console.log("[IPC] Manual restart triggered via frontend...");
			stopBackend();
			startBackend();
		}
	});
	ipcMain.on("drivesense:send-key", (event, action, vk) => {
		sendKeyAction(action, vk);
	});
	ipcMain.on("drivesense:log", (event, level, ...args) => {
		const msg = args.map((a) => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
		if (level === "error") logError(`[RENDERER] ${msg}`);
		else logDebug(`[RENDERER] ${msg}`);
	});
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
				ram: totalMemoryMB || 110
			};
		} catch {
			return {
				cpu: 1,
				ram: 120
			};
		}
	});
	createWindow();
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
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
//#endregion
export {};
