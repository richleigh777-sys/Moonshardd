import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface ConnectedClient {
    id: string;
    ws: WebSocket;
    role: string;
    isAlive: boolean;
}

const clients = new Map<string, ConnectedClient>();

export function initializeRealtime(httpServer: Server) {
    const wss = new WebSocketServer({ server: httpServer });

    wss.on('connection', (ws, req) => {
        // In a real system, you would verify the JWT from req.url or headers
        // For scaffold, we accept the connection but assign it a generic ID
        const id = Math.random().toString(36).substring(7);
        
        clients.set(id, { id, ws, role: 'unknown', isAlive: true });
        
        console.log(`[Realtime] Client connected: ${id}`);

        ws.on('pong', () => {
            const client = clients.get(id);
            if (client) client.isAlive = true;
        });

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                
                // Example: Client sending an active presence update
                if (data.type === 'HEARTBEAT_ACK') {
                    // Update client metadata like current viewed document for collision prevention
                }
                
                // Example: Admin initiating a flash broadcast
                if (data.type === 'FLASH_DIRECTIVE') {
                    // Verifying role constraint would happen here
                    broadcast({ type: 'FLASH_DIRECTIVE', payload: data.payload });
                }

            } catch (err) {
                console.error('[Realtime] Message Error:', err);
            }
        });

        ws.on('close', () => {
            clients.delete(id);
            console.log(`[Realtime] Client disconnected: ${id}`);
        });
    });

    // Heartbeat mechanism to reap dead connections
    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            const clientEntry = Array.from(clients.values()).find(c => c.ws === ws);
            if (clientEntry && !clientEntry.isAlive) {
                clients.delete(clientEntry.id);
                return ws.terminate();
            }
            if (clientEntry) clientEntry.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => {
        clearInterval(interval);
    });

    console.log('[Realtime] WebSocket Hub initialized.');
}

/**
 * Universal broadcast function to push events to all connected clients.
 */
export function broadcast(event: any) {
    const msg = JSON.stringify(event);
    clients.forEach((client) => {
        if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(msg);
        }
    });
}
