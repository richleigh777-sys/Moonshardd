import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    AuditEntry, SystemConfig
} from '../types';
import { nexusGateway } from '../nexus/adapters/DataGateway';
import { useAuth } from '../hooks/useAuth';
import { useCRMData } from '../hooks/useCRMData';
import { CRMContext, CRMContextType } from './CRMContextCore';

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const dataHook = useCRMData(currentUser);

    // Tenant Integrity Check
    useEffect(() => {
        if (currentUser && (currentUser.level || 0) < 10) {
            if (currentUser.serverId !== nexusGateway.activeServerId) {
                console.warn("[Security] Tenant Mismatch: Syncing Gateway to Session.");
                nexusGateway.setActiveServer(currentUser.serverId);
            }
        }
    }, [currentUser]);

    const updateSystemConfigHandler = useCallback(async (cfg: SystemConfig) => {
        await nexusGateway.update('systemConfig', 'CORE_CONFIG', cfg);
        if (currentUser) {
            await dataHook.logAudit({
                agentId: currentUser.id,
                agentName: currentUser.name,
                action: 'SYSTEM_CONFIG_UPDATED',
                details: 'Operational parameters modified.',
                module: 'SYSTEM'
            });
        }
    }, [currentUser, dataHook]);

    const [drafts, setDrafts] = useState<Record<string, any>>({});

    const updateDraft = useCallback((key: string, data: any) => {
        setDrafts(prev => ({ ...prev, [key]: data }));
    }, []);

    const clearDraft = useCallback((key: string) => {
        setDrafts(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const logAttendanceWrapper = useCallback(async (type: string, reason?: string, duration?: number) => {
        if (!currentUser) return;
        await dataHook.logAttendance(currentUser.id, currentUser.name, type, reason, duration);
    }, [currentUser, dataHook]);

    const logAuditWrapper = useCallback(async (entry: Partial<AuditEntry>) => {
        if (!currentUser) return;
        await dataHook.logAudit({
            ...entry,
            agentId: currentUser.id,
            agentName: currentUser.name
        });
    }, [currentUser, dataHook]);

    const value: CRMContextType = useMemo(() => ({
        ...dataHook,
        currentUser,
        callLogs: dataHook.callLogs,
        scripts: dataHook.scripts,
        customSheets: dataHook.customSheets,
        systemConfig: dataHook.systemConfig,
        logAttendance: logAttendanceWrapper,
        logAudit: logAuditWrapper,
        updateSystemConfig: updateSystemConfigHandler,
        accounts: dataHook.accounts,
        clearNotification: dataHook.clearNotification,
        addSheet: dataHook.addSheet,
        removeSheet: dataHook.removeSheet,
        updateSheet: dataHook.updateSheet,
        updateSheetCell: dataHook.updateSheetCell,
        addCustomer: dataHook.addCustomer,
        updateCustomer: dataHook.updateCustomer,
        deleteCustomer: dataHook.deleteCustomer,
        drafts, updateDraft, clearDraft
    }), [
        dataHook, currentUser, updateSystemConfigHandler,
        drafts, updateDraft, clearDraft, logAttendanceWrapper, logAuditWrapper
    ]);

    return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};

