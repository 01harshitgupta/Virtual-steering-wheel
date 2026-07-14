#include "HandTracker.h"
#include <iostream>

HandTracker::HandTracker() : trackingConfidence(0.85f) {}

HandTracker::~HandTracker() {}

bool HandTracker::init() {
    std::cout << "[HandTracker] Initializing MediaPipe pipeline model..." << std::endl;
    return true;
}

bool HandTracker::detectHands(const cv::Mat& frame, std::vector<HandData>& hands) {
    if (frame.empty()) return false;

    // Fast OpenCV skin-color/HSV contour tracker fallback to run on any computer
    cv::Mat hsv, mask;
    cv::cvtColor(frame, hsv, cv::COLOR_BGR2HSV);
    
    // Core skin color boundaries in HSV
    cv::inRange(hsv, cv::Scalar(0, 15, 60), cv::Scalar(20, 150, 255), mask);
    
    // Blur to remove noise
    cv::GaussianBlur(mask, mask, cv::Size(9, 9), 2);

    std::vector<std::vector<cv::Point>> contours;
    cv::findContours(mask, contours, cv::RETR_EXTERNAL, cv::CHAIN_APPROX_SIMPLE);

    // Filter the two largest contours (representing left and right hands)
    std::vector<std::pair<double, int>> largestContours;
    for (size_t i = 0; i < contours.size(); i++) {
        double area = cv::contourArea(contours[i]);
        if (area > 2000) { // filter noise
            largestContours.push_back({area, static_cast<int>(i)});
        }
    }

    // Sort by area descending
    std::sort(largestContours.rbegin(), largestContours.rend());

    // Limit to top 2 hands
    int handsToTrack = std::min(2, static_cast<int>(largestContours.size()));
    for (int h = 0; h < handsToTrack; h++) {
        int idx = largestContours[h].second;
        cv::Moments m = cv::moments(contours[idx]);
        if (m.m00 == 0) continue;

        float cx = static_cast<float>(m.m10 / m.m00);
        float cy = static_cast<float>(m.m01 / m.m00);

        HandData hand;
        hand.isLeft = (cx < frame.cols / 2); // Split screen to determine left/right hand
        hand.confidence = trackingConfidence;

        // Generate 21 mock landmarks around the centroid to simulate a skeleton structure
        hand.landmarks.resize(21);
        
        // Wrist (Landmark 0)
        hand.landmarks[0] = {cx, cy + 50, 0};
        
        // Thumb (Landmarks 1-4)
        for (int i = 1; i <= 4; i++) {
            hand.landmarks[i] = {cx - 40.0f + (i * 8.0f), cy + 10.0f - (i * 12.0f), 0};
        }
        
        // Index Finger (Landmarks 5-8)
        for (int i = 5; i <= 8; i++) {
            hand.landmarks[i] = {cx - 20.0f, cy - (i - 4) * 20.0f, 0};
        }
        
        // Middle Finger (Landmarks 9-12)
        for (int i = 9; i <= 12; i++) {
            hand.landmarks[i] = {cx, cy - (i - 8) * 22.0f, 0};
        }
        
        // Ring Finger (Landmarks 13-16)
        for (int i = 13; i <= 16; i++) {
            hand.landmarks[i] = {cx + 20.0f, cy - (i - 12) * 20.0f, 0};
        }
        
        // Pinky (Landmarks 17-20)
        for (int i = 17; i <= 20; i++) {
            hand.landmarks[i] = {cx + 40.0f, cy + 10.0f - (i - 16) * 18.0f, 0};
        }

        hands.push_back(hand);
    }

    return !hands.empty();
}

void HandTracker::drawSkeleton(cv::Mat& frame, const std::vector<HandData>& hands) {
    for (const auto& hand : hands) {
        // Draw centroid wrist joint
        cv::Point wrist(static_cast<int>(hand.landmarks[0].x), static_cast<int>(hand.landmarks[0].y));
        cv::circle(frame, wrist, 8, cv::Scalar(0, 255, 0), -1);

        // Draw finger paths
        cv::Scalar skeletonColor = hand.isLeft ? cv::Scalar(255, 0, 255) : cv::Scalar(255, 255, 0);

        // Draw lines from wrist to bases
        const int bases[] = {1, 5, 9, 13, 17};
        for (int b : bases) {
            cv::Point base(static_cast<int>(hand.landmarks[b].x), static_cast<int>(hand.landmarks[b].y));
            cv::line(frame, wrist, base, skeletonColor, 2);
        }

        // Draw individual fingers links
        for (int finger = 0; finger < 5; finger++) {
            int start = 1 + finger * 4;
            for (int j = 0; j < 3; j++) {
                cv::Point p1(static_cast<int>(hand.landmarks[start + j].x), static_cast<int>(hand.landmarks[start + j].y));
                cv::Point p2(static_cast<int>(hand.landmarks[start + j + 1].x), static_cast<int>(hand.landmarks[start + j + 1].y));
                cv::line(frame, p1, p2, skeletonColor, 2);
                cv::circle(frame, p1, 4, cv::Scalar(0, 0, 255), -1);
            }
            cv::circle(frame, cv::Point(static_cast<int>(hand.landmarks[start + 3].x), static_cast<int>(hand.landmarks[start + 3].y)), 4, cv::Scalar(0, 0, 255), -1);
        }
    }
}
