#include "Camera.h"
#include <iostream>

Camera::Camera() : width(640), height(480), fps(0), frameCount(0) {
    lastFrameTime = std::chrono::steady_clock::now();
}

Camera::~Camera() {
    close();
}

bool Camera::open(int deviceIndex) {
    cap.open(deviceIndex, cv::CAP_ANY);
    if (!cap.isOpened()) {
        std::cerr << "[Camera Error] Failed to open device index " << deviceIndex << std::endl;
        return false;
    }
    
    // Set defaults
    cap.set(cv::CAP_PROP_FRAME_WIDTH, width);
    cap.set(cv::CAP_PROP_FRAME_HEIGHT, height);
    
    std::cout << "[Camera] Successfully initialized camera capture index " << deviceIndex << std::endl;
    return true;
}

bool Camera::setResolution(int w, int h) {
    if (!cap.isOpened()) return false;
    
    cap.set(cv::CAP_PROP_FRAME_WIDTH, w);
    cap.set(cv::CAP_PROP_FRAME_HEIGHT, h);
    width = w;
    height = h;
    return true;
}

bool Camera::readFrame(cv::Mat& frame) {
    if (!cap.isOpened()) return false;
    
    cap >> frame;
    if (frame.empty()) return false;

    // Calculate FPS dynamically
    frameCount++;
    auto now = std::chrono::steady_clock::now();
    auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(now - lastFrameTime).count();
    if (elapsed >= 1) {
        fps = frameCount;
        frameCount = 0;
        lastFrameTime = now;
    }

    return true;
}

void Camera::close() {
    if (cap.isOpened()) {
        cap.release();
        std::cout << "[Camera] Video stream closed successfully." << std::endl;
    }
}
