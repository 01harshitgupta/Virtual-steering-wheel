@echo off
echo ==================================================
echo Building DriveSense AI C++ Backend
echo ==================================================

:: Check for build folder
if not exist "build" (
    echo Creating build directory...
    mkdir build
)

cd build

:: Detect CMake executable path (handles situations where PATH is not reloaded yet)
set CMAKE_CMD=cmake
if exist "C:\Program Files\CMake\bin\cmake.exe" (
    echo [CMake] Using absolute executable path: C:\Program Files\CMake\bin\cmake.exe
    set CMAKE_CMD="C:\Program Files\CMake\bin\cmake.exe"
)

:: Check if vcpkg toolchain exists
set TOOLCHAIN_FLAG=
if exist "C:\vcpkg\scripts\buildsystems\vcpkg.cmake" (
    echo [vcpkg] Found toolchain at C:\vcpkg. Linking dependencies...
    set TOOLCHAIN_FLAG=-DCMAKE_TOOLCHAIN_FILE=C:\vcpkg\scripts\buildsystems\vcpkg.cmake
)

:: Search for Visual Studio 2022 vcvarsall.bat to load build environments
set VCVARS_PATH=
if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" (
    set VCVARS_PATH="C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat"
) else if exist "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" (
    set VCVARS_PATH="C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"
)

if not "%VCVARS_PATH%"=="" (
    echo [VS2022] Loading MSVC build environment for x64...
    call %VCVARS_PATH% x64
)

:: Search for OpenCV installation path
set OPENCV_FLAG=
if exist "C:\opencv\build" (
    echo [OpenCV] Found SDK at C:\opencv\build. Linking configuration path...
    set OPENCV_FLAG=-DOpenCV_DIR=C:\opencv\build
)

echo Configuring project with CMake...
%CMAKE_CMD% %TOOLCHAIN_FLAG% %OPENCV_FLAG% ..

if %ERRORLEVEL% neq 0 (
    echo [ERROR] CMake configuration failed.
    pause
    exit /b %ERRORLEVEL%
)

echo Compiling C++ executable in Release mode...
%CMAKE_CMD% --build . --config Release

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo ==================================================
echo Build succeeded! Target executable generated at:
echo backend/build/bin/Release/DriveSenseBackend.exe
echo ==================================================
pause
