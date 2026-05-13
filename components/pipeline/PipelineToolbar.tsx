
import React from 'react';
import { Search, Eye, EyeOff, Zap, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Base';
import { sfx } from '../../lib/soundService';

interface PipelineToolbarProps {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    sortMode: 'value' | 'date' | 'urgency';
    setSortMode: (m: 'value' | 'date' | 'urgency') => void;
    focusMode: boolean;
    setFocusMode: (f: boolean) => void;
    viewOwn: boolean;
    setViewOwn: (v: boolean) => void;
    isOptimizing: boolean;
    onRunOptimizer: () => void;
    stats: { totalValue: number; totalCount: number; avgValue: number };
}

export const PipelineToolbar: React.FC<PipelineToolbarProps> = ({
    searchQuery, setSearchQuery, sortMode, setSortMode, focusMode, setFocusMode,
    viewOwn, setViewOwn, isOptimizing, onRunOptimizer, stats
}) => {
    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 px-2 py-3 border-b border-border-subtle bg-surface-main/50 backdrop-blur-md sticky top-0 z-30 mb-4 rounded-xl">
            <div className="flex items-center gap-4 w-full xl:w-auto">
                <div className="relative flex-1 xl:flex-none xl:w-64 group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors"/>
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search deals..."
                        className="w-full bg-surface-alt border border-border-subtle rounded-xl py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-accent-primary transition-all shadow-inner"
                    />
                </div>
                
                <div className="flex bg-surface-alt p-1 rounded-xl border border-border-subtle shadow-inner">
                    {(['value', 'date', 'urgency'] as const).map(m => (
                        <button 
                            key={m}
                            onClick={() => { setSortMode(m); sfx.playClick(); }}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${sortMode === m ? 'bg-surface-main text-text-primary shadow-sm ring-1 ring-border-subtle' : 'text-text-muted hover:text-text-primary'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-auto justify-between xl:justify-end">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => { setFocusMode(!focusMode); sfx.playClick(); }}
                        className={`p-2 rounded-xl border transition-all ${focusMode ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'bg-surface-alt border-border-subtle text-text-muted hover:text-text-primary'}`}
                        title="Toggle Focus Mode"
                    >
                        {focusMode ? <Eye size={16}/> : <EyeOff size={16}/>}
                    </button>
                    
                    <button 
                        onClick={() => { setViewOwn(!viewOwn); sfx.playClick(); }}
                        className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${viewOwn ? 'bg-surface-main text-text-primary border-accent-primary shadow-sm' : 'bg-surface-alt text-text-muted border-border-subtle hover:text-text-primary'}`}
                    >
                        {viewOwn ? 'My Deals' : 'All Deals'}
                    </button>

                    <Button 
                        variant="glow" 
                        onClick={onRunOptimizer}
                        isLoading={isOptimizing}
                        className="h-9 px-4 text-[10px] uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 border-indigo-500/50"
                    >
                        <Zap size={12} className="mr-2 fill-current"/> Optimize
                    </Button>
                </div>

                <div className="h-8 w-px bg-border-subtle mx-2 hidden xl:block"></div>

                <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Pipeline Value</span>
                    <span className="text-sm font-black text-emerald-500 num-font flex items-center gap-1">
                        <Activity size={12}/> ${stats.totalValue.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};
