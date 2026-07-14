#include "Config.h"
#include <fstream>
#include <iostream>

Config::Config() 
    : wsPort(8000), cameraIndex(0), sensitivity(1.5), deadzone(5.0), autoCenter(true) {}

void Config::loadFromFile(const std::string& filepath) {
    std::ifstream file(filepath);
    if (!file.is_open()) {
        std::cout << "[Config] No config file found. Using default parameters." << std::endl;
        return;
    }
    
    std::string key;
    double val;
    while (file >> key >> val) {
        if (key == "wsPort") wsPort = static_cast<int>(val);
        else if (key == "cameraIndex") cameraIndex = static_cast<int>(val);
        else if (key == "sensitivity") sensitivity = val;
        else if (key == "deadzone") deadzone = val;
        else if (key == "autoCenter") autoCenter = static_cast<bool>(val);
    }
    std::cout << "[Config] Loaded configurations successfully from " << filepath << std::endl;
}

void Config::saveToFile(const std::string& filepath) const {
    std::ofstream file(filepath);
    if (!file.is_open()) {
        std::cerr << "[Config Error] Failed to write settings to " << filepath << std::endl;
        return;
    }
    file << "wsPort " << wsPort << "\n";
    file << "cameraIndex " << cameraIndex << "\n";
    file << "sensitivity " << sensitivity << "\n";
    file << "deadzone " << deadzone << "\n";
    file << "autoCenter " << (autoCenter ? 1 : 0) << "\n";
}
