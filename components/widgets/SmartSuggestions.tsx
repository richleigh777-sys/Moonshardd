
import React, { useMemo, useState } from 'react';
import { Lightbulb, TrendingUp, ArrowRight, Zap, RefreshCw, Sparkles, Brain, Target, ShieldCheck, Clock } from 'lucide-react';
import { Card } from '../ui/Base';
import { Sale, Note, User } from '../../types';
import { WISDOM_COLLECTION } from '../../constants';
import { sfx } from '../../lib/soundService';

interface SmartSuggestionsProps {
    sales: Sale[];
    notes: Note[];
    currentUser: User;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ sales, notes, currentUser }) => {
    // Local State for Wisdom Cycling
    const [wisdomIndex, setWisdomIndex] = useState(() => Math.floor(Math.random() * WISDOM_COLLECTION.length));
    const [now] = useState(() => Date.now());

    const nextWisdom = () => {
        sfx.playClick();
        setWisdomIndex((prev) => (prev + 1) % WISDOM_COLLECTION.length);
    };

    const suggestions = useMemo(() => {
        const list = [];
        
        // 1. Momentum Check
        const todaySales = sales.filter(s => {
            const d = new Date(s.timestamp);
            const today = new Date();
            return d.getDate() === today.getDate() && 
                   d.getMonth() === today.getMonth() && 
                   d.getFullYear() === today.getFullYear() &&
                   s.agentId === currentUser.id &&
                   s.status === 'Approved';
        });

        if (todaySales.length === 0) {
            list.push({
                type: 'momentum',
                icon: <Zap size={18} className="text-yellow-500" />,
                title: 'Start Your Streak',
                text: 'No sales on the board yet today. The first one is the hardest!',
                action: 'View Leads'
            });
        } else if (todaySales.length >= 3) {
            list.push({
                type: 'fire',
                icon: <TrendingUp size={18} className="text-status-success" />,
                title: 'You are on Fire!',
                text: `You've closed ${todaySales.length} deals today. Keep the momentum going!`,
                action: 'Next Call'
            });
        }

        // 2. Callback Efficiency
        const overdueCallbacks = notes.filter(n => n.type === 'callback' && n.agentId === currentUser.id && n.timestamp < now).length;
        if (overdueCallbacks > 2) {
            list.push({
                type: 'urgent',
                icon: <Clock size={18} className="text-status-error" />,
                title: 'Clean Up Pipeline',
                text: `You have ${overdueCallbacks} overdue callbacks. Clear them to unlock new leads.`,
                action: 'Go to Callbacks'
            });
        }

        return list;
    }, [sales, notes, currentUser, now]);

    // Current Wisdom Selection
    const activeWisdom = WISDOM_COLLECTION[wisdomIndex];
    
    // Style Mapping for Categories
    const getCategoryStyles = (category: string) => {
        switch(category) {
            case 'Mindset': return { icon: <Brain size={16}/>, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' };
            case 'Tactics': return { icon: <Target size={16}/>, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
            case 'Grind': return { icon: <Zap size={16}/>, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
            case 'Closing': return { icon: <ShieldCheck size={16}/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
            default: return { icon: <Lightbulb size={16}/>, color: 'text-accent-primary', bg: 'bg-accent-primary/10 border-accent-primary/20' };
        }
    };

    const wisdomStyle = getCategoryStyles(activeWisdom.category);

    return (
        <Card className="h-full flex flex-col p-0 overflow-hidden bg-surface-main/40 backdrop-blur-md border-border-subtle/40 shadow-2xl relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="p-5 border-b border-border-subtle/50 bg-surface-highlight/20 flex items-center justify-between shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/10 shadow-neon-amber">
                        <Lightbulb size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-text-primary">Smart Assist</h3>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">AI Cognitive Layer</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
                    <Sparkles size={10} /> Active
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4 relative z-10">
                {/* 1. AUTO-GENERATED SUGGESTIONS */}
                {suggestions.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-border-subtle/50 bg-surface-main/30 hover:bg-surface-main/60 transition-all duration-300 group/item hover:border-accent-primary/30 shadow-sm">
                        <div className="flex gap-4">
                            <div className="mt-1 shrink-0 group-hover/item:scale-110 transition-transform duration-500">{item.icon}</div>
                            <div className="min-w-0">
                                <h4 className="text-[10px] font-black text-text-primary mb-1 uppercase tracking-widest group-hover/item:text-accent-primary transition-colors">{item.title}</h4>
                                <p className="text-[11px] text-text-secondary leading-relaxed font-bold opacity-80 group-hover/item:opacity-100 transition-opacity">{item.text}</p>
                                {item.action && (
                                    <button className="mt-3 text-[9px] font-black uppercase text-accent-primary flex items-center gap-2 hover:gap-3 transition-all tracking-[0.15em]">
                                        {item.action} <ArrowRight size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* 2. DAILY WISDOM MODULE */}
                <div 
                    key={wisdomIndex} // Key forces re-render for animation trigger
                    className={`p-5 rounded-[2rem] border transition-all relative overflow-hidden group/wisdom ${wisdomStyle.bg} animate-in fade-in slide-in-from-right-8 duration-700 shadow-lg`}
                >
                    {/* Background Icon Watermark */}
                    <div className="absolute -right-4 -top-4 opacity-5 scale-[3] pointer-events-none group-hover/wisdom:scale-[3.5] group-hover/wisdom:rotate-12 transition-all duration-1000">
                        {wisdomStyle.icon}
                    </div>

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${wisdomStyle.color}`}>
                            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                                {wisdomStyle.icon}
                            </div>
                            {activeWisdom.category}
                        </div>
                        <button 
                            onClick={nextWisdom}
                            className={`p-2 rounded-xl hover:bg-white/20 transition-all duration-500 ${wisdomStyle.color} border border-transparent hover:border-white/10 shadow-sm`}
                            title="New Insight"
                        >
                            <RefreshCw size={12} strokeWidth={3} className="group-hover/wisdom:rotate-180 transition-transform duration-700"/>
                        </button>
                    </div>
                    
                    <p className="text-sm font-black text-text-primary italic leading-relaxed relative z-10 tracking-tight">
                        "{activeWisdom.text}"
                    </p>
                    
                    <div className="mt-4 flex items-center gap-2 opacity-40">
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span className="text-[8px] font-black uppercase tracking-widest">Braveheart Wisdom Collection</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
