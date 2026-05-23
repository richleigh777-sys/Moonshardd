
import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Zap, Terminal, Crosshair, Hash } from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { ScriptType, ScriptItem } from '../../types';
import { sfx } from '../../lib/soundService';

export const AgentScriptHub: React.FC = () => {
    const { scripts } = useCRM();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState<ScriptType | 'All'>('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        return scripts.filter(s => {
            const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 s.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = activeType === 'All' || s.type === activeType;
            return matchesSearch && matchesType && s.active;
        });
    }, [scripts, searchTerm, activeType]);

    const activeScript = useMemo(() => {
        return scripts.find(s => s.id === selectedScriptId) || filtered[0] || null;
    }, [scripts, selectedScriptId, filtered]);

    const handleCopy = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        sfx.playConfirm();
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSelect = (script: ScriptItem) => {
        setSelectedScriptId(script.id);
        sfx.playClick();
    };

    return (
        <div className="flex flex-col h-full bg-surface-main/90 rounded-[1.25rem] border border-border-subtle shadow-panel overflow-hidden relative font-mono backdrop-blur-3xl group">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
            <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/5 via-transparent to-accent-primary/5 dark:from-emerald-500/10 dark:to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            {/* Header */}
            <div className="p-4 border-b border-border-subtle bg-surface-highlight/80  flex flex-col md:flex-row md:justify-between md:items-center gap-4 backdrop-blur-md shrink-0 relative z-20">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-status-success/10 rounded-lg flex items-center justify-center text-status-success border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Terminal size={18} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h3 className="text-sm font-[700] text-text-primary  tracking-widest drop-shadow-md">
                            Sales Script Terminal
                        </h3>
                        <p className="text-[10px] font-bold text-text-muted  tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)] dark:shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                            Secure Comms Link Active
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative group w-full sm:w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-emerald-600 dark:group-focus-within:text-status-success transition-colors">
                            <Search size={14} />
                        </div>
                        <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                            placeholder="QUERY DATABANKS..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-alt border border-border-subtle rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-status-success outline-none focus:border-status-success/50 focus:bg-surface-highlight0 dark:focus:bg-surface-highlight transition-all placeholder:text-text-muted dark:placeholder:text-gray-600  tracking-wider drop-shadow-sm"
                        />
                    </div>
                    <div className="flex gap-1 bg-surface-alt p-1 rounded-lg border border-border-subtle overflow-x-auto scrollbar-hide">
                        {(['All', 'Sales', 'Rebuttal', 'FollowUp', 'Rescue'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => { setActiveType(type); sfx.playClick(); }}
                                className={`px-3 py-1.5 rounded text-[10px] font-[700]  tracking-widest transition-all whitespace-nowrap ${
                                    activeType === type 
                                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border border-status-success/30 text-status-success shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                                    : 'text-text-muted hover:text-text-primary dark:hover:text-text-primary hover:bg-surface-highlight'
                                }`}
                            >
                                {type === 'All' ? '*' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative z-10 flex-col md:flex-row bg-transparent">
                {/* Left Side: Directory List */}
                <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-border-subtle bg-transparent flex flex-col shrink-0">
                    <div className="p-3 border-b border-border-subtle bg-surface-alt text-[10px] font-[700] tracking-widest  flex items-center justify-between text-text-muted shadow-inner">
                        <span className="drop-shadow-sm">Directory Listing</span>
                        <span className="drop-shadow-sm">{filtered.length} Objects</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                        {filtered.map(script => (
                            <button 
                                key={script.id}
                                onClick={() => handleSelect(script)}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative group overflow-hidden ${
                                    activeScript?.id === script.id 
                                    ? 'bg-status-success/10 border-status-success/30 shadow-[inset_4px_0_0_#10b981]' 
                                    : 'bg-surface-alt border-border-subtle hover:border-border-strong hover:bg-surface-highlight'
                                }`}
                            >
                                <div className="flex justify-between items-start w-full relative z-10">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Hash size={12} className={activeScript?.id === script.id ? 'text-status-success drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'text-text-muted group-hover:text-text-primary dark:group-hover:text-text-muted'} />
                                        <span className={`text-[11px] font-bold  truncate tracking-wider drop-shadow-sm ${activeScript?.id === script.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                                            {script.title}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 relative z-10">
                                    <span className={`text-[9px] font-[700]  tracking-[0.2em] px-1.5 py-0.5 rounded border ${
                                        script.type === 'Rebuttal' ? 'bg-status-error/10 border-status-error/30 text-red-600 dark:text-status-error shadow-[0_0_8px_rgba(239,68,68,0.15)]' : 
                                        script.type === 'Sales' ? 'bg-status-success/10 border-status-success/30 text-status-success shadow-[0_0_8px_rgba(16,185,129,0.15)]' :
                                        'bg-blue-50 dark:bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                                    }`}>
                                        {script.type}
                                    </span>
                                    <span className="text-[10px] text-text-muted flex items-center gap-1 font-mono hover:text-text-primary dark:hover:text-text-muted transition-colors">
                                        <Zap size={10} /> {script.usageCount} uses
                                    </span>
                                </div>
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-text-muted dark:text-gray-600 text-center">
                                <Search size={24} className="mb-2 opacity-50 drop-shadow-sm" />
                                <p className="text-[10px]  tracking-widest drop-shadow-sm">No matching records found in databanks.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Script Viewer */}
                <div className="flex-1 flex flex-col bg-transparent min-w-0 relative">
                    {activeScript ? (
                        <>
                            <div className="p-4 md:p-6 border-b border-border-subtle flex justify-between items-start bg-surface-highlight/30 dark:bg-black/20 shadow-inner">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crosshair size={14} className="text-status-success drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] font-[700] text-text-muted  tracking-widest drop-shadow-sm font-mono">Target Payload: {activeScript.id.substring(0,8)}</span>
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-[700] text-text-primary  tracking-tight drop-shadow-md">
                                        {activeScript.title}
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => handleCopy(activeScript.id, activeScript.content)}
                                    className={`flex items-center gap-2 px-4 py-2 text-xs font-[700]  tracking-wider rounded-lg border transition-all shadow-sm ${
                                        copiedId === activeScript.id 
                                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-status-success border-status-success/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                                        : 'bg-surface-alt text-text-secondary border-border-subtle hover:bg-surface-highlight hover:text-text-primary'
                                    }`}
                                >
                                    {copiedId === activeScript.id ? <><Check size={14} strokeWidth={3}/> ACCESSED</> : <><Copy size={14}/> EXTRACT</>}
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                                <div className="bg-surface-alt border border-border-subtle rounded-2xl p-6 relative group overflow-hidden shadow-inner">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30 group-hover:bg-emerald-500/50 transition-colors"></div>
                                    <div className="whitespace-pre-wrap text-text-secondary text-sm md:text-base leading-relaxed font-sans drop-shadow-sm">
                                        {activeScript.content}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-text-muted dark:text-gray-600 p-8 text-center drop-shadow-sm">
                            <Terminal size={48} strokeWidth={1} className="mb-4" />
                            <p className="text-sm font-[700]  tracking-[0.2em]">Awaiting Selection</p>
                            <p className="text-xs mt-2 opacity-60">Select a payload from the directory to decypher.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
