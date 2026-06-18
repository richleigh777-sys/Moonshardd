import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useCRM } from '../../../hooks/useCRM';
import { useSystem } from '../../../hooks/useSystem';
import { Sale } from '../../../types';
import { sfx } from '../../../lib/soundService';
import { ConflictError } from '../../../nexus/adapters/DataGateway';

export const useAdminPortalLogic = () => {
    const { currentUser } = useAuth();
    const { setToast } = useSystem();
    const { 
        sales, users, notes, health, notifications, clearNotification, productConfig, updateProductConfig, 
        systemConfig, updateSystemConfig, updateUser, addUser, 
        updateSaleStatus, updateSale, deleteSale, bulkDeleteSales, bulkUpdateSales, importSales, 
        sendDirective, runDiagnostic, testUplink 
    } = useCRM();
    
    const [view, setView] = useState('overview');
    const [showTerminals, setShowTerminals] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);
    const [showScratchpad, setShowScratchpad] = useState(false);
    const [conflict, setConflict] = useState<{
        isOpen: boolean;
        onOverwrite: () => void;
        onReload: () => void;
        itemName?: string;
        conflicts?: string[];
    } | null>(null);

    const isSuperAdmin = useMemo(() => (currentUser?.level || 0) >= 10, [currentUser]);
    
    const allowedTabs = useMemo(() => {
        if (isSuperAdmin) {
            return ['overview', 'nexus', 'enrollment', 'pipeline', 'ledger', 'sales_pool', 'retention', 'roster', 'standings', 'intel', 'comms', 'scripts', 'automation', 'catalog', 'system', 'sheets', 'payroll', 'audit'];
        } else {
            const configuredPerms = systemConfig.permissions?.manager || ['overview', 'enrollment', 'pipeline', 'ledger', 'roster', 'payroll', 'audit'];
            return configuredPerms.filter(t => t !== 'nexus');
        }
    }, [isSuperAdmin, systemConfig.permissions?.manager]);

    const isAllowed = useCallback((id: string) => allowedTabs.includes(id), [allowedTabs]);

    useEffect(() => {
        const handleNav = (e: Event) => {
            const target = (e as CustomEvent).detail;
            if (isAllowed(target)) setView(target);
        };
        document.addEventListener('NAVIGATE', handleNav);
        return () => document.removeEventListener('NAVIGATE', handleNav);
    }, [isAllowed]);

    useEffect(() => {
        if (!isAllowed(view)) {
            const first = allowedTabs[0];
            if (first) {
                // Use timeout to avoid synchronous state update warning and potential loop
                const t = setTimeout(() => setView(first), 0);
                return () => clearTimeout(t);
            }
        }
    }, [allowedTabs, view, isAllowed]);

    const handleLedgerAction = async (sale: Sale, action: string, payload?: any) => {
        const executeAction = async (ignoreConflict = false) => {
            try {
                const expectedUpdatedAt = ignoreConflict ? undefined : sale.updatedAt;
                const originalData = ignoreConflict ? undefined : sale;

                if (action === 'approve') {
                    const newOrderId = payload?.txnId || `MANUAL-AUTH-${Date.now().toString().slice(-4)}`;
                    await updateSaleStatus(sale.id, 'Approved', { orderId: newOrderId, dealStage: 'Won' }, expectedUpdatedAt, originalData);
                    sfx.playSuccess();
                    setToast({ title: 'Order Update', message: `Order ${newOrderId} Authorized`, type: 'success' });
                } else if (action === 'decline') {
                    const nextStatus = payload?.sendToRecovery ? 'Declined' : 'Cancelled'; 
                    // 'Cancelled' skips the recovery engine (in this context we can treat it as permanently closed if they uncheck it)
                    // If they want it in recovery engine, status needs to be Declined.
                    await updateSaleStatus(sale.id, nextStatus as any, { declineReason: payload?.reason || 'Administrative Decline', dealStage: 'Lost' }, expectedUpdatedAt, originalData);
                    sfx.playDecline();
                    setToast({ title: 'Order Update', message: 'Order Marked as Declined', type: 'warning' });
                } else if (action === 'qa') {
                    await updateSaleStatus(sale.id, sale.status, { qaScore: payload?.qaScore, qaNotes: payload?.qaNotes }, expectedUpdatedAt, originalData);
                    sfx.playSuccess();
                    setToast({ title: 'QA Update', message: 'Scorecard Saved', type: 'success' });
                } else if (action === 'upload') {
                    await updateSale(sale.id, { audioUrl: payload.audioUrl }, expectedUpdatedAt, originalData);
                    if (payload.audioUrl === null) {
                        sfx.playDecline();
                        setToast({ title: 'Audio Management', message: 'Audio Purged', type: 'info' });
                    } else {
                        sfx.playConfirm();
                        setToast({ title: 'Audio Management', message: 'Audio Synced', type: 'success' });
                    }
                } else if (action === 'update') {
                    await updateSale(sale.id, payload, expectedUpdatedAt, originalData);
                    sfx.playConfirm();
                    setToast({ title: 'Ledger Update', message: 'Record Updated Successfully', type: 'success' });
                } else if (action === 'delete') {
                    await deleteSale(sale.id);
                    sfx.playDecline();
                    setToast({ title: 'Ledger Update', message: 'Record Permanently Removed', type: 'info' });
                } else if (action === 'flag') {
                    const newLabel = sale.adminLabel === 'Administrative Review' ? null : 'Administrative Review';
                    await updateSale(sale.id, { adminLabel: newLabel || undefined }, expectedUpdatedAt, originalData);
                    sfx.playClick();
                    setToast({ title: 'Ledger Update', message: newLabel ? 'Record Flagged for Review' : 'Flag Removed', type: 'info' });
                } else if (action === 'tracking') {
                    if (payload?.trackingId) {
                        await updateSale(sale.id, { trackingId: payload.trackingId, deliveryStatus: 'Shipped' }, expectedUpdatedAt, originalData);
                        sfx.playSuccess();
                        setToast({ title: 'Logistics', message: `Tracking ID ${payload.trackingId} Assigned`, type: 'success' });
                    }
                }
                setConflict(null);
            } catch (err: any) {
                if (err && err.name === 'ConflictError') {
                    setConflict({
                        isOpen: true,
                        itemName: `Sale for ${sale.customer}`,
                        conflicts: err.conflicts,
                        onOverwrite: () => executeAction(true),
                        onReload: () => {
                            setConflict(null);
                            setToast({ title: 'Conflict Resolved', message: 'Record reloaded with latest data.', type: 'info' });
                        }
                    });
                } else {
                    console.error("Action failed:", err);
                    setToast({ title: 'Error', message: 'Operation failed. Please try again.', type: 'error' });
                }
            }
        };

        await executeAction();
    };

    const handleBulkLedgerAction = async (ids: string[], action: string) => {
        if (action === 'delete') {
            // if (confirm(`Permanently delete ${ids.length} records?`)) {
                await bulkDeleteSales(ids);
                sfx.playDecline();
            // }
        } else if (action === 'Approved' || action === 'Declined') {
            await bulkUpdateSales(ids, { status: action as any });
            sfx.playSuccess();
        }
    };

    return {
        currentUser, view, setView, showTerminals, setShowTerminals, showCalculator, setShowCalculator,
        showScratchpad, setShowScratchpad, isSuperAdmin, isAllowed, allowedTabs,
        sales, users, notes, health, notifications, clearNotification, productConfig, updateProductConfig,
        systemConfig, updateSystemConfig, updateUser, addUser, 
        importSales, 
        sendDirective,
        runDiagnostic, testUplink, handleLedgerAction, handleBulkLedgerAction, setToast,
        conflict, setConflict
    };
};
