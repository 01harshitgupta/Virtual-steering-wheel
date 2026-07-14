#include "Config.h"
#include "Camera.h"
#include "HandTracker.h"
#include "SteeringEngine.h"
#include "GestureEngine.h"
#include "InputController.h"
#include "WebSocketServer.h"

#include <iostream>
#include <chrono>
#include <thread>
#include <atomic>

std::atomic<bool> keepRunning(true);

int main() {
    std::cout << "=========================================" << std::endl;
    std::cout << "        DRIVESENSE AI C++ ENGINE        " << std::endl;
    std::cout << "=========================================" << std::endl;

    // Initialize modules
    Config config;
    config.loadFromFile("config.txt"); // Searches in local execution directory

    Camera camera;
    HandTracker tracker;
    SteeringEngine steering;
    GestureEngine gestures;
    InputController input;
    WebSocketServer wsServer;

    // Connect hardware devices
    if (!camera.open(config.cameraIndex)) {
        std::cerr << "[Core Error] Failed to open default webcam device index. Check camera connections." << std::endl;
        return -1;
    }

    if (!tracker.init()) {
        std::cerr << "[Core Error] Failed to compile tracking pipelines." << std::endl;
        return -1;
    }

    if (!input.init()) {
        std::cerr << "[Core Error] Failed to register virtual driver input interfaces." << std::endl;
        return -1;
    }

    if (!wsServer.init(config.wsPort)) {
        std::cerr << "[Core Error] Failed to boot network server interfaces." << std::endl;
        return -1;
    }

    // Launch WebSocket server thread
    wsServer.start();

    std::cout << "[Core] Pipeline active. Press ESC in the diagnostics window to stop." << std::endl;

    cv::Mat frame;
    std::vector<HandData> hands;
    double currentSpeed = 0.0;

    // Main telemetry pipeline loop
    while (keepRunning) {
        auto startTime = std::chrono::steady_clock::now();

        // 1. Process Video frame capture
        if (!camera.readFrame(frame)) {
            std::this_thread::sleep_for(std::chrono::milliseconds(5));
            continue;
        }

        // Mirror camera frame for visual ease
        cv::flip(frame, frame, 1);

        // 2. Perform skin-mesh hand detections
        hands.clear();
        tracker.detectHands(frame, hands);

        // 3. Compute steering parameters
        double angle = steering.calculateAngle(hands, config.deadzone, config.sensitivity);
        input.sendSteeringInput(angle);

        // 4. Identify finger gestures and dispatch SendInput commands
        Gesture currentGesture = Gesture::NONE;
        if (!hands.empty()) {
            // Recognize gesture of the dominant hand (first detected)
            currentGesture = gestures.recognizeGesture(hands[0]);
            input.triggerGestureAction(currentGesture);
        } else {
            input.triggerGestureAction(Gesture::NONE);
        }

        // Pulsing speed simulation based on steering locks
        if (hands.size() >= 2) {
            if (currentGesture == Gesture::CLOSED_FIST) {
                currentSpeed = std::max(0.0, currentSpeed - 4.5); // Brake decelerate
            } else {
                double speedCap = 140.0 - std::abs(angle) * 0.8;
                if (currentSpeed < speedCap) {
                    currentSpeed += (currentGesture == Gesture::THUMBS_UP ? 3.0 : 1.2); // Nitro acceleration
                } else {
                    currentSpeed -= 0.8;
                }
            }
        } else {
            currentSpeed = std::max(0.0, currentSpeed - 2.5); // slow down to a halt
        }

        // Draw HUD overlay on diagnostics preview
        tracker.drawSkeleton(frame, hands);
        
        // Draw steering wheel angle guideline
        cv::Point center(frame.cols / 2, frame.rows - 50);
        int radius = 40;
        double radAngle = -angle * M_PI / 180.0;
        cv::Point direction(
            center.x + static_cast<int>(radius * std::sin(radAngle)),
            center.y - static_cast<int>(radius * std::cos(radAngle))
        );
        cv::circle(frame, center, radius, cv::Scalar(100, 100, 100), 2);
        cv::line(frame, center, direction, cv::Scalar(0, 255, 255), 3);

        // Render diagnostics screen
        cv::imshow("DriveSense AI - Diagnostics Feed", frame);

        // ESC key exits program
        int key = cv::waitKey(1);
        if (key == 27) {
            keepRunning = false;
        }

        // Calculate latency of loop cycle
        auto endTime = std::chrono::steady_clock::now();
        int latency = static_cast<int>(std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count());

        // 5. Broadcast frame data to React frontend client
        double confidenceVal = hands.empty() ? 0.0 : hands[0].confidence * 100.0;
        std::string gestureString = GestureEngine::gestureToString(currentGesture);
        
        wsServer.broadcastTelemetry(angle, currentSpeed, confidenceVal, latency, gestureString);

        // FPS throttler (aim for ~30-60 FPS logic loops)
        std::this_thread::sleep_for(std::chrono::milliseconds(15));
    }

    // Graceful release
    wsServer.stop();
    camera.close();
    input.releaseAll();
    cv::destroyAllWindows();

    std::cout << "[Core] DriveSense AI Engine successfully shut down." << std::endl;
    return 0;
}
