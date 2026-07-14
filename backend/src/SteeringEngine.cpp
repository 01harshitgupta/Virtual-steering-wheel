#include "SteeringEngine.h"
#define _USE_MATH_DEFINES
#include <cmath>
#include <iostream>
#include <algorithm>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

SteeringEngine::SteeringEngine() 
    : currentAngle(0.0), smoothedAngle(0.0), smoothingFactor(0.25), calibrationOffset(0.0) {}

SteeringEngine::~SteeringEngine() {}

double SteeringEngine::calculateAngle(const std::vector<HandData>& hands, double deadzone, double sensitivity) {
    if (hands.size() < 2) {
        // Fallback: If only 1 hand is tracked, try to auto-center slowly (spring back to 0)
        currentAngle = 0.0;
        smoothedAngle = (1.0 - smoothingFactor) * smoothedAngle;
        return smoothedAngle;
    }

    // Find left and right hand data
    const HandData* leftHand = nullptr;
    const HandData* rightHand = nullptr;

    for (const auto& hand : hands) {
        if (hand.isLeft) {
            leftHand = &hand;
        } else {
            rightHand = &hand;
        }
    }

    // If both hands are successfully located
    if (leftHand && rightHand) {
        // Get wrists coordinates (landmark index 0)
        float lx = leftHand->landmarks[0].x;
        float ly = leftHand->landmarks[0].y;
        float rx = rightHand->landmarks[0].x;
        float ry = rightHand->landmarks[0].y;

        // Calculate slope vector delta
        double dx = rx - lx;
        double dy = ry - ly; // Positive is downwards in screen coordinates, so negate if needed

        if (dx != 0.0) {
            // Steering Angle calculated via arctangent of wrists slope
            double radAngle = std::atan2(dy, dx);
            double rawDeg = radAngle * 180.0 / M_PI;

            // Apply calibration baseline offset
            rawDeg -= calibrationOffset;

            // Limit boundary locks
            rawDeg = std::clamp(rawDeg, -180.0, 180.0);

            // Apply deadzone thresholds
            if (std::abs(rawDeg) < deadzone) {
                currentAngle = 0.0;
            } else {
                // Adjust by sensitivity multipliers
                currentAngle = rawDeg * sensitivity;
                currentAngle = std::clamp(currentAngle, -180.0, 180.0);
            }
        }
    } else {
        // If detection fails, slowly center
        currentAngle = 0.0;
    }

    // Apply smoothing filter (EMA)
    smoothedAngle = (smoothingFactor * currentAngle) + ((1.0 - smoothingFactor) * smoothedAngle);

    return smoothedAngle;
}

void SteeringEngine::resetCalibration() {
    calibrationOffset = 0.0;
}

void SteeringEngine::setCalibrationOffset(double offset) {
    calibrationOffset = offset;
    std::cout << "[SteeringEngine] Calibrated baseline offset set to: " << offset << "°" << std::endl;
}
