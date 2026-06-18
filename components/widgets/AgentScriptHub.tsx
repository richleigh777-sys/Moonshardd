
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
        <div className="flex flex-col h-full bg-surface-main rounded-2xl border border-border-strong shadow-lg overflow-hidden relative font-mono text-sm group">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-alt/50 flex flex-col md:flex-row md:justify-between md:items-center gap-4 relative z-20">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-accent-primary/10 rounded-xl border border-accent-primary/20 text-accent-primary shadow-sm">
                        <Terminal size={20} strokeWidth={2}/>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-text-primary tracking-tight">
                            Dialogue Scripts Directory
                        </h3>
                        <p className="text-xs font-bold text-text-muted flex items-center gap-2 mt-1 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                            Live Comm Link
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full sm:w-64">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted transition-colors">
                            <Search size={16} />
                        </div>
                        <input autoComplete="off" spellCheck={false} 
                            placeholder="Search scripts..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-main border border-border-strong rounded-xl py-2 pl-10 pr-4 text-sm font-medium text-text-primary outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary transition-all placeholder:text-text-muted"
                        />
                    </div>
                    <div className="flex gap-1.5 bg-surface-main p-1.5 rounded-xl border border-border-strong overflow-x-auto scrollbar-hide">
                        {(['All', 'Sales', 'Rebuttal', 'FollowUp', 'Rescue'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => { setActiveType(type); sfx.playClick(); }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
                                    activeType === type 
                                    ? 'bg-accent-primary text-white shadow-sm' 
                                    : 'text-text-muted hover:text-text-primary hover:bg-surface-alt'
                                }`}
                            >
                                {type === 'All' ? 'All' : type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative z-10 flex-col md:flex-row bg-surface-main/30">
                {/* Left Side: Directory List */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-border-subtle bg-surface-main/50 flex flex-col shrink-0">
                    <div className="px-5 py-3 border-b border-border-subtle bg-surface-alt/30 text-xs font-bold uppercase tracking-widest flex items-center justify-between text-text-muted">
                        <span>Index</span>
                        <span>{filtered.length} File{filtered.length !== 1 && 's'}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
                        {filtered.map(script => (
                            <button 
                                key={script.id}
                                onClick={() => handleSelect(script)}
                                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2.5 relative group overflow-hidden ${
                                    activeScript?.id === script.id 
                                    ? 'bg-accent-primary/10 border-accent-primary/30 shadow-sm' 
                                    : 'bg-surface-main border-transparent hover:border-border-strong hover:bg-surface-alt'
                                }`}
                            >
                                <div className="flex justify-between items-start w-full relative z-10">
                                    <div className="flex items-center gap-2.5 min-w-0 w-full">
                                        <Hash size={14} className={activeScript?.id === script.id ? 'text-accent-primary flex-shrink-0' : 'text-text-muted group-hover:text-text-secondary flex-shrink-0'} />
                                        <span className={`text-sm font-bold truncate ${activeScript?.id === script.id ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary'}`}>
                                            {script.title}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full relative z-10 pl-6">
                                    <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md uppercase border ${
                                        script.type === 'Rebuttal' ? 'bg-status-error/10 border-status-error/20 text-status-error' : 
                                        script.type === 'Sales' ? 'bg-status-success/10 border-status-success/20 text-status-success' :
                                        script.type === 'Rescue' ? 'bg-status-warning/10 border-status-warning/20 text-status-warning' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                    }`}>
                                        {script.type}
                                    </span>
                                    <span className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                                        <Zap size={12} className="text-text-muted" /> {script.usageCount}
                                    </span>
                                </div>
                            </button>
                        ))}

                        {filtered.length === 0 && (
                            <div className="flex flex-col items-center justify-center p-8 text-text-muted text-center h-40">
                                <Search size={28} className="mb-3 opacity-30" />
                                <p className="text-xs uppercase tracking-widest font-bold">No scripts found</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Script Viewer */}
                <div className="flex-1 flex flex-col bg-surface-main min-w-0 relative">
                    {activeScript ? (
                        <>
                            <div className="px-8 py-6 border-b border-border-subtle flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crosshair size={14} className="text-accent-primary" />
                                        <span className="text-xs font-bold text-text-muted tracking-widest uppercase">Target Payload ID: {activeScript.id.substring(0,8)}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-primary tracking-tight">
                                        {activeScript.title}
                                    </h2>
                                </div>
                                <button 
                                    onClick={() => handleCopy(activeScript.id, activeScript.content)}
                                    className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${
                                        copiedId === activeScript.id 
                                        ? 'bg-status-success text-white' 
                                        : 'bg-text-primary text-surface-main hover:bg-text-primary/90'
                                    }`}
                                >
                                    {copiedId === activeScript.id ? <><Check size={16} strokeWidth={3}/> COPIED</> : <><Copy size={16}/> COPY DIALOGUE</>}
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="bg-surface-alt border border-border-subtle rounded-2xl p-6 relative group overflow-hidden shadow-sm h-full max-h-full">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-primary/20 group-hover:bg-accent-primary/50 transition-colors"></div>
                                    <div className="whitespace-pre-wrap text-text-primary text-base leading-loose font-sans">
                                        {activeScript.content}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                         <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-5 text-center">
                            <div className="p-5 bg-surface-alt rounded-2xl border border-border-subtle mb-5">
                                <Terminal size={40} className="text-text-muted/50" />
                            </div>
                            <p className="text-sm font-bold tracking-widest uppercase text-text-primary mb-2">Awaiting Selection</p>
                            <p className="text-xs font-medium text-text-muted max-w-[250px]">Select a dialogue from the directory panel to view constraints.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
