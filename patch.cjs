const fs = require('fs');
let code = fs.readFileSync('nexus/repositories/BaseRepository.ts', 'utf8');

code = code.replace(
    /public setActiveServer\(id: string\) \{[\s\S]*?this\.enqueueBatchFetch\(\);\s*\}/m,
    `public setActiveServer(id: string) {
        this.activeServerId = id;
        setStorageItem('nexus_server_id', id);
        
        // Clear caches to prevent old data bleeding over across tenants
        const collectionsToClear = [
            'sales', 'users', 'customers', 'notes', 'audit', 'tasks', 'attendance', 
            'directives', 'messages', 'channels', 'notifications', 'callLogs',
            'scripts', 'sheets', 'presence', 'dialer_lists', 'systemConfig',
            'dataHealthReports', 'config'
        ];
        for (const col of collectionsToClear) {
            this.cache[col] = [];
            removeStorageItem(\`crm_cache_\${col}\`);
            const subs = this.subscriberCallbacks[col];
            if (subs) {
                subs.forEach(({ callback }) => callback([]));
            }
        }

        window.dispatchEvent(new CustomEvent('nexus_server_changed', { detail: id }));
        
        // Immediately fetch the new server's data without debounce
        this.enqueueBatchFetch(undefined, true);
    }`
);

fs.writeFileSync('nexus/repositories/BaseRepository.ts', code);
