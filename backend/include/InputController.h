#ifndef INPUTCONTROLLER_H
#define INPUTCONTROLLER_H

#include "GestureEngine.h"

class InputController {
private:
    bool initialized;

public:
    InputController();
    ~InputController();

    bool init();
    void sendKey(unsigned short vKey, bool keyUp);
    void sendSteeringInput(double angle);
    void triggerGestureAction(Gesture gesture);
    void releaseAll();
};

#endif // INPUTCONTROLLER_H
