import React, { useState, useEffect } from 'react';
import { Sale, PipelineStage } from '../../types';
import { PIPELINE_STAGES } from '../../constants';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { useNexusOptimizer } from '../../hooks/useNexusOptimizer';
import { PipelineToolbar } from './PipelineToolbar';
import { useInfiniteCollection } from '../../hooks/useInfiniteCollection';
import { PipelineColumn } from './PipelineColumn';
import { usePipelineDrag } from './usePipelineDrag';
import { usePipelineData } from './usePipelineData';
import { Loader } from 'lucide-react';

interface PipelineBoardProps {
    sales: Sale[];
    onStageChange?: (saleId: string, newStage: PipelineStage) => void;
    onProcessSale?: (sale: Sale) => void; 
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ sales: propSales, onStageChange, onProcessSale }) => {
    const { currentUser, updateSaleStatus } = useCRM();
    const { setToast } = useSystem();
    
    const { data: serverSales, loading,   } = useInfiniteCollection('sales', {});
    const baseSales = serverSales.length > 0 ? serverSales : propSales;

    // Optimistic UI State
    const [optimisticSales, setOptimisticSales] = useState<Sale[]>(baseSales);

    useEffect(() => {
        setOptimisticSales(baseSales);
    }, [baseSales]);

    const {
        searchQuery, setSearchQuery, sortMode, setSortMode, focusMode, setFocusMode,
        viewOwn, setViewOwn, pipelineData
    } = usePipelineData(optimisticSales, currentUser?.id);

    const { isOptimizing, executeCorrection } = useNexusOptimizer(optimisticSales);

    const handleRunOptimizer = async () => {
      const count = await executeCorrection();
      setToast({ 
        title: 'Nexus Optimizer',
        message: count > 0 ? `Nexus Optimized: ${count} leads re-mapped.` : "Nexus Integrity Nominal. No corrections needed.", 
        type: count > 0 ? 'success' : 'info' 
      });
    };

    const handleOptimisticDrop = (saleId: string, stage: PipelineStage) => {
        const sale = optimisticSales.find(s => s.id === saleId);
        if (!sale) return;

        // Optimistic UI updates for database mutations
        setOptimisticSales(prev => prev.map(s => s.id === saleId ? { ...s, pipelineStatus: stage } : s));

        if (onStageChange) {
            onStageChange(saleId, stage);
        } else {
            let systemNotesUpdate = '';
            if (stage === 'Closed Lost') {
                systemNotesUpdate = ((sale as any)?.systemNotes ? (sale as any).systemNotes + '\n' : '') + 'Automatically enrolled in 30-Day Recovery Drip Campaign.';
                setToast({ title: 'Automation', message: 'Added to Recovery Drip Campaign', type: 'info' });
            }
            updateSaleStatus(saleId, stage === 'Closed Won' ? 'Approved' : 'Pending', { pipelineStatus: stage, ...(systemNotesUpdate ? { systemNotes: systemNotesUpdate } as any : {}) });
        }
    };

    const {
        dragOverStage,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop
    } = usePipelineDrag(optimisticSales, handleOptimisticDrop);

    return (
        <div className="flex flex-col h-full min-h-0 animate-in fade-in duration-500 pb-2 relative">
            <PipelineToolbar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortMode={sortMode}
                setSortMode={setSortMode}
                focusMode={focusMode}
                setFocusMode={setFocusMode}
                viewOwn={viewOwn}
                setViewOwn={setViewOwn}
                isOptimizing={isOptimizing}
                onRunOptimizer={handleRunOptimizer}
                stats={{ totalValue: 0, totalCount: optimisticSales.length, avgValue: 0 }}
            />

            {loading && baseSales.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader size={32} className="animate-spin text-accent-primary opacity-50 mb-4" />
                    <p className="text-text-muted font-bold tracking-widest text-sm">LOADING PIPELINE...</p>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 relative z-10 px-4 md:px-0">
                    <div className="flex gap-4 h-full min-w-max px-2">
                        {PIPELINE_STAGES.map(stage => (
                            <PipelineColumn
                                key={stage}
                                stage={stage}
                                sales={pipelineData[stage]?.sales || []}
                                totalValue={pipelineData[stage]?.total || 0}
                                focusMode={focusMode}
                                isDragOver={dragOverStage === stage}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDragStart={handleDragStart}
                                onProcessSale={onProcessSale}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
