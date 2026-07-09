type MessageType = 'LOGOUT_SYNC' | 'REFRESH_DATA' | 'LEADER_CHANGE';

interface TabMessage {
    type: MessageType;
    senderId: string;
    payload?: any;
}

class TabCoordinator {
    private channel: BroadcastChannel;
    private tabId: string;
    private _isLeader: boolean = false;
    private listeners: Record<string, ((data: any) => void)[]> = {};
    private lockController: AbortController | null = null;

    constructor() {
        this.tabId = Math.random().toString(36).substr(2, 9);
        try {
            this.channel = new BroadcastChannel('braveheart_ops_channel');
            this.channel.onmessage = (ev) => this.handleMessage(ev.data);
        } catch(e) {
            console.warn("BroadcastChannel not supported", e);
        }
        
        // Use Web Locks API for perfect mutual exclusion
        this.requestLeadership();
    }

    private async requestLeadership() {
        if (!navigator.locks) {
            console.warn("[TabManager] Web Locks API not supported. Falling back to solo mode.");
            this._isLeader = true;
            return;
        }

        this.lockController = new AbortController();

        try {
            // This promise stays pending as long as we hold the lock
            await navigator.locks.request('braveheart_leader_lock', { signal: this.lockController.signal }, async () => {
                this.becomeLeader();
                // Return a promise that never resolves to keep the lock held until tab close/abort
                await new Promise(() => {}); 
            });
        } catch (e) {
            if ((e as Error).name === 'AbortError') {
                this._isLeader = false;
            }
        }
    }

    private becomeLeader() {
        this._isLeader = true;
        console.log(`[TabManager] Tab ${this.tabId} granted EXCLUSIVE leadership via WebLock.`);
        this.broadcast('LEADER_CHANGE', { isLeader: true, leaderId: this.tabId });
    }

    private handleMessage(msg: TabMessage) {
        if (msg.senderId === this.tabId) return;

        switch (msg.type) {
            case 'LOGOUT_SYNC':
                this.emit('LOGOUT_SYNC', msg.payload);
                break;
            case 'REFRESH_DATA':
                this.emit('REFRESH_DATA', msg.payload);
                // Also trigger app-wide refresh
                window.dispatchEvent(new CustomEvent('REFRESH_DATA', { detail: msg.payload }));
                break;
            case 'LEADER_CHANGE':
                if (msg.payload.isLeader) {
                    this._isLeader = false;
                }
                break;
        }
    }

    public broadcast(type: MessageType, payload?: any) {
        if (!this.channel) return;
        try {
            this.channel.postMessage({
                type,
                senderId: this.tabId,
                payload
            });
        } catch(e) { console.error("Broadcast failed", e); }
    }

    public get isLeader() {
        return this._isLeader;
    }

    public on(event: MessageType, callback: (data: any) => void) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    private emit(event: string, data?: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

export const tabManager = new TabCoordinator();