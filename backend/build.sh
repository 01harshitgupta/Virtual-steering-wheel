#!/bin/bash
echo "=================================================="
echo "Building DriveSense AI C++ Backend"
echo "=================================================="

# Check for build folder
if [ ! -d "build" ]; then
    echo "Creating build directory..."
    mkdir build
fi

cd build
echo "Configuring project with CMake..."
cmake ..

if [ $? -ne 0 ]; then
    echo "[ERROR] CMake configuration failed."
    exit 1
fi

echo "Compiling C++ executable..."
cmake --build . --config Release

if [ $? -ne 0 ]; then
    echo "[ERROR] Compilation failed."
    exit 1
fi

echo "=================================================="
echo "Build Succeeded!"
echo "=================================================="
