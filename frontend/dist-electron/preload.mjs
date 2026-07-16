let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("DriveSense", {
	version: "1.0.0",
	ping: () => electron.ipcRenderer.invoke("drivesense:ping"),
	getBackendStatus: () => electron.ipcRenderer.invoke("drivesense:get-backend-status"),
	restartBackend: () => electron.ipcRenderer.invoke("drivesense:restart-backend"),
	sendKey: (action, vk) => electron.ipcRenderer.send("drivesense:send-key", action, vk),
	getSystemStats: () => electron.ipcRenderer.invoke("drivesense:get-stats"),
	log: (level, ...args) => electron.ipcRenderer.send("drivesense:log", level, ...args)
});
//#endregion
