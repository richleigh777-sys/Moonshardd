import { useCallback } from 'react';
import { Customer } from '../../types';
import { nexusGateway } from '../../nexus/adapters/DataGateway';

export const useCrmDataHealth = (
    dataHealthReports: any[],
    customers: Customer[]
) => {
    const executeDataHealthAction = useCallback(async (reportId: string, actionId: string) => {
        const report = dataHealthReports.find(r => r.id === reportId);
        if (!report) return;
        const action = report.actions.find((a: any) => a.id === actionId);
        if (!action) return;
        
        try {
            if (action.type === 'flag_user') {
                await nexusGateway.update('users', action.targetId, { active: false, status: 'inactive' });
            } else if (action.type === 'merge_contact') {
                const targetCustomer = customers.find(c => c.id === action.targetId);
                const mergeIntoCustomer = customers.find(c => c.id === action.metadata?.mergeIntoId);
                
                if (targetCustomer && mergeIntoCustomer) {
                    await nexusGateway.update('customers', mergeIntoCustomer.id, {
                        ltv: (mergeIntoCustomer.ltv || 0) + (targetCustomer.ltv || 0)
                    });
                    await nexusGateway.delete('customers', targetCustomer.id);
                }
            }

            const updatedApproved = [...(report.approvedActions || []), action.id];
            const newStatus = updatedApproved.length === report.actions.length ? 'approved' : 'partially_approved';
            await nexusGateway.update('dataHealthReports', report.id, { 
                approvedActions: updatedApproved,
                status: newStatus 
            });
        } catch (e) {
            console.error("Action execution failed", e);
        }
    }, [dataHealthReports, customers]);

    const executeFullDataHealthReport = useCallback(async (reportId: string) => {
        const report = dataHealthReports.find(r => r.id === reportId);
        if (!report || report.status === 'approved') return;
        
        for (const action of report.actions) {
            if (!report.approvedActions?.includes(action.id)) {
                if (action.type === 'flag_user') {
                    await nexusGateway.update('users', action.targetId, { active: false, status: 'inactive' });
                } else if (action.type === 'merge_contact') {
                    const targetCustomer = customers.find(c => c.id === action.targetId);
                    const mergeIntoCustomer = customers.find(c => c.id === action.metadata?.mergeIntoId);
                    if (targetCustomer && mergeIntoCustomer) {
                        await nexusGateway.delete('customers', targetCustomer.id);
                    }
                }
            }
        }

        await nexusGateway.update('dataHealthReports', report.id, { 
            approvedActions: report.actions.map((a: any) => a.id),
            status: 'approved',
            executionTime: Date.now()
        });
    }, [dataHealthReports, customers]);

    const undoDataHealthAction = useCallback(async (reportId: string, actionId: string) => {
        const report = dataHealthReports.find(r => r.id === reportId);
        if (!report) return;
        const action = report.actions.find((a: any) => a.id === actionId);
        if (!action) return;
        
        try {
            if (action.type === 'flag_user') {
                await nexusGateway.update('users', action.targetId, { active: true, status: 'active' });
            } 

            const updatedApproved = report.approvedActions?.filter((id: string) => id !== action.id) || [];
            const newStatus = updatedApproved.length === 0 ? 'undone' : 'partially_approved';
            
            await nexusGateway.update('dataHealthReports', report.id, { 
                approvedActions: updatedApproved,
                status: newStatus 
            });
        } catch (e) {
            console.error("Action undo failed", e);
        }
    }, [dataHealthReports]);

    return {
        executeDataHealthAction,
        executeFullDataHealthReport,
        undoDataHealthAction
    };
};
