
import { useState, useCallback } from 'react';
import { Sale, PipelineStage } from '../../types';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { sfx } from '../../lib/soundService';

export const usePipelineDrag = (
    sales: Sale[], 
    onStageChange?: (saleId: string, newStage: PipelineStage) => void
) => {
    const { updateSaleStatus } = useCRM();
    const { setToast, triggerMoneyRain } = useSystem();
    const [dragOverStage, setDragOverStage] = useState<string | null>(null);

    const handleDragStart = useCallback((e: React.DragEvent, saleId: string) => {
        e.dataTransfer.setData('saleId', saleId);
        e.dataTransfer.effectAllowed = 'move';
        sfx.playHover();
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, stage: string) => {
        e.preventDefault();
        if (dragOverStage !== stage) {
            setDragOverStage(stage);
        }
    }, [dragOverStage]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, stage: PipelineStage) => {
        e.preventDefault();
        setDragOverStage(null);
        const saleId = e.dataTransfer.getData('saleId');
        
        if (saleId) {
            const sale = sales.find(s => s.id === saleId);
            
            if (sale && sale.pipelineStatus !== stage) {
                if (onStageChange) {
                    onStageChange(saleId, stage);
                } else {
                    // Smart Status Update Logic
                    let newStatus: Sale['status'] = 'Pending';
                    if (stage === 'Closed Won') newStatus = 'Approved';
                    else if (sale.status === 'Rescue In Progress') newStatus = 'Pending';
                    else if (sale.status === 'Cancelled') newStatus = 'Pending';

                    updateSaleStatus(saleId, newStatus, { pipelineStatus: stage });
                }
                
                if (stage === 'Closed Won') {
                    sfx.playSuccess();
                    triggerMoneyRain();
                    setToast({ title: 'Pipeline', message: `Deal Closed! Great work.`, type: 'success' });
                } else {
                    sfx.playSubmit();
                    setToast({ title: 'Pipeline', message: `Deal moved to ${stage}`, type: 'success' });
                }
            }
        }
    }, [onStageChange, updateSaleStatus, sales, setToast, triggerMoneyRain]);

    return {
        dragOverStage,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop
    };
};
