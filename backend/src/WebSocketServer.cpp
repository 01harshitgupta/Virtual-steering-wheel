#include "WebSocketServer.h"
#include <iostream>
#include <sstream>
#include <algorithm>
#include <cstring>

#ifdef _WIN32
#pragma comment(lib, "Ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#define CLOSE_SOCKET(s) close(s)
#define INVALID_SOCKET -1
#endif

#ifdef _WIN32
#define CLOSE_SOCKET(s) closesocket(s)
#endif

// Lightweight custom Base64 encoder
static std::string base64Encode(const unsigned char* bytes, size_t len) {
    static const char char_table[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string encoded;
    encoded.reserve(((len + 2) / 3) * 4);
    
    size_t i = 0;
    while (i < len) {
        uint32_t octet_a = i < len ? bytes[i++] : 0;
        uint32_t octet_b = i < len ? bytes[i++] : 0;
        uint32_t octet_c = i < len ? bytes[i++] : 0;
        
        uint32_t triple = (octet_a << 16) + (octet_b << 8) + octet_c;
        
        encoded.push_back(char_table[(triple >> 18) & 0x3F]);
        encoded.push_back(char_table[(triple >> 12) & 0x3F]);
        encoded.push_back(i > len + 1 ? '=' : char_table[(triple >> 6) & 0x3F]);
        encoded.push_back(i > len ? '=' : char_table[triple & 0x3F]);
    }
    return encoded;
}

// Lightweight custom SHA-1 implementation
static void sha1(const std::string& input, unsigned char* digest) {
    uint32_t h0 = 0x67452301;
    uint32_t h1 = 0xEFCDAB89;
    uint32_t h2 = 0x98BADCFE;
    uint32_t h3 = 0x10325476;
    uint32_t h4 = 0xC3D2E1F0;
    
    std::string msg = input;
    uint64_t bit_len = msg.size() * 8;
    msg.push_back((char)0x80);
    
    while ((msg.size() + 8) % 64 != 0) {
        msg.push_back((char)0x00);
    }
    
    for (int i = 7; i >= 0; --i) {
        msg.push_back((char)((bit_len >> (i * 8)) & 0xFF));
    }
    
    for (size_t chunk = 0; chunk < msg.size(); chunk += 64) {
        uint32_t w[80] = {0};
        for (int i = 0; i < 16; ++i) {
            w[i] = ((unsigned char)msg[chunk + i * 4] << 24)
                 | ((unsigned char)msg[chunk + i * 4 + 1] << 16)
                 | ((unsigned char)msg[chunk + i * 4 + 2] << 8)
                 | ((unsigned char)msg[chunk + i * 4 + 3]);
        }
        for (int i = 16; i < 80; ++i) {
            uint32_t val = w[i-3] ^ w[i-8] ^ w[i-14] ^ w[i-16];
            w[i] = (val << 1) | (val >> 31);
        }
        
        uint32_t a = h0, b = h1, c = h2, d = h3, e = h4;
        for (int i = 0; i < 80; ++i) {
            uint32_t f = 0, k = 0;
            if (i < 20) {
                f = (b & c) | ((~b) & d);
                k = 0x5A827999;
            } else if (i < 40) {
                f = b ^ c ^ d;
                k = 0x6ED9EBA1;
            } else if (i < 60) {
                f = (b & c) | (b & d) | (c & d);
                k = 0x8F1BBCDC;
            } else {
                f = b ^ c ^ d;
                k = 0xCA62C1D6;
            }
            uint32_t temp = ((a << 5) | (a >> 27)) + f + e + k + w[i];
            e = d;
            d = c;
            c = (b << 30) | (b >> 2);
            b = a;
            a = temp;
        }
        h0 += a; h1 += b; h2 += c; h3 += d; h4 += e;
    }
    
    uint32_t h[] = {h0, h1, h2, h3, h4};
    for (int i = 0; i < 5; ++i) {
        digest[i * 4] = (h[i] >> 24) & 0xFF;
        digest[i * 4 + 1] = (h[i] >> 16) & 0xFF;
        digest[i * 4 + 2] = (h[i] >> 8) & 0xFF;
        digest[i * 4 + 3] = h[i] & 0xFF;
    }
}

WebSocketServer::WebSocketServer() : port(8000), running(false), listenSocket(INVALID_SOCKET) {}

WebSocketServer::~WebSocketServer() {
    stop();
}

bool WebSocketServer::init(int p) {
    port = p;
#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "[WS Error] Winsock startup failed." << std::endl;
        return false;
    }
#endif
    return true;
}

