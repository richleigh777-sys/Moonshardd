export type RealtimeCallback = (event: any) => void;

class RealtimeClient {
    private ws: WebSocket | null = null;
    private listeners: RealtimeCallback[] = [];
    private pingInterval: any = null;

    connect() {
        if (
            typeof window === 'undefined' || 
            (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ||
            (typeof globalThis !== 'undefined' && ('vitest' in globalThis || 'vi' in globalThis))
        ) {
            return;
        }

        if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) {
            return;
        }

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${protocol}//${window.location.host}`);

        this.ws.onopen = () => {
            console.log('[RealtimeClient] Connected');
            this.pingInterval = setInterval(() => {
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'HEARTBEAT_ACK' }));
                }
            }, 25000);
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.listeners.forEach(cb => cb(data));
            } catch (err) {
                console.error('[RealtimeClient] Parse err:', err);
            }
        };

        this.ws.onclose = () => {
            console.log('[RealtimeClient] Disconnected, retrying...');
            clearInterval(this.pingInterval);
            setTimeout(() => this.connect(), 5000);
        };
    }

    subscribe(callback: RealtimeCallback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    send(type: string, payload: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }
}

export const realtimeClient = new RealtimeClient();
realtimeClient.connect();
