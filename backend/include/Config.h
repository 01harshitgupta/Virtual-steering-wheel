#ifndef CONFIG_H
#define CONFIG_H

#include <string>

class Config {
public:
    int wsPort;
    int cameraIndex;
    double sensitivity;
    double deadzone;
    bool autoCenter;

    Config();
    void loadFromFile(const std::string& filepath);
    void saveToFile(const std::string& filepath) const;
};

#endif // CONFIG_H
