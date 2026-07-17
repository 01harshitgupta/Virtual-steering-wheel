import { useStore } from "../store/useStore";

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private url: string = "ws://localhost:8000";

  connect(wsUrl: string) {
    this.url = wsUrl;
    this.disconnect();

    const { setConnectionStatus, setSteeringAngle, setSpeed, addTelemetryPoint } = useStore.getState();

    console.log(`[WS Client] Connecting to: ${this.url}`);
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log("[WS Client] Connected to C++ backend.");
        setConnectionStatus(true);
        if (this.reconnectInterval) {
          clearInterval(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.socket.onclose = () => {
        console.log("[WS Client] Connection closed.");
        setConnectionStatus(false);
        this.triggerReconnect();
      };

      this.socket.onerror = (err) => {
        console.error("[WS Client] Error encountered:", err);
        setConnectionStatus(false);
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Inject metrics to Zustand store
          setSteeringAngle(data.angle);
          setSpeed(data.speed);
          
          // Append point to history
          const timeStr = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          addTelemetryPoint({
            time: timeStr,
            angle: data.angle,
            speed: data.speed,
            latency: data.latency,
            confidence: data.confidence,
          });

          // Update other stats in store
          useStore.setState({
            latency: data.latency,
            confidence: data.confidence,
            gesture: data.gesture,
          });

        } catch (err) {
          console.warn("[WS Client] Failed parsing frame payload:", err);
        }
      };
    } catch (err) {
      console.error("[WS Client] Connection failed:", err);
      this.triggerReconnect();
    }
  }

  private triggerReconnect() {
    if (this.reconnectInterval) return;

    console.log("[WS Client] Scheduling reconnect in 3s...");
    this.reconnectInterval = setInterval(() => {
      const { settings } = useStore.getState();
      this.connect(settings.wsUrl);
    }, 3000);
  }

  disconnect() {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.close();
      this.socket = null;
    }
    
    useStore.getState().setConnectionStatus(false);
  }

  sendKey(action: "Dn" | "Up", vk: number): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(`${action} ${vk}`);
      return true;
    }
    return false;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
