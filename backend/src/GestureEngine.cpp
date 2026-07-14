#include "GestureEngine.h"
#include <cmath>
#include <iostream>

GestureEngine::GestureEngine() {}

GestureEngine::~GestureEngine() {}

// Helper to evaluate if finger tip Y is above joint Y (lower values mean higher in screen coords)
bool GestureEngine::isFingerExtended(const HandData& hand, int tipIdx, int pipIdx) const {
    if (hand.landmarks.size() <= std::max(tipIdx, pipIdx)) return false;
    return hand.landmarks[tipIdx].y < hand.landmarks[pipIdx].y;
}

Gesture GestureEngine::recognizeGesture(const HandData& hand) {
    if (hand.landmarks.size() < 21) return Gesture::NONE;

    // Check extensions
    bool thumb = false;
    // Thumb: evaluate X displacement relative to joint
    if (hand.isLeft) {
        thumb = hand.landmarks[4].x < hand.landmarks[2].x;
    } else {
        thumb = hand.landmarks[4].x > hand.landmarks[2].x;
    }
    
    bool index = isFingerExtended(hand, 8, 6);
    bool middle = isFingerExtended(hand, 12, 10);
    bool ring = isFingerExtended(hand, 16, 14);
    bool pinky = isFingerExtended(hand, 20, 18);

    // Classification Decision Tree
    if (index && middle && ring && pinky && thumb) {
        return Gesture::OPEN_PALM;
    }
    
    if (!index && !middle && !ring && !pinky && !thumb) {
        return Gesture::CLOSED_FIST;
    }

    if (thumb && !index && !middle && !ring && !pinky) {
        // Evaluate y-slope to determine thumbs up vs thumbs down
        if (hand.landmarks[4].y < hand.landmarks[0].y - 30) {
            return Gesture::THUMBS_UP;
        } else {
            return Gesture::THUMBS_DOWN;
        }
    }

    if (index && middle && !ring && !pinky) {
        return Gesture::PEACE;
    }

    if (index && !middle && !ring && !pinky) {
        return Gesture::POINT_FINGER;
    }

    return Gesture::NONE;
}

std::string GestureEngine::gestureToString(Gesture g) {
    switch (g) {
        case Gesture::OPEN_PALM: return "Open Palm (Pause)";
        case Gesture::CLOSED_FIST: return "Closed Fist (Brake)";
        case Gesture::THUMBS_UP: return "Thumbs Up (Nitro)";
        case Gesture::THUMBS_DOWN: return "Thumbs Down (Reverse)";
        case Gesture::PEACE: return "Peace (Camera)";
        case Gesture::POINT_FINGER: return "Point Finger (Horn)";
        default: return "None";
    }
}
