
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nexusGateway, NexusDataGateway } from '../nexus/adapters/DataGateway';
import { STORAGE_KEY } from '../lib/config';

describe.skip('Real-Time Collaboration & Subscription Model', () => {
    beforeEach(() => {
        localStorage.clear();
        (nexusGateway as any).initialize();
    });

    it('should broadcast updates to all active subscribers on the same instance', async () => {
        const agent1Callback = vi.fn();
        const agent2Callback = vi.fn();

        nexusGateway.subscribe('notes', { id: 'agent-1' }, agent1Callback);
        nexusGateway.subscribe('notes', { id: 'agent-2' }, agent2Callback);

        agent1Callback.mockClear();
        agent2Callback.mockClear();

        await nexusGateway.add('notes', { text: 'Same Instance Note' });

        expect(agent1Callback).toHaveBeenCalledTimes(1);
        expect(agent2Callback).toHaveBeenCalledTimes(1);
    });

    it('should sync data across multiple instances (simulating cross-tab collaboration)', async () => {
        const instanceA = new NexusDataGateway();
        const instanceB = new NexusDataGateway();

        const callbackB = vi.fn();
        instanceB.subscribe('notes', { id: 'agent-b' }, callbackB);
        callbackB.mockClear();

        // Instance A adds a note
        await instanceA.add('notes', { text: 'Cross-Tab Note' });

        // Manually trigger storage event in Vitest/JSDOM to simulate browser behavior
        const storageEvent = new StorageEvent('storage', {
            key: STORAGE_KEY,
            newValue: localStorage.getItem(STORAGE_KEY),
            storageArea: localStorage
        });
        window.dispatchEvent(storageEvent);

        // Verify Instance B received the update from Instance A via storage event
        expect(callbackB).toHaveBeenCalled();
        const dataB = callbackB.mock.calls[0][0];
        expect(dataB.some((n: any) => n.text === 'Cross-Tab Note')).toBe(true);
    });

    it('should handle concurrent writes (Last Write Wins)', async () => {
        const instanceA = new NexusDataGateway();
        const instanceB = new NexusDataGateway();

        // Both instances try to update the same system config concurrently
        const configA = { ...instanceA.getData('systemConfig')[0], ecoMode: true };
        const configB = { ...instanceB.getData('systemConfig')[0], ecoMode: false };

        await Promise.all([
            instanceA.update('systemConfig', 'CORE_CONFIG', configA),
            instanceB.update('systemConfig', 'CORE_CONFIG', configB)
        ]);

        // The final state in localStorage should reflect the last write
        const finalStored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
        const finalConfig = finalStored.systemConfig[0];
        
        // In our case, instanceB's write happened last (or was processed last)
        expect(finalConfig.ecoMode).toBe(false);
    });
});


