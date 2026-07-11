
import { useCallback } from 'react';
import { useCRM } from '../hooks/useCRM';
import { useSystem } from '../hooks/useSystem';
import { useAuth } from './useAuth';
import { sfx } from '../lib/soundService';
import { Sale } from '../types';

/**
 * useWorkflow
 * Atomic business process controller for complex system state transitions.
 */
export const useWorkflow = () => {
    const { updateSaleStatus, logAudit, sendDirective } = useCRM();
    const { setToast, triggerMoneyRain } = useSystem();
    const { currentUser } = useAuth();

    /**
     * closeDeal
     * Atomic workflow for successfully closing a transaction.
     */
    const closeDeal = useCallback(async (sale: Sale, orderId: string) => {
        if (!currentUser) return;

        try {
            sfx.playSuccess();
            
            // 1. Update State
            await updateSaleStatus(sale.id, 'Approved', { 
                orderId, 
                dealStage: 'Won',
                closedAt: Date.now() 
            });

            // 2. Log Forensic Audit
            await logAudit({
                action: 'DEAL_WON',
                details: `Closed ${sale.customer} for ${sale.amount}. OrderID: ${orderId}`,
                module: 'SALE',
                timestamp: Date.now()
            });

            // 3. Dispatch Visual Celebration
            if (sale.amount >= 1000) {
                triggerMoneyRain();
            }

            // 4. Team Broadcast (Gamification)
            if (sale.amount >= 2000) {
                await sendDirective({
                    message: `🔥 WHALE ALERT: ${currentUser.name} just secured a ${sale.amount} unit!`,
                    urgency: 'Routine',
                    senderName: 'Nexus System'
                });
            }

            setToast({ title: 'Deal Closed', message: `Successfully Closed ${sale.customer}`, type: 'success' });
            
        } catch {
            sfx.playError();
            setToast({ title: 'Workflow Error', message: "Workflow transition failed", type: 'error' });
        }
    }, [currentUser, updateSaleStatus, logAudit, triggerMoneyRain, sendDirective, setToast]);

    /**
     * scheduleRescue
     * Workflow for moving a declined sale into the Rescue Pipeline.
     */
    const scheduleRescue = useCallback(async (sale: Sale, reason: string) => {
        if (!currentUser) return;
        
        await updateSaleStatus(sale.id, 'Rescue In Progress', {
            declineReason: reason,
            pipelineStatus: 'Closed Lost'
        });
        
        setToast({ title: 'Rescue Ops', message: "Target moved to Rescue Ops", type: 'warning' });
        sfx.playConfirm();
    }, [currentUser, updateSaleStatus, setToast]);

    return { closeDeal, scheduleRescue };
};
