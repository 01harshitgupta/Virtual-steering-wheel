#ifndef CAMERA_H
#define CAMERA_H

#include <opencv2/opencv.hpp>
#include <chrono>

class Camera {
private:
    cv::VideoCapture cap;
    int width;
    int height;
    int fps;
    std::chrono::steady_clock::time_point lastFrameTime;
    int frameCount;

public:
    Camera();
    ~Camera();

    bool open(int deviceIndex);
    bool setResolution(int w, int h);
    bool readFrame(cv::Mat& frame);
    void close();

    int getWidth() const { return width; }
    int getHeight() const { return height; }
    int getFPS() const { return fps; }
};

#endif // CAMERA_H
