
import { describe, it, expect, beforeEach } from 'vitest';
import { NexusDataGateway, ConflictError } from '../nexus/adapters/DataGateway';

describe.skip('Conflict Resolution Logic', () => {
    let gateway: NexusDataGateway;

    beforeEach(() => {
        gateway = new NexusDataGateway();
        gateway.setActiveServer('test-server');
    });

    it('should allow updates when updatedAt matches', async () => {
        const sale = await gateway.add('sales', { customer: 'John Doe', amount: 100 });
        const initialUpdatedAt = sale.updatedAt;

        await gateway.update('sales', sale.id, { amount: 150 }, initialUpdatedAt);
        
        const updatedSale = (await gateway.getData('sales')).find((s: any) => s.id === sale.id);
        expect(updatedSale.amount).toBe(150);
        expect(updatedSale.updatedAt).toBeGreaterThan(initialUpdatedAt);
    });

    it('should throw ConflictError when updatedAt does not match', async () => {
        const sale = await gateway.add('sales', { customer: 'John Doe', amount: 100 });
        const initialUpdatedAt = sale.updatedAt;

        // Simulate another user updating the record
        await gateway.update('sales', sale.id, { amount: 200 });
        
        // Try to update with stale updatedAt
        await expect(gateway.update('sales', sale.id, { amount: 300 }, initialUpdatedAt))
            .rejects.toThrow(ConflictError);
    });

    it('should allow overwriting when expectedUpdatedAt is not provided', async () => {
        const sale = await gateway.add('sales', { customer: 'John Doe', amount: 100 });
        
        // Simulate another user updating the record
        await gateway.update('sales', sale.id, { amount: 200 });
        
        // Update without expectedUpdatedAt (Overwrite)
        await gateway.update('sales', sale.id, { amount: 300 });
        
        const updatedSale = (await gateway.getData('sales')).find((s: any) => s.id === sale.id);
        expect(updatedSale.amount).toBe(300);
    });

    it('should automatically merge non-conflicting field updates', async () => {
        const sale = await gateway.add('sales', { customer: 'John Doe', amount: 100, phone: '111' });
        const originalData = { ...sale };
        const initialUpdatedAt = sale.updatedAt;

        // User B updates phone
        await gateway.update('sales', sale.id, { phone: '222' });
        
        // User A updates amount, providing originalData for merge
        const mergedSale = await gateway.update('sales', sale.id, { amount: 150 }, initialUpdatedAt, originalData);
        
        expect(mergedSale.amount).toBe(150);
        expect(mergedSale.phone).toBe('222'); // Merged from User B
    });

    it('should throw ConflictError with field names when fields overlap', async () => {
        const sale = await gateway.add('sales', { customer: 'John Doe', amount: 100 });
        const originalData = { ...sale };
        const initialUpdatedAt = sale.updatedAt;

        // User B updates amount to 200
        await gateway.update('sales', sale.id, { amount: 200 });
        
        // User A tries to update amount to 300
        try {
            await gateway.update('sales', sale.id, { amount: 300 }, initialUpdatedAt, originalData);
            expect.fail('Should have thrown ConflictError');
        } catch (err) {
            expect(err).toBeInstanceOf(ConflictError);
            expect((err as ConflictError).conflicts).toContain('amount');
        }
    });
});
