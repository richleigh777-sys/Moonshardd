
import React from 'react';
import { 
    Database, Search, Filter, FileSpreadsheet, Upload, 
    Settings2, RefreshCw, Zap, LayoutList, AlignJustify, Map as MapIcon
} from 'lucide-react';
import { Card, Button } from '../../ui/Base';
import { sfx } from '../../../lib/soundService';

import { useCRM } from '../../../hooks/useCRM';

interface LedgerHeaderProps {
    summary: { count: number; total: number; approved: number; pending: number; };
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onToggleFilters: () => void;
    showFilters: boolean;
    onExportFulfillment: () => void;
    onExportPayroll: () => void;
    onConfig: () => void;
    onTemplate?: () => void;
    onImport: () => void;
    importAvailable: boolean;
    density: 'compact' | 'comfortable';
    setDensity: (d: 'compact' | 'comfortable') => void;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    allowActions?: boolean;
}

export const LedgerHeader: React.FC<LedgerHeaderProps> = React.memo(({ 
    summary, searchTerm, onSearchChange, onToggleFilters, showFilters, 
    onExportFulfillment, onExportPayroll, onConfig, onImport, importAvailable,
    density, setDensity, isRefreshing, onRefresh, allowActions = false
}) => {
    const { currentUser } = useCRM();
    const isSuperAdmin = (currentUser?.level || currentUser?.accessLevel || 0) >= 10;
    
    const handleRefresh = () => {
        if(onRefresh) {
            sfx.playClick();
            onRefresh();
        }
    };

    return (
        <Card variant="panel" className="p-4 border-border-subtle bg-surface-main/95 backdrop-blur-xl flex flex-col xl:flex-row justify-between items-center gap-6 relative overflow-hidden shrink-0 shadow-2xl z-20">
            {/* Ambient Refraction Line */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent-primary to-indigo-600 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            
            {/* Left: Branding & Stats */}
            <div className="flex items-center gap-6 w-full xl:w-auto">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-primary/10 rounded-2xl text-accent-primary border border-accent-primary/20 shadow-neon relative group cursor-help transition-transform hover:scale-105">
                        <Database size={22} strokeWidth={2.5}/>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse ring-2 ring-surface-main"></div>
                    </div>
                    <div className="hidden sm:block">
                        <h2 className="text-base font-[700]  tracking-tight text-text-primary flex items-center gap-2">
                            Sales Ledger <span className="text-xs font-bold px-3 py-1.5 rounded bg-surface-alt border border-border-subtle text-text-muted tracking-wider">V5.0</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-0.5">
                            <p className="text-xs font-bold text-text-muted  tracking-wider">
                                {summary.count.toLocaleString()} Records 
                            </p>
                            <div className="h-3 w-px bg-border-subtle"></div>
                            <span className="text-xs font-[700] text-status-success flex items-center gap-1">
                                <Zap size={16} fill="currentColor"/> {summary.approved} Auth
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="flex items-center gap-2 flex-1 xl:flex-none">
                    <div className="relative group w-full sm:w-[320px] transition-all focus-within:w-full sm:focus-within:w-[360px]">
                        <div className="absolute inset-0 bg-accent-primary/5 rounded-xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-primary transition-colors" />
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            value={searchTerm} 
                            onChange={e => onSearchChange(e.target.value)} 
                            placeholder="Search Data Stream..." 
                            className="w-full bg-surface-alt/50 border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:border-accent-primary focus:bg-surface-main transition-all shadow-inner placeholder:text-text-muted/50"
                        />
                    </div>
                    <Button variant="secondary" onClick={onToggleFilters} className={`h-10 w-10 p-0 flex items-center justify-center border-border-subtle transition-all rounded-xl ${showFilters ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/20' : 'bg-surface-alt text-text-muted hover:text-text-primary hover:bg-surface-main'}`}>
                        <Filter size={16}/>
                    </Button>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 w-full xl:w-auto justify-end">
                {/* Refresh */}
                <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`p-2.5 rounded-xl border border-border-subtle bg-surface-alt/30 text-text-muted hover:text-accent-primary hover:border-accent-primary/30 transition-all active:scale-95 ${isRefreshing ? 'animate-spin cursor-not-allowed opacity-50' : ''}`}
                    title="Refresh Data"
                >
                    <RefreshCw size={16} />
                </button>

                {/* Density */}
                <div className="flex bg-surface-alt/50 p-1 rounded-xl border border-border-subtle">
                    <button 
                        onClick={() => { setDensity('comfortable'); sfx.playClick(); }}
                        className={`p-2 rounded-lg transition-all ${density === 'comfortable' ? 'bg-surface-main text-text-primary shadow-sm ring-1 ring-black/5' : 'text-text-muted hover:text-text-primary'}`}
                        title="Comfortable"
                    >
                        <LayoutList size={16}/>
                    </button>
                    <button 
                        onClick={() => { setDensity('compact'); sfx.playClick(); }}
                        className={`p-2 rounded-lg transition-all ${density === 'compact' ? 'bg-surface-main text-text-primary shadow-sm ring-1 ring-black/5' : 'text-text-muted hover:text-text-primary'}`}
                        title="Compact"
                    >
                        <AlignJustify size={16}/>
                    </button>
                </div>

                <div className="w-px h-6 bg-border-subtle mx-1"></div>

                {importAvailable && (
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={onImport} className="h-10 px-4 text-xs font-[700]  tracking-widest border-border-subtle hover:border-accent-primary/30 bg-surface-alt/30">
                            <Upload size={16} className="mr-2"/> Import
                        </Button>
                    </div>
                )}
                
                {allowActions && isSuperAdmin && (
                    <div className="flex items-center gap-2">
                        <Button variant="primary" onClick={onExportFulfillment} className="h-10 px-4 text-xs font-[700]  tracking-widest shadow-lg shadow-emerald-500/20 bg-gradient-to-r from-emerald-500 to-teal-600 border border-border-subtle hover:brightness-110 active:scale-95 rounded-xl">
                            <FileSpreadsheet size={16} className="mr-2"/> fulfillment
                        </Button>
                        <Button variant="primary" onClick={onExportPayroll} className="h-10 px-4 text-xs font-[700]  tracking-widest shadow-lg shadow-accent-primary/20 bg-gradient-to-r from-purple-500 to-indigo-600 border border-border-subtle hover:brightness-110 active:scale-95 rounded-xl">
                            <Database size={16} className="mr-2"/> payroll
                        </Button>
                    </div>
                )}
                
                <button onClick={onConfig} className="p-2.5 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors ml-1">
                    <Settings2 size={18}/>
                </button>
            </div>
        </Card>
    );
});
