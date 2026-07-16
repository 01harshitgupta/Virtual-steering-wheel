#include "GamepadController.h"
#include <iostream>
#include <algorithm>

GamepadController::GamepadController() 
    : hViGEmDll(NULL), client(nullptr), target(nullptr), initialized(false), connected(false) {}

GamepadController::~GamepadController() {
    shutdown();
}

bool GamepadController::loadDll() {
    // Try to load ViGEmClient.dll from standard paths (System32, PATH, App directory)
    hViGEmDll = LoadLibraryW(L"ViGEmClient.dll");
    if (!hViGEmDll) {
        return false;
    }

    // Resolve all required exports
    vigem_alloc_fn = (PFN_VIGEM_ALLOC)GetProcAddress(hViGEmDll, "vigem_alloc");
    vigem_free_fn = (PFN_VIGEM_FREE)GetProcAddress(hViGEmDll, "vigem_free");
    vigem_connect_fn = (PFN_VIGEM_CONNECT)GetProcAddress(hViGEmDll, "vigem_connect");
    vigem_disconnect_fn = (PFN_VIGEM_DISCONNECT)GetProcAddress(hViGEmDll, "vigem_disconnect");
    vigem_target_x360_alloc_fn = (PFN_VIGEM_TARGET_X360_ALLOC)GetProcAddress(hViGEmDll, "vigem_target_x360_alloc");
    vigem_target_free_fn = (PFN_VIGEM_TARGET_FREE)GetProcAddress(hViGEmDll, "vigem_target_free");
    vigem_target_add_fn = (PFN_VIGEM_TARGET_ADD)GetProcAddress(hViGEmDll, "vigem_target_add");
    vigem_target_remove_fn = (PFN_VIGEM_TARGET_REMOVE)GetProcAddress(hViGEmDll, "vigem_target_remove");
    vigem_target_x360_update_fn = (PFN_VIGEM_TARGET_X360_UPDATE)GetProcAddress(hViGEmDll, "vigem_target_x360_update");

    if (!vigem_alloc_fn || !vigem_free_fn || !vigem_connect_fn || !vigem_disconnect_fn ||
        !vigem_target_x360_alloc_fn || !vigem_target_free_fn || !vigem_target_add_fn ||
        !vigem_target_remove_fn || !vigem_target_x360_update_fn) {
        
        std::cerr << "[ViGEm Error] Failed to resolve function pointers from ViGEmClient.dll" << std::endl;
        FreeLibrary(hViGEmDll);
        hViGEmDll = NULL;
        return false;
    }

    return true;
}

bool GamepadController::init() {
    std::lock_guard<std::mutex> lock(statusMutex);
    
    if (initialized) return connected;

    if (!loadDll()) {
        std::cout << "[ViGEm] ViGEmClient.dll not found in search paths. Gamepad Emulation mode disabled." << std::endl;
        return false;
    }

    client = vigem_alloc_fn();
    if (!client) {
        std::cerr << "[ViGEm Error] Failed to allocate client context structure." << std::endl;
        shutdown();
        return false;
    }

    int connErr = vigem_connect_fn(client);
    if (connErr < 0) { // Failed to connect to bus (driver probably not installed)
        std::cerr << "[ViGEm] Could not establish connection to ViGEmBus kernel driver. Error Code: " << connErr << std::endl;
        shutdown();
        return false;
    }

    target = vigem_target_x360_alloc_fn();
    if (!target) {
        std::cerr << "[ViGEm Error] Failed to allocate Xbox 360 virtual device context." << std::endl;
        shutdown();
        return false;
    }

    int addErr = vigem_target_add_fn(client, target);
    if (addErr < 0) {
        std::cerr << "[ViGEm Error] Failed to plugin Xbox 360 controller device to virtual bus." << std::endl;
        shutdown();
        return false;
    }

    initialized = true;
    connected = true;
    std::cout << "[ViGEm] Virtual Xbox 360 Gamepad successfully connected and initialized." << std::endl;
    return true;
}

void GamepadController::shutdown() {
    std::lock_guard<std::mutex> lock(statusMutex);

    if (client && target && connected) {
        vigem_target_remove_fn(client, target);
    }
    if (target) {
        vigem_target_free_fn(target);
        target = nullptr;
    }
    if (client) {
        if (connected) {
            vigem_disconnect_fn(client);
        }
        vigem_free_fn(client);
        client = nullptr;
    }
    if (hViGEmDll) {
        FreeLibrary(hViGEmDll);
        hViGEmDll = NULL;
    }
    
    initialized = false;
    connected = false;
}

bool GamepadController::isAvailable() const {
    std::lock_guard<std::mutex> lock(statusMutex);
    return initialized && connected;
}

void GamepadController::updateState(double steeringAngle, bool brake, bool accelerate, bool horn, bool nitro,
                                   int& outLeftStickX, int& outLeftTrigger, int& outRightTrigger, int& outButtons) {
    std::lock_guard<std::mutex> lock(statusMutex);
    
    if (!initialized || !connected) {
        outLeftStickX = 0;
        outLeftTrigger = 0;
        outRightTrigger = 0;
        outButtons = 0;
        return;
    }

    // Map steering angle (-180 to 180 degrees, but normally lock-to-lock is within -45 to 45)
    // Scale linear range [-45, 45] to short [-32768, 32767]
    double ratio = steeringAngle / 45.0;
    ratio = std::clamp(ratio, -1.0, 1.0);
    short stickX = static_cast<short>(ratio * 32767.0);

    unsigned char leftTriggerVal = brake ? 255 : 0;
    unsigned char rightTriggerVal = accelerate ? 255 : 0;
    
    unsigned short buttonFlags = 0;
    if (horn) buttonFlags |= 0x4000;   // Xbox 360 button X
    if (nitro) buttonFlags |= 0x1000;  // Xbox 360 button A

    XUSB_REPORT report = {0};
    report.sThumbLX = stickX;
    report.bLeftTrigger = leftTriggerVal;
    report.bRightTrigger = rightTriggerVal;
    report.wButtons = buttonFlags;

    vigem_target_x360_update_fn(client, target, report);

    // Save outputs for telemetry feedback
    outLeftStickX = stickX;
    outLeftTrigger = leftTriggerVal;
    outRightTrigger = rightTriggerVal;
    outButtons = buttonFlags;
}
