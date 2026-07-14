#ifndef INPUTCONTROLLER_H
#define INPUTCONTROLLER_H

#include "GestureEngine.h"

class InputController {
private:
    bool initialized;

    // Helper to send Win32 key presses
    void sendKey(unsigned short vKey, bool keyUp);

public:
    InputController();
    ~InputController();

    bool init();
    void sendSteeringInput(double angle);
    void triggerGestureAction(Gesture gesture);
    void releaseAll();
};

#endif // INPUTCONTROLLER_H
