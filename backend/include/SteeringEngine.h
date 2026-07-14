#ifndef STEERINGENGINE_H
#define STEERINGENGINE_H

#include "HandTracker.h"
#include <vector>

class SteeringEngine {
private:
    double currentAngle;
    double smoothedAngle;
    double smoothingFactor; // Alpha parameter for Exponential Moving Average (EMA)
    double calibrationOffset;

public:
    SteeringEngine();
    ~SteeringEngine();

    double calculateAngle(const std::vector<HandData>& hands, double deadzone, double sensitivity);
    void resetCalibration();
    void setCalibrationOffset(double offset);

    double getSteeringAngle() const { return smoothedAngle; }
};

#endif // STEERINGENGINE_H
