
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CRMProvider } from '../context/CRMContext';
import { useCRM } from '../hooks/useCRM';
import { AuthProvider } from '../context/AuthContext';
import * as AuthHook from '../context/AuthContextCore';
import { nexusGateway } from '../nexus/adapters/DataGateway';

// Mock Sound Service to avoid errors
vi.mock('../lib/soundService', () => ({
    sfx: {
        playSubmit: vi.fn(),
        playClick: vi.fn(),
        playSuccess: vi.fn(),
        playError: vi.fn(),
        playDecline: vi.fn(),
        playHover: vi.fn(),
    },
}));

// Mock window.confirm
window.confirm = vi.fn(() => true);

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
        <CRMProvider>
            {children}
        </CRMProvider>
    </AuthProvider>
);

describe.skip('End-to-End Sales Workflow Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        (nexusGateway as any).initialize();
    });

    it('should complete a full sales workflow from lead to ledger', async () => {
        // Add user to gateway first so session verification succeeds
        const testUser: any = { 
            id: 'agent-007', 
            name: 'James Bond', 
            role: 'agent' as const, 
            accessLevel: 1, 
            serverId: 'srv-001', 
            pass: 'test',
            commissionRate: 15,
            active: true,
            currentStatus: 'online'
        };
        await nexusGateway.add('users', testUser);

        const { result: authResult } = renderHook(() => React.useContext(AuthHook.AuthContext), { wrapper });
        
        // Log in a test user
        await act(async () => {
            await authResult.current?.login(testUser, 'test-sig');
        });

        const { result } = renderHook(() => useCRM(), { wrapper });

        // 1. Initial State Check
        await waitFor(() => expect(result.current.currentUser).not.toBeNull());
        await waitFor(() => expect(result.current.sales).toBeDefined());
        const initialSalesCount = result.current.sales.length;

        // 2. Lead Engagement: Add a Note
        const leadData = {
            customerName: 'Integration Test Lead',
            phone: '555-0199',
            text: 'Interested in premium package. Follow up tomorrow.',
            type: 'callback' as const,
            priority: 'High' as const,
        };

        await act(async () => {
            await result.current.addNote(leadData);
        });

        expect(result.current.notes.some(n => n.customerName === leadData.customerName)).toBe(true);

        // 3. Order Submission: Add a Sale
        const saleData = {
            customer: leadData.customerName,
            phone: leadData.phone,
            amount: 499.99,
            product: 'Premium Package',
            status: 'Approved' as const,
            pipelineStatus: 'Closed Won' as const,
            agentId: 'test-agent',
            agent: 'Test Agent'
        };

        let newSale;
        await act(async () => {
            newSale = await result.current.addSale(saleData);
        });

        expect(newSale).toBeDefined();
        expect(newSale.customer).toBe(leadData.customerName);

        // 4. Ledger Update: Verify Sale in List
        await waitFor(() => {
            expect(result.current.sales.length).toBe(initialSalesCount + 1);
        }, { timeout: 4000 });

        const recordedSale = result.current.sales.find(s => s.customer === leadData.customerName);
        expect(recordedSale).toBeDefined();
        expect(recordedSale?.amount).toBe(499.99);

        // 5. Customer Creation: Verify Customer was automatically created/updated
        await waitFor(() => {
            const customer = result.current.customers.find(c => c.fullName === leadData.customerName);
            expect(customer).toBeDefined();
            expect(customer?.ltv).toBeGreaterThanOrEqual(499.99);
        }, { timeout: 5000 });

        // 6. Status Update: Change sale status and verify
        if (recordedSale) {
            await act(async () => {
                await result.current.updateSaleStatus(recordedSale.id, 'Approved', { trackingId: 'TRK123456' });
            });

            await waitFor(() => {
                const updatedSale = result.current.sales.find(s => s.id === recordedSale.id);
                expect(updatedSale?.status).toBe('Approved');
                expect(updatedSale?.trackingId).toBe('TRK123456');
            });
        }
    });
});
