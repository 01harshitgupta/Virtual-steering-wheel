#include "InputController.h"
#include <iostream>

#ifdef _WIN32
#include <windows.h>
#endif

InputController::InputController() : initialized(false) {}

InputController::~InputController() {
    releaseAll();
}

bool InputController::init() {
#ifdef _WIN32
    initialized = true;
    std::cout << "[InputController] Windows SendInput API bridge successfully initialized." << std::endl;
    return true;
#else
    std::cout << "[InputController] Non-Windows platform detected. Running in simulator-only mode." << std::endl;
    return true;
#endif
}

void InputController::sendKey(unsigned short vKey, bool keyUp) {
#ifdef _WIN32
    if (!initialized) return;

    INPUT input = {0};
    input.type = INPUT_KEYBOARD;
    input.ki.wVk = vKey;
    input.ki.wScan = static_cast<WORD>(MapVirtualKey(vKey, 0)); // 0 is MAPVK_VK_TO_VSC
    
    DWORD flags = 0;
    if (keyUp) {
        flags |= KEYEVENTF_KEYUP;
    }
    // Extended key flags (arrow keys 0x25 to 0x28, and other navigation keys)
    if (vKey >= 0x21 && vKey <= 0x2F) {
        flags |= KEYEVENTF_EXTENDEDKEY;
    }
    input.ki.dwFlags = flags;

    SendInput(1, &input, sizeof(INPUT));
#endif
}

void InputController::sendSteeringInput(double angle) {
    if (std::abs(angle) < 10.0) {
        // Centered: release both keys
        sendKey(0x41, true); // Release A
        sendKey(0x44, true); // Release D
    } else if (angle < 0) {
        // Turning Left: press A, release D
        sendKey(0x41, false); // Press A
        sendKey(0x44, true);  // Release D
    } else {
        // Turning Right: press D, release A
        sendKey(0x44, false); // Press D
        sendKey(0x41, true);  // Release A
    }
}

void InputController::triggerGestureAction(Gesture gesture) {
    // Release previous keystrokes to prevent sticky keys
    switch (gesture) {
        case Gesture::CLOSED_FIST:
            sendKey(0x20, false); // Press Space (Brake)
            sendKey(0x4E, true);  // Release N
            sendKey(0x48, true);  // Release H
            sendKey(0x53, true);  // Release S
            break;
            
        case Gesture::THUMBS_UP:
            sendKey(0x4E, false); // Press N (Nitro)
            sendKey(0x20, true);  // Release Space
            sendKey(0x48, true);  // Release H
            sendKey(0x53, true);  // Release S
            break;

        case Gesture::THUMBS_DOWN:
            sendKey(0x53, false); // Press S (Reverse)
            sendKey(0x20, true);  // Release Space
            sendKey(0x4E, true);  // Release N
            sendKey(0x48, true);  // Release H
            break;

        case Gesture::POINT_FINGER:
            sendKey(0x48, false); // Press H (Horn)
            sendKey(0x20, true);  // Release Space
            sendKey(0x4E, true);  // Release N
            sendKey(0x53, true);  // Release S
            break;

        case Gesture::OPEN_PALM:
        case Gesture::NONE:
        default:
            // Release all secondary actions
            sendKey(0x20, true);  // Release Space
            sendKey(0x4E, true);  // Release N
            sendKey(0x48, true);  // Release H
            sendKey(0x53, true);  // Release S
            break;
    }
}

void InputController::releaseAll() {
    sendKey(0x41, true); // Release A
    sendKey(0x44, true); // Release D
    sendKey(0x57, true); // Release W
    sendKey(0x53, true); // Release S
    sendKey(0x20, true); // Release Space
    sendKey(0x4E, true); // Release N
    sendKey(0x48, true); // Release H
}