void WebSocketServer::start() {
    listenSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (listenSocket == INVALID_SOCKET) {
        std::cerr << "[WS Error] Failed to create socket." << std::endl;
        return;
    }

    sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(port);

    if (bind(listenSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == -1) {
        std::cerr << "[WS Error] Bind failed on port " << port << std::endl;
        CLOSE_SOCKET(listenSocket);
        return;
    }

    if (listen(listenSocket, SOMAXCONN) == -1) {
        std::cerr << "[WS Error] Listen failed." << std::endl;
        CLOSE_SOCKET(listenSocket);
        return;
    }

    running = true;
    serverThread = std::thread(&WebSocketServer::run, this);
    std::cout << "[WebSocketServer] Server running on port " << port << std::endl;
}

void WebSocketServer::stop() {
    if (!running) return;

    running = false;
    CLOSE_SOCKET(listenSocket);

    if (serverThread.joinable()) {
        serverThread.join();
    }

    std::lock_guard<std::mutex> lock(clientsMutex);
    for (auto client : clientSockets) {
        CLOSE_SOCKET(client);
    }
    clientSockets.clear();

#ifdef _WIN32
    WSACleanup();
#endif
    std::cout << "[WebSocketServer] Server stopped successfully." << std::endl;
}

void WebSocketServer::run() {
    while (running) {
        sockaddr_in clientAddr;
        int clientAddrSize = sizeof(clientAddr);
        SocketType clientSocket = accept(listenSocket, (sockaddr*)&clientAddr, &clientAddrSize);
        
        if (clientSocket == INVALID_SOCKET) {
            if (running) {
                std::cerr << "[WS Error] Failed to accept client socket." << std::endl;
            }
            continue;
        }

        std::thread(&WebSocketServer::handleClient, this, clientSocket).detach();
    }
}

std::string WebSocketServer::calculateWebSocketAccept(const std::string& wsKey) {
    std::string guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
    std::string combined = wsKey + guid;
    unsigned char digest[20];
    sha1(combined, digest);
    return base64Encode(digest, 20);
}

void WebSocketServer::handleClient(SocketType clientSocket) {
    char buffer[2048] = {0};
    int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
    if (bytesRead <= 0) {
        CLOSE_SOCKET(clientSocket);
        return;
    }

    std::string request(buffer);
    size_t keyPos = request.find("Sec-WebSocket-Key: ");
    if (keyPos == std::string::npos) {
        CLOSE_SOCKET(clientSocket);
        return;
    }

    size_t keyEnd = request.find("\r\n", keyPos);
    std::string key = request.substr(keyPos + 19, keyEnd - (keyPos + 19));

    // Send HTTP Switch response handshake
    std::string acceptVal = calculateWebSocketAccept(key);
    std::ostringstream response;
    response << "HTTP/1.1 101 Switching Protocols\r\n"
             << "Upgrade: websocket\r\n"
             << "Connection: Upgrade\r\n"
             << "Sec-WebSocket-Accept: " << acceptVal << "\r\n\r\n";

    send(clientSocket, response.str().c_str(), response.str().size(), 0);

    {
        std::lock_guard<std::mutex> lock(clientsMutex);
        clientSockets.push_back(clientSocket);
    }

    std::cout << "[WebSocketServer] Client connected. Registered to socket array." << std::endl;

    // Keep connection alive or read frames
    char frameBuffer[1024];
    while (running) {
        int r = recv(clientSocket, frameBuffer, sizeof(frameBuffer), 0);
        if (r <= 0) break; // disconnected
    }

    {
        std::lock_guard<std::mutex> lock(clientsMutex);
        clientSockets.erase(std::remove(clientSockets.begin(), clientSockets.end(), clientSocket), clientSockets.end());
    }
    CLOSE_SOCKET(clientSocket);
    std::cout << "[WebSocketServer] Client disconnected." << std::endl;
}

void WebSocketServer::sendFrame(SocketType socket, const std::string& message) {
    std::vector<char> frame;
    frame.push_back((char)0x81); // Text frame opcode

    size_t len = message.size();
    if (len <= 125) {
        frame.push_back((char)len);
    } else if (len <= 65535) {
        frame.push_back((char)126);
        frame.push_back((char)((len >> 8) & 0xFF));
        frame.push_back((char)(len & 0xFF));
    } else {
        frame.push_back((char)127);
        for (int i = 7; i >= 0; --i) {
            frame.push_back((char)((len >> (i * 8)) & 0xFF));
        }
    }

    frame.insert(frame.end(), message.begin(), message.end());
    send(socket, frame.data(), frame.size(), 0);
}

void WebSocketServer::broadcastTelemetry(double angle, double speed, double confidence, int latency, const std::string& gesture) {
    std::lock_guard<std::mutex> lock(clientsMutex);
    if (clientSockets.empty()) return;

    // Construct telemetry JSON payload
    std::ostringstream json;
    json << "{"
         << "\"angle\":" << angle << ","
         << "\"speed\":" << speed << ","
         << "\"confidence\":" << confidence << ","
         << "\"latency\":" << latency << ","
         << "\"gesture\":\"" << gesture << "\""
         << "}";

    std::string msg = json.str();
    for (auto client : clientSockets) {
        sendFrame(client, msg);
    }
}
