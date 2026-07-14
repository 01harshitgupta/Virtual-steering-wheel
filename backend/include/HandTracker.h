#ifndef HANDTRACKER_H
#define HANDTRACKER_H

#include <opencv2/opencv.hpp>
#include <vector>

struct Point3D {
    float x;
    float y;
    float z;
};

struct HandData {
    bool isLeft;
    float confidence;
    std::vector<Point3D> landmarks; // 21 standard MediaPipe landmarks
};

class HandTracker {
private:
    float trackingConfidence;

public:
    HandTracker();
    ~HandTracker();

    bool init();
    bool detectHands(const cv::Mat& frame, std::vector<HandData>& hands);
    void drawSkeleton(cv::Mat& frame, const std::vector<HandData>& hands);
};

#endif // HANDTRACKER_H
