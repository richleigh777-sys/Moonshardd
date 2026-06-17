
import React from 'react';
import { Sale, PipelineStage } from '../../types';
import { PIPELINE_STAGES, STAGE_STYLES } from '../../constants';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { sfx } from '../../lib/soundService';
import { useNexusOptimizer } from '../../hooks/useNexusOptimizer';
import { usePipelineData } from './usePipelineData';
import { PipelineToolbar } from './PipelineToolbar';
import { Button, Badge } from '../ui/Base';
import { Search, Target, Clock } from 'lucide-react';

const formatTimeElapsed = (timestamp: number) => {
    const diffInDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (diffInDays === 0) return 'Today';
    if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} wk${diffInWeeks !== 1 ? 's' : ''} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} mo${diffInMonths !== 1 ? 's' : ''} ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} yr${diffInYears !== 1 ? 's' : ''} ago`;
};

interface PipelineBoardProps {
    sales: Sale[];
    onStageChange?: (saleId: string, newStage: PipelineStage) => void;
    onProcessSale?: (sale: Sale) => void; 
}

export const PipelineBoard: React.FC<PipelineBoardProps> = ({ sales, onStageChange, onProcessSale }) => {
    const { currentUser, updateSaleStatus } = useCRM();
    const { setToast } = useSystem();
    
    // --- OPTIMIZER HOOK ---
    const { isOptimizing, executeCorrection } = useNexusOptimizer(sales);
    
    // --- DATA LOGIC HOOK ---
    const { 
        pipelineData, stats, searchQuery, setSearchQuery, 
        sortMode, setSortMode, focusMode, setFocusMode,
        viewOwn, setViewOwn
    } = usePipelineData(sales, currentUser?.id);

    const handleRunOptimizer = async () => {
      const count = await executeCorrection();
      setToast({ 
        title: 'Nexus Optimizer',
        message: count > 0 ? `Nexus Optimized: ${count} leads re-mapped.` : "Nexus Integrity Nominal. No corrections needed.", 
        type: count > 0 ? 'success' : 'info' 
      });
    };

    const handleStageUpdate = (saleId: string, value: PipelineStage) => {
        const sale = sales.find(s => s.id === saleId);
        if (sale) {
            // --- Pipeline Gatekeepers / Validation Logic ---
            const errors: string[] = [];
            
            if (value === 'Closed Won') {
                if (!sale.product || !sale.amount) errors.push('Product Info');
                if (!sale.cardNumber || !sale.cardExpiry || !sale.cardCvv) errors.push('Billing Info');
                if (!sale.dob || !sale.height || !sale.weight) errors.push('Medical Profile');
            }
            
            if (value === 'Rebuttal') {
                if (!sale.objectionType && !sale.declineReason) errors.push('Objection Status');
            }

            if (errors.length > 0) {
                sfx.playError();
                setToast({ title: 'Validation Failed', message: `Cannot move to ${value}. Missing: ${errors.join(', ')}`, type: 'error' });
                return;
            }
            // --- End Validation ---
            
            sfx.playSubmit();
        }

        if (onStageChange) onStageChange(saleId, value);
        else {
            let systemNotesUpdate = '';
            if (value === 'Closed Lost') {
                systemNotesUpdate = ((sale as any)?.systemNotes ? (sale as any).systemNotes + '\n' : '') + 'Automatically enrolled in 30-Day Recovery Drip Campaign.';
                setToast({ title: 'Automation', message: 'Added to Recovery Drip Campaign', type: 'info' });
            }
            updateSaleStatus(saleId, 'Pending', { pipelineStatus: value, ...(systemNotesUpdate ? { systemNotes: systemNotesUpdate } as any : {}) });
        }
    };

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
                stats={stats}
            />

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 px-2 md:px-0">
                <div className="max-w-6xl mx-auto space-y-8 pb-12">
                    {PIPELINE_STAGES.map(stage => {
                        const stageInfo = pipelineData[stage];
                        if (!stageInfo || stageInfo.sales.length === 0) return null;
                        const style = STAGE_STYLES[stage] || STAGE_STYLES['New Order'];
                        const Icon = style.icon;

                        return (
                            <div key={stage} className="relative animate-in slide-in-from-bottom-4">
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`p-2 rounded-xl ${style.bg} ${style.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">{style.label}</h3>
                                    <div className="flex gap-2 items-center">
                                        <Badge status="High" className="bg-surface-highlight text-white font-mono">{stageInfo.sales.length}</Badge>
                                        <span className="text-sm font-bold text-status-success font-mono hidden sm:inline-block">${stageInfo.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex-1 border-b border-border-subtle ml-4"></div>
                                </div>

                                {/* Table-like List */}
                                <div className="bg-surface-main/30 backdrop-blur-md border border-border-subtle rounded-xl overflow-hidden shadow-2xl">
                                    <div className="grid grid-cols-12 gap-4 border-b border-border-subtle bg-black/20 p-4 text-xs font-[700]  tracking-widest text-text-muted hidden md:grid">
                                        <div className="col-span-4 lg:col-span-3">Customer</div>
                                        <div className="col-span-3 lg:col-span-2">Value & Product</div>
                                        <div className="col-span-3 lg:col-span-3">Lifecycle Stage</div>
                                        <div className="col-span-2 lg:col-span-4 text-right">Actions</div>
                                    </div>

                                    <div className="flex flex-col divide-y divide-white/5">
                                        {stageInfo.sales.map(sale => (
                                            <div key={sale.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-transparent hover:bg-surface-highlight p-4 transition-all group">
                                                
                                                {/* Customer */}
                                                <div className="col-span-4 lg:col-span-3 flex flex-col justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white truncate cursor-pointer hover:text-accent-secondary transition-colors" onClick={() => onProcessSale?.(sale)}>
                                                            {sale.customer || 'Unknown Lead'}
                                                        </span>
                                                        {sale.status === 'Declined' && <Badge status="Critical" className="scale-75 origin-left">Failed</Badge>}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-0.5">
                                                        <span className="truncate">{sale.phone || 'No Phone'}</span>
                                                        &bull;
                                                        <span className=" tracking-wider text-text-muted/70">{sale.agent ? `${sale.agent}` : 'Unassigned'}</span>
                                                        &bull;
                                                        <span className="flex items-center gap-1 text-status-success/80 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded shadow-sm">
                                                            <Clock size={10} /> {formatTimeElapsed(sale.timestamp)} 
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Value/Product */}
                                                <div className="col-span-3 lg:col-span-2 flex flex-col justify-center">
                                                    <span className="text-sm font-bold font-mono text-status-success">
                                                        ${sale.amount || 0}
                                                    </span>
                                                    <span className="text-xs text-text-muted truncate mt-0.5">
                                                        {sale.product || 'No Product'}
                                                    </span>
                                                </div>

                                                {/* Status Selector */}
                                                <div className="col-span-3 lg:col-span-3 flex items-center mt-2 md:mt-0">
                                                    <select
                                                        value={sale.pipelineStatus || 'New Order'}
                                                        onChange={(e) => handleStageUpdate(sale.id, e.target.value as PipelineStage)}
                                                        className="bg-surface-alt border border-border-subtle hover:border-border-strong focus:border-indigo-500 rounded-lg text-xs font-bold text-text-primary px-3 py-2 w-full max-w-[200px] outline-none transition-colors appearance-none cursor-pointer"
                                                    >
                                                        {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>

                                                {/* Actions */}
                                                <div className="col-span-2 lg:col-span-4 flex items-center justify-end gap-2 mt-4 md:mt-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" className="h-8 md:px-3 bg-accent-secondary/10 text-accent-secondary hover:bg-indigo-500 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5" onClick={() => onProcessSale?.(sale)}>
                                                        <Target size={14} /> <span className="hidden lg:inline">Process</span>
                                                    </Button>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!sales.length && (
                        <div className="h-64 flex flex-col items-center justify-center opacity-50 m-4">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center mb-4 text-white/50">
                                <Search size={24} />
                            </div>
                            <p className="text-sm font-bold text-white  tracking-widest">No Active Customers</p>
                            <p className="text-xs text-text-muted mt-2">Pipeline is empty. Start dialing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
