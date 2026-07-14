#ifndef GESTUREENGINE_H
#define GESTUREENGINE_H

#include "HandTracker.h"
#include <string>

enum class Gesture {
    NONE = 0,
    OPEN_PALM = 1,    // Pause
    CLOSED_FIST = 2,  // Brake
    THUMBS_UP = 3,    // Nitro
    THUMBS_DOWN = 4,  // Reverse
    PEACE = 5,        // Camera Change
    POINT_FINGER = 6  // Horn
};

class GestureEngine {
private:
    // Helper to evaluate if a finger is extended based on landmark heights
    bool isFingerExtended(const HandData& hand, int tipIdx, int pipIdx) const;

public:
    GestureEngine();
    ~GestureEngine();

    Gesture recognizeGesture(const HandData& hand);
    static std::string gestureToString(Gesture g);
};

#endif // GESTUREENGINE_H
