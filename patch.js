const fs = require('fs');
let code = fs.readFileSync('nexus/repositories/BaseRepository.ts', 'utf8');

code = code.replace(
`    public enqueueBatchFetch(collectionName?: string) {
        if (collectionName) {
            this.batchQueue.add(collectionName);
        } else {
            Object.keys(this.subscriberCallbacks).forEach(col => this.batchQueue.add(col));
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        this.debounceTimeout = setTimeout(async () => {
            const collectionsToFetch = Array.from(this.batchQueue);
            this.batchQueue.clear();
            if (collectionsToFetch.length === 0) return;
            await this.performBatchFetch(collectionsToFetch);
        }, 2000);
    }`,
`    public enqueueBatchFetch(collectionName?: string, immediate: boolean = false) {
        if (collectionName) {
            this.batchQueue.add(collectionName);
        } else {
            Object.keys(this.subscriberCallbacks).forEach(col => this.batchQueue.add(col));
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        const execute = async () => {
            const collectionsToFetch = Array.from(this.batchQueue);
            this.batchQueue.clear();
            if (collectionsToFetch.length === 0) return;
            await this.performBatchFetch(collectionsToFetch);
        };
        if (immediate) {
            execute();
        } else {
            this.debounceTimeout = setTimeout(execute, 2000);
        }
    }`
);

fs.writeFileSync('nexus/repositories/BaseRepository.ts', code);
