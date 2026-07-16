import { BrowserWindow as e, app as t, ipcMain as n } from "electron";
import r from "node:path";
import i from "node:fs";
import { spawn as a } from "node:child_process";
import o from "node:os";
import { fileURLToPath as s } from "node:url";
//#region electron/ipc.ts
function c(e) {
	n.removeHandler("drivesense:ping"), n.removeHandler("drivesense:get-backend-status"), n.removeHandler("drivesense:restart-backend"), n.handle("drivesense:ping", () => e.ping()), n.handle("drivesense:get-backend-status", () => e.getStatus()), n.handle("drivesense:restart-backend", async () => {
		try {
			return e.restart(), { success: !0 };
		} catch (e) {
			return {
				success: !1,
				error: e.message
			};
		}
	});
}
//#endregion
//#region electron/main.ts
var l = s(import.meta.url), u = r.dirname(l);
function d() {
	let e = o.cpus(), t = 0, n = 0, r = 0, i = 0, a = 0;
	for (let o of e) t += o.times.user, n += o.times.nice, r += o.times.sys, i += o.times.idle, a += o.times.irq;
	let s = t + n + r + i + a;
	return {
		idle: i,
		total: s
	};
}
d();
var f = r.join(t.getPath("userData"), "electron_debug.log");
try {
	i.writeFileSync(f, "=== DRIVE SENSE LOG ===\r\n");
} catch {}
function p(e) {
	console.log(e);
	try {
		i.appendFileSync(f, `[LOG] ${e}\r\n`);
	} catch {}
}
function m(e) {
	console.error(e);
	try {
		i.appendFileSync(f, `[ERR] ${e}\r\n`);
	} catch {}
}
var h = null, g = null, _ = null;
function v() {
	if (!_) try {
		p("[KeyboardHook] Spawning persistent PowerShell key injector..."), _ = a("powershell", [
			"-NoExit",
			"-Command",
			"-"
		], { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] }), _.stdout?.on("data", (e) => {
			p(`[PowerShell Stdout]: ${e.toString().trim()}`);
		}), _.stderr?.on("data", (e) => {
			m(`[PowerShell Stderr Error]: ${e.toString().trim()}`);
		}), _.stdin?.write("\nAdd-Type -TypeDefinition '\nusing System;\nusing System.Runtime.InteropServices;\npublic class KeyboardHelper {\n    [DllImport(\"user32.dll\")]\n    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);\n    public static void Dn(byte vk) { keybd_event(vk, 0, 0, 0); }\n    public static void Up(byte vk) { keybd_event(vk, 0, 2, 0); }\n}';\n\r\n");
	} catch (e) {
		m("[KeyboardHook] Failed to start PowerShell injector: " + e);
	}
}
function y(e, t) {
	if (_ || v(), _) try {
		p(`[KeyboardHook] Injecting key action: ${e} for VK: ${t}`), _.stdin?.write(`[KeyboardHelper]::${e}(${t})\r\n`);
	} catch (e) {
		m("[KeyboardHook] Failed to write key event: " + e);
	}
}
function b() {
	if (g) return;
	let e = "";
	if (t.isPackaged) {
		let t = r.join(process.resourcesPath, "bin/DriveSenseBackend.exe");
		i.existsSync(t) && (e = t);
	} else {
		let t = [
			r.join(u, "../../backend/build/Debug/DriveSenseBackend.exe"),
			r.join(u, "../../backend/build/Release/DriveSenseBackend.exe"),
			r.join(u, "../../backend/build/DriveSenseBackend.exe"),
			r.join(u, "../../backend/build/bin/Debug/DriveSenseBackend.exe"),
			r.join(u, "../../backend/build/bin/Release/DriveSenseBackend.exe"),
			r.join(u, "../../backend/build/bin/DriveSenseBackend.exe")
		];
		for (let n of t) if (i.existsSync(n)) {
			e = n;
			break;
		}
	}
	if (!e) {
		m("[Launcher] DriveSense C++ Backend binary not found. Running in UI-only Standby mode.");
		return;
	}
	p(`[Launcher] Spawning C++ Backend process at: ${e}`);
	try {
		g = a(e, [], {
			cwd: r.dirname(e),
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			]
		}), g.stdout?.on("data", (e) => {
			p(`[C++ Backend]: ${e.toString().trim()}`);
		}), g.stderr?.on("data", (e) => {
			m(`[C++ Backend Error]: ${e.toString().trim()}`);
		}), g.on("close", (e) => {
			p(`[Launcher] C++ Backend exited with code: ${e}`), g = null;
		}), g.on("error", (e) => {
			m("[Launcher] Failed to start C++ Backend process: " + e), g = null;
		});
	} catch (e) {
		m("[Launcher] Critical exception spawning C++ Backend: " + e);
	}
}
function x() {
	if (g) {
		console.log("[Launcher] Terminating C++ Backend subprocess...");
		try {
			g.kill("SIGTERM");
			let e = g;
			setTimeout(() => {
				try {
					e.kill("SIGKILL");
				} catch {}
			}, 1500);
		} catch (e) {
			console.error("[Launcher] Error killing C++ Backend subprocess:", e);
		}
		g = null;
	}
}
function S() {
	h = new e({
		width: 1600,
		height: 900,
		minWidth: 1200,
		minHeight: 700,
		backgroundColor: "#020617",
		title: "DriveSense AI",
		webPreferences: {
			preload: i.existsSync(r.join(u, "preload.mjs")) ? r.join(u, "preload.mjs") : r.join(u, "preload.js"),
			contextIsolation: !0,
			nodeIntegration: !1,
			backgroundThrottling: !1
		}
	}), t.isPackaged ? h.loadFile(r.join(u, "../dist/index.html")) : (h.loadURL(process.env.VITE_DEV_SERVER_URL || "http://localhost:5173"), h.webContents.openDevTools()), h.on("closed", () => {
		h = null;
	});
}
t.whenReady().then(() => {
	b(), v(), c({
		ping: () => "pong",
		getStatus: () => ({
			running: g !== null,
			pid: g?.pid
		}),
		restart: () => {
			console.log("[IPC] Manual restart triggered via frontend..."), x(), b();
		}
	}), n.on("drivesense:send-key", (e, t, n) => {
		y(t, n);
	}), n.on("drivesense:log", (e, t, ...n) => {
		let r = n.map((e) => typeof e == "object" ? JSON.stringify(e) : String(e)).join(" ");
		t === "error" ? m(`[RENDERER] ${r}`) : p(`[RENDERER] ${r}`);
	}), n.handle("drivesense:get-stats", () => {
		try {
			let e = t.getAppMetrics(), n = 0, r = 0;
			e.forEach((e) => {
				n += e.memory.workingSetSize || 0, r += e.cpu.percentCPU || 0;
			});
			let i = Math.round(n / 1024);
			return {
				cpu: Math.min(100, Math.round(r)),
				ram: i || 110
			};
		} catch {
			return {
				cpu: 1,
				ram: 120
			};
		}
	}), S();
}), t.on("window-all-closed", () => {
	process.platform !== "darwin" && t.quit();
}), t.on("quit", () => {
	if (x(), _) {
		try {
			_.stdin?.write("exit\n"), _.kill();
		} catch {}
		_ = null;
	}
});
//#endregion
export {};
