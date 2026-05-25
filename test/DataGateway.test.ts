
import { describe, it, expect, beforeEach } from 'vitest';
import { nexusGateway } from '../nexus/adapters/DataGateway';

describe.skip('NexusDataGateway', () => {
    beforeEach(() => {
        // Clear storage and reset memory store
        localStorage.clear();
        // The nexusGateway acts directly on Firestore in the real implementation
        // Tests might need to mock or clear Firestore, but we can't do it with initialize()
    });

    it('should initialize with seed data if storage is empty', () => {
        const servers = nexusGateway.getData('servers');
        expect(servers.length).toBeGreaterThan(0);
        expect(nexusGateway.activeServerId).toBe(servers[0].id);
    });

    it('should add and retrieve data for the active server', async () => {
        const testNote = { text: 'Test Note', type: 'general' };
        const added = await nexusGateway.add('notes', testNote);
        
        expect(added).toBeDefined();
        expect(added.text).toBe('Test Note');
        expect(added.serverId).toBe(nexusGateway.activeServerId);

        const notes = nexusGateway.getData('notes');
        expect(notes).toContainEqual(added);
    });

    it('should update existing data', async () => {
        const testNote = { text: 'Original', type: 'general' };
        const added = await nexusGateway.add('notes', testNote);
        
        const updated = await nexusGateway.update('notes', added.id, { text: 'Updated' });
        expect(updated?.text).toBe('Updated');
        expect(updated?.id).toBe(added.id);

        const notes = nexusGateway.getData('notes');
        expect(notes.find(n => n.id === added.id)?.text).toBe('Updated');
    });

    it('should delete data', async () => {
        const testNote = { text: 'To be deleted', type: 'general' };
        const added = await nexusGateway.add('notes', testNote);
        
        await nexusGateway.delete('notes', added.id);
        const notes = nexusGateway.getData('notes');
        expect(notes.find(n => n.id === added.id)).toBeUndefined();
    });

    it('should handle server switching', async () => {
        const servers = nexusGateway.getData('servers');
        if (servers.length < 2) {
            await nexusGateway.createServer('Server 2', 'US-East');
        }
        const updatedServers = nexusGateway.getData('servers');
        const server1 = updatedServers[0].id;
        const server2 = updatedServers[1].id;

        nexusGateway.setActiveServer(server1);
        await nexusGateway.add('notes', { text: 'Note Server 1' });

        nexusGateway.setActiveServer(server2);
        await nexusGateway.add('notes', { text: 'Note Server 2' });

        expect(nexusGateway.getData('notes').length).toBe(1);
        expect(nexusGateway.getData('notes')[0].text).toBe('Note Server 2');

        nexusGateway.setActiveServer(server1);
        expect(nexusGateway.getData('notes').length).toBe(1);
        expect(nexusGateway.getData('notes')[0].text).toBe('Note Server 1');
    });

    it.skip('should persist data to localStorage', async () => {
        await nexusGateway.add('notes', { text: 'Persistent Note' });
        const stored = localStorage.getItem('STORAGE_KEY');
        expect(stored).toBeDefined();
        const parsed = JSON.parse(stored!);
        expect(parsed.notes.length).toBeGreaterThan(0);
    });

    it('should authenticate root user', async () => {
        const result = await nexusGateway.authenticateRoot('sys_root', 'root123');
        expect(result).toHaveProperty('user');
        expect((result as any).user.id).toBe('sys_root');
    });

    it('should log script usage', async () => {
        // Ensure script exists
        const scripts = nexusGateway.getData('scripts');
        const script = scripts[0];
        if (script) {
            const initialUsage = script.usageCount || 0;
            await nexusGateway.logScriptUsage(script.id, 'win', 100);
            const updatedScripts = nexusGateway.getData('scripts');
            const updatedScript = updatedScripts.find((s: any) => s.id === script.id);
            expect(updatedScript.usageCount).toBe(initialUsage + 1);
            expect(updatedScript.successCount).toBe((script.successCount || 0) + 1);
        }
    });

    it('should verify session', async () => {
        const result = await nexusGateway.verifySession('sys_root', 'admin', 10, 'sig');
        expect(result).not.toBeNull();
        expect((result as any)?.id).toBe('sys_root');
    });
});
