https://01harshitgupta.github.io/Virtual-steering-wheel/
# DriveSense AI 🏎️🤖

DriveSense AI is a production-grade, AI-powered virtual steering wheel desktop application that allows users to control racing games (or other software) using webcam-based hand tracking. 

It tracks both hands using OpenCV and MediaPipe structure layers, solves rotation angles between wrist locations, registers hand pose gestures to generate virtual controller events via Windows SendInput, and relays real-time telemetry datasets over WebSockets to a React + Electron client dashboard.

---

## 🛠️ Tech Stack & Architecture

### Frontend (Electron Client)
* **Vite + React 19**
* **TypeScript**
* **TailwindCSS + Framer Motion** (Cyberpunk design system, responsive grids, and animations)
* **Zustand** (Global client telemetry and configs store)
* **React Three Fiber (Three.js)** (Real-time rotating 3D steering wheel visualizer)

### Backend (C++ Core Engine)
* **C++20** (Multi-threaded loop logic)
* **OpenCV** (Video frame capture, HSV skin contour filters, and centroid locator fallbacks)
* **Windows SendInput API** (Native keyboard and gamepad injection triggers)
* **CMake** (Universal cross-platform compiler toolchain configuration)
* **WebSocket Server** (Asynchronous TCP server broadcasting JSON telemetry)

---

## 📦 Project Directory Structure

```
DriveSense-AI/
├── backend/                  # C++ Core Telemetry Engine
│   ├── include/              # Header Files
│   │   ├── Camera.h          # OpenCV video wrappers
│   │   ├── Config.h          # XML/TXT properties loader
│   │   ├── HandTracker.h     # Landmark coordinate vectors
│   │   ├── SteeringEngine.h  # Trigonometric slope calculations
│   │   ├── GestureEngine.h   # Pose classification indices
│   │   ├── InputController.h # SendInput virtual keyboards
│   │   └── WebSocketServer.h # Custom TCP socket handshake
│   ├── src/                  # C++ Source Files
│   │   ├── Camera.cpp
│   │   ├── Config.cpp
│   │   ├── HandTracker.cpp
│   │   ├── SteeringEngine.cpp
│   │   ├── GestureEngine.cpp
│   │   ├── InputController.cpp
│   │   ├── WebSocketServer.cpp
│   │   └── main.cpp
│   └── CMakeLists.txt        # Build instructions linking OpenCV & Threads
│
├── frontend/                 # React + Electron Client Dashboard
│   ├── electron/             # Main, Preload & IPC listeners
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   └── ipc.ts
│   ├── src/                  # Component Views & Store
│   │   ├── components/       # Stats, feeds, 3D canvases
│   │   ├── pages/            # Dashboard, Calibrate, Analytics, Settings
│   │   ├── layouts/          # Main navigation viewport frames
│   │   ├── services/         # Socket client listeners
│   │   ├── store/            # Zustand global telemetry configs
│   │   └── App.tsx
│   ├── package.json
│   └── electron-builder.yml  # Packaging configuration
```

---

## 🚀 Installation & Running

### 1. Compile C++ Backend Engine
The C++ backend requires **OpenCV** installed on your operating system.
Make sure you compile it using CMake:
```bash
cd backend
mkdir build
cd build
cmake ..
cmake --build . --config Release
```
This generates the C++ executable in the `backend/build/bin/` folder.

### 2. Run React + Electron Client
Ensure you have Node.js installed, then execute:
```bash
cd frontend
npm install
npm run dev
```

### 3. Packaging & Distribution
To bundle the Electron application and backend executable into an installer:
```bash
cd frontend
npm run package
```
This creates installer executables inside the `frontend/dist-build/` folder.

---

## ⚙️ How Telemetry Controls Work

* **Steering:** Place both hands in front of the camera. The system calculates the slope of the line connecting your wrists:
  * **Turn Left:** Tilt hands left (sends `A` keypress).
  * **Turn Right:** Tilt hands right (sends `D` keypress).
* **Speed Accel / Brake:** 
  * **Brake:** Close both fists (sends `Spacebar` keypress).
  * **Nitro Boost:** Raise thumbs up (sends `N` keypress).
  * **Reverse Gear:** Tilt thumbs down (sends `S` keypress).
  * **Horn Alert:** Point single finger (sends `H` keypress).
