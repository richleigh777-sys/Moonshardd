
import React, { useState } from 'react';
import { Search, Copy, Check, Zap, Database, Server, FileText } from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { Card } from '../ui/Base';
import { ScriptType } from '../../types';
import { sfx } from '../../lib/soundService';

export const AgentScriptHub: React.FC = () => {
    const { scripts } = useCRM();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState<ScriptType | 'All'>('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filtered = scripts.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             s.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = activeType === 'All' || s.type === activeType;
        return matchesSearch && matchesType && s.active;
    });

    const handleCopy = (id: string, content: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        sfx.playConfirm();
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <Card variant="panel" className="flex flex-col h-full bg-[#09090b] text-white border border-white/5 shadow-2xl overflow-hidden p-0 relative group">
            {/* Background Tech Mesh */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
            
            <div className="p-6 border-b border-white/10 bg-surface-alt/10 flex flex-col gap-4 backdrop-blur-xl shrink-0 sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                            <FileText size={24} strokeWidth={2}/>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                                Scripts & Templates
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Resources</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                        <Server size={12} className="text-emerald-500 animate-pulse"/>
                        <span className="text-[10px] font-mono font-bold text-slate-300">{filtered.length} AVAILABLE</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-accent-primary transition-colors">
                            <Search size={14} />
                        </div>
                        <input 
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-xs font-mono font-bold text-white outline-none focus:border-accent-primary focus:shadow-neon transition-all"
                        />
                    </div>
                    <div className="flex gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto scrollbar-hide">
                        {(['All', 'Sales', 'Rebuttal', 'FollowUp', 'Rescue', 'Template'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => { setActiveType(type); sfx.playClick(); }}
                                className={`px-4 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                    activeType === type 
                                    ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20' 
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                    {filtered.map(script => (
                        <div 
                            key={script.id} 
                            className="group relative flex flex-col h-full min-h-[220px] bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden hover:border-accent-primary/30 hover:bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                            {/* Decorative Corner */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="p-5 flex flex-col h-full relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0 pr-2">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${
                                                script.type === 'Rebuttal' ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' : 
                                                script.type === 'Sales' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' :
                                                script.type === 'Template' ? 'bg-purple-500 shadow-[0_0_5px_#a855f7]' :
                                                'bg-blue-500 shadow-[0_0_5px_#3b82f6]'
                                            }`}></span>
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{script.type}</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-white uppercase leading-tight tracking-tight line-clamp-2 italic group-hover:text-accent-primary transition-colors">
                                            {script.title}
                                        </h4>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(script.id, script.content)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all shadow-sm ${
                                            copiedId === script.id 
                                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/30 scale-110' 
                                            : 'bg-black/20 text-slate-400 border-white/10 hover:text-white hover:bg-white/10 hover:border-white/20'
                                        }`}
                                        title="Copy to Clipboard"
                                    >
                                        {copiedId === script.id ? <Check size={14} strokeWidth={4}/> : <Copy size={14}/>}
                                    </button>
                                </div>

                                <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5 relative overflow-hidden group/text">
                                    <div className="absolute top-2 left-2 text-white/5 text-4xl font-serif">"</div>
                                    <p className="text-[11px] font-medium text-slate-300 leading-relaxed relative z-10 line-clamp-5 group-hover/text:text-white transition-colors">
                                        {script.content}
                                    </p>
                                </div>
                                
                                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                        <Zap size={10} className="text-amber-500" fill="currentColor" /> 
                                        {script.usageCount} Uses
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-600 opacity-40">
                        <Database size={64} strokeWidth={1} className="mb-4" />
                        <p className="text-lg font-bold uppercase tracking-widest">No Scripts Found</p>
                        <p className="text-xs font-mono mt-2">Try a different search.</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
