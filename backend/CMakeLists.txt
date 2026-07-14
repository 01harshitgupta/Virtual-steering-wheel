cmake_minimum_required(VERSION 3.20)
project(DriveSenseBackend VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Configure output directories
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# Find OpenCV
find_package(OpenCV REQUIRED)

# Configure threads
find_package(Threads REQUIRED)

# Include directories
include_directories(
    include
    ${OpenCV_INCLUDE_DIRS}
)

# Source files
file(GLOB SOURCES 
    "src/*.cpp"
)

# Executable target
add_executable(DriveSenseBackend ${SOURCES})

# Target linking
target_link_libraries(DriveSenseBackend
    PRIVATE
    ${OpenCV_LIBS}
    Threads::Threads
)

# Platform-specific configurations
if(WIN32)
    target_link_libraries(DriveSenseBackend PRIVATE User32.lib Ws2_32.lib) # Required for SendInput and Winsock APIs
endif()
