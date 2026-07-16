#ifndef GAMEPADCONTROLLER_H
#define GAMEPADCONTROLLER_H

#include <windows.h>
#include <mutex>

class GamepadController {
private:
    HMODULE hViGEmDll;
    void* client; // PVIGEM_CLIENT
    void* target; // PVIGEM_TARGET
    bool initialized;
    bool connected;
    mutable std::mutex statusMutex;

    // Define function pointers for ViGEmClient API
    typedef void* (*PFN_VIGEM_ALLOC)();
    typedef void (*PFN_VIGEM_FREE)(void*);
    typedef int (*PFN_VIGEM_CONNECT)(void*);
    typedef void (*PFN_VIGEM_DISCONNECT)(void*);
    typedef void* (*PFN_VIGEM_TARGET_X360_ALLOC)();
    typedef void (*PFN_VIGEM_TARGET_FREE)(void*);
    typedef int (*PFN_VIGEM_TARGET_ADD)(void*, void*);
    typedef int (*PFN_VIGEM_TARGET_REMOVE)(void*, void*);
    
#pragma pack(push, 1)
    struct XUSB_REPORT {
        unsigned short wButtons;
        unsigned char bLeftTrigger;
        unsigned char bRightTrigger;
        short sThumbLX;
        short sThumbLY;
        short sThumbRX;
        short sThumbRY;
    };
#pragma pack(pop)

    typedef int (*PFN_VIGEM_TARGET_X360_UPDATE)(void*, void*, XUSB_REPORT);

    PFN_VIGEM_ALLOC vigem_alloc_fn;
    PFN_VIGEM_FREE vigem_free_fn;
    PFN_VIGEM_CONNECT vigem_connect_fn;
    PFN_VIGEM_DISCONNECT vigem_disconnect_fn;
    PFN_VIGEM_TARGET_X360_ALLOC vigem_target_x360_alloc_fn;
    PFN_VIGEM_TARGET_FREE vigem_target_free_fn;
    PFN_VIGEM_TARGET_ADD vigem_target_add_fn;
    PFN_VIGEM_TARGET_REMOVE vigem_target_remove_fn;
    PFN_VIGEM_TARGET_X360_UPDATE vigem_target_x360_update_fn;

    bool loadDll();

public:
    GamepadController();
    ~GamepadController();

    bool init();
    void shutdown();
    bool isAvailable() const;
    void updateState(double steeringAngle, bool brake, bool accelerate, bool horn, bool nitro,
                     int& outLeftStickX, int& outLeftTrigger, int& outRightTrigger, int& outButtons);
};

#endif // GAMEPADCONTROLLER_H
