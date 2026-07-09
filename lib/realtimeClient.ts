export type RealtimeCallback = (event: any) => void;

class RealtimeClient {
    private ws: WebSocket | null = null;
    private listeners: RealtimeCallback[] = [];
    private pingInterval: any = null;
    private flushInterval: any = null;
    private eventBuffer: any[] = [];

    getSocketState(): number {
        return this.ws ? this.ws.readyState : 0; // 0 is WebSocket.CONNECTING
    }

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

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            this.ws = new WebSocket(`${protocol}//${window.location.host}/api/ws`);
        } catch(e) {
            console.warn("WebSocket not supported", e);
            return;
        }

        this.ws.onopen = () => {
            console.log('[RealtimeClient] Connected');
            this.pingInterval = setInterval(() => {
                if (this.ws?.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify({ type: 'HEARTBEAT_ACK' }));
                }
            }, 25000);
            
            this.flushInterval = setInterval(() => this.flushEvents(), 1000); // Flush events every 1 second
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.eventBuffer.push(data);
            } catch (err) {
                console.error('[RealtimeClient] Parse err:', err);
            }
        };

        this.ws.onclose = () => {
            console.log('[RealtimeClient] Disconnected, retrying...');
            clearInterval(this.pingInterval);
            clearInterval(this.flushInterval);
            setTimeout(() => this.connect(), 5000);
        };
    }
    
    private flushEvents() {
        if (this.eventBuffer.length === 0) return;
        const events = [...this.eventBuffer];
        this.eventBuffer = [];
        
        // Deduplicate COLLECTION_MUTATED events to prevent UI lag on bulk operations
        const uniqueMutations = new Map<string, any>();
        const others: any[] = [];
        
        events.forEach(e => {
            if (e.type === 'COLLECTION_MUTATED') {
                uniqueMutations.set(e.collectionName, e);
            } else if (e.type === 'BULK_IMPORT_PROGRESS' || e.type === 'SYSTEM_NOTIFICATION') {
                // Keep only the latest progress/notification event of the same type to avoid spamming the UI
                uniqueMutations.set(e.type, e);
            } else {
                others.push(e);
            }
        });
        
        const dedupedEvents = [...Array.from(uniqueMutations.values()), ...others];
        
        dedupedEvents.forEach(data => {
            this.listeners.forEach(cb => cb(data));
        });
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
