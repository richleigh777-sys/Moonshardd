
import { useState } from 'react';
import { useCRM } from '../hooks/useCRM';
import { useSystem } from '../hooks/useSystem';
import { User, ProductConfig, Sale } from '../types';
import { sfx } from '../lib/soundService';
import { nexusGateway } from '../nexus/adapters/DataGateway';

export const useAdminLogic = () => {
    const { users, addUser, updateUser, sendDirective, updateProductConfig, productConfig, systemConfig } = useCRM();
    const { setToast } = useSystem();

    // -- State --
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User>>({});
    const [configForm, setConfigForm] = useState<ProductConfig>(productConfig);
    const [directiveText, setDirectiveText] = useState('');
    const [directiveUrgency, setDirectiveUrgency] = useState<'Routine' | 'Immediate' | 'Flash'>('Routine');

    // -- Handlers --

    const handleSaveUser = async () => {
        if (!editingUser.id || !editingUser.name) return;
        try {
            const existing = users.find(u => u.id === editingUser.id);
            if (existing) {
                await updateUser(editingUser.id, editingUser);
                setToast({ title: 'User Management', message: 'User Profile Updated', type: 'success' });
            } else {
                await addUser({ ...editingUser, role: editingUser.role || 'agent', active: true });
                setToast({ title: 'User Management', message: 'New Operative Onboarded', type: 'success' });
            }
            sfx.playConfirm();
            setIsUserModalOpen(false);
            setEditingUser({});
        } catch {
            sfx.playError();
            setToast({ title: 'System Error', message: 'Operation Failed', type: 'error' });
        }
    };

    const handleSendDirective = async () => {
        if (!directiveText) return;
        sfx.playSubmit();
        await sendDirective({ message: directiveText, urgency: directiveUrgency, senderName: 'Command' });
        setDirectiveText('');
        setToast({ title: 'Directive', message: 'Directive Broadcasted', type: 'success' });
    };

    const handleSaveConfig = async () => {
        sfx.playConfirm();
        await updateProductConfig(configForm);
        setToast({ title: 'System Config', message: 'System Configuration Updated', type: 'success' });
    };

    const handleBulkAction = async (selectedSales: Sale[], action: 'approve' | 'decline', payload?: any) => {
        const status = action === 'approve' ? 'Approved' : 'Declined';
        
        try {
            if (action === 'approve') sfx.playSuccess();
            else sfx.playDecline();

            const ids = selectedSales.map(s => s.id);
            const updates: any = { status };
            if (action === 'approve' && payload?.txnId) {
                updates.orderId = payload.txnId;
                updates.dealStage = 'Won';
            }
            if (action === 'decline' && payload?.reason) {
                updates.declineReason = payload.reason;
                updates.dealStage = 'Lost';
            }

            await nexusGateway.updateBulk('sales', ids, updates);

            // Message Logic
            if (selectedSales.length === 1) {
                if (action === 'approve') setToast({ title: 'Transaction', message: 'Transaction Authorized', type: 'success' });
                else setToast({ title: 'Transaction', message: 'Transaction Rejected', type: 'warning' });
            } else {
                setToast({ title: 'Bulk Operation', message: `Bulk Operation Complete: ${selectedSales.length} records updated.`, type: 'success' });
            }

        } catch {
            sfx.playError();
            setToast({ title: 'System Error', message: 'Bulk Operation Failed', type: 'error' });
        }
    };

    // New: Calculate Estimated Payroll
    const calculateEstimatedPayroll = (sales: Sale[]) => {
        const approved = sales.filter(s => s.status === 'Approved');
        const totalRev = approved.reduce((acc, s) => acc + Number(s.amount), 0);
        const baseRate = systemConfig.baseCommission / 100;
        return totalRev * baseRate;
    };

    return {
        // State
        isUserModalOpen, setIsUserModalOpen,
        editingUser, setEditingUser,
        configForm, setConfigForm,
        directiveText, setDirectiveText,
        directiveUrgency, setDirectiveUrgency,
        
        // Actions
        handleSaveUser,
        handleSendDirective,
        handleSaveConfig,
        handleBulkAction,
        calculateEstimatedPayroll
    };
};
