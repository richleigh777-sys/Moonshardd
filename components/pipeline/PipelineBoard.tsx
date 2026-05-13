
import React from 'react';
import { Sale, PipelineStage } from '../../types';
import { PIPELINE_STAGES } from '../../constants';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { useNexusOptimizer } from '../../hooks/useNexusOptimizer';
import { usePipelineData } from './usePipelineData';
import { PipelineToolbar } from './PipelineToolbar';
import { PipelineColumn } from './PipelineColumn';
import { usePipelineDrag } from './usePipelineDrag';

interface PipelineBoardProps {
    sales: Sale[];
    onStageChange?: (saleId: string, newStage: PipelineStage) => void;
    onProcessSale?: (sale: Sale) => void; 
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ sales, onStageChange, onProcessSale }) => {
    const { currentUser } = useCRM();
    const { setToast } = useSystem();
    
    // --- OPTIMIZER HOOK ---
    const { isOptimizing, executeCorrection } = useNexusOptimizer(sales);
    
    // --- DATA LOGIC HOOK ---
    const { 
        pipelineData, stats, searchQuery, setSearchQuery, 
        sortMode, setSortMode, focusMode, setFocusMode,
        viewOwn, setViewOwn
    } = usePipelineData(sales, currentUser?.id);

    // --- DRAG LOGIC HOOK ---
    const {
        dragOverStage, handleDragStart, handleDragOver, handleDragLeave, handleDrop
    } = usePipelineDrag(sales, onStageChange);

    const handleRunOptimizer = async () => {
      const count = await executeCorrection();
      setToast({ 
        title: 'Nexus Optimizer',
        message: count > 0 ? `Nexus Optimized: ${count} leads re-mapped.` : "Nexus Integrity Nominal. No corrections needed.", 
        type: count > 0 ? 'success' : 'info' 
      });
    };

    return (
        <div className="flex flex-col h-full min-h-0 animate-in fade-in duration-500 pb-2">
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
                stats={stats}
            />

            <div className="flex flex-1 overflow-x-auto gap-4 pb-4 custom-scrollbar min-h-0 snap-x px-2">
                {PIPELINE_STAGES.map((stage) => (
                    <PipelineColumn 
                        key={stage}
                        stage={stage}
                        sales={pipelineData[stage].sales}
                        totalValue={pipelineData[stage].total}
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
    );
};
