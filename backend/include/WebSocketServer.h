#ifndef WEBSOCKETSERVER_H
#define WEBSOCKETSERVER_H

#include <thread>
#include <mutex>
#include <vector>
#include <string>

#ifdef _WIN32
#include <winsock2.h>
typedef SOCKET SocketType;
#else
typedef int SocketType;
#endif

class InputController;

class WebSocketServer {
private:
    int port;
    bool running;
    std::thread serverThread;
    std::mutex clientsMutex;
    std::vector<SocketType> clientSockets;
    SocketType listenSocket;
    InputController* inputController;

    void run();
    void handleClient(SocketType clientSocket);
    std::string calculateWebSocketAccept(const std::string& wsKey);
    void sendFrame(SocketType socket, const std::string& message);

public:
    WebSocketServer();
    ~WebSocketServer();

    bool init(int port);
    void setInputController(InputController* controller);
    void start();
    void stop();
    void broadcastTelemetry(double angle, double speed, double confidence, int latency, const std::string& gesture);
};

#endif // WEBSOCKETSERVER_H
