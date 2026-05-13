
import React, { useEffect, useRef, useMemo } from 'react';
import { 
    X, Check, Bell, AlertTriangle, Terminal, 
    Activity, Zap, ArrowRight, Shield, 
    Layers, Sparkles, Ghost
} from 'lucide-react';
import { AppNotification } from '../../types';
import { sfx } from '../../lib/soundService';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: AppNotification[];
    onClear: (id: string) => void;
    onClearAll?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
    isOpen, onClose, notifications, onClear, onClearAll 
}) => {
    const panelRef = useRef<HTMLDivElement>(null);

    // Filter into buckets for the Tactical Feed
    const criticals = useMemo(() => notifications.filter(n => n.type === 'alert'), [notifications]);
    const streams = useMemo(() => notifications.filter(n => n.type !== 'alert'), [notifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20"><AlertTriangle size={14} className="text-red-500 animate-pulse" /></div>;
            case 'system': return <div className="p-2 bg-slate-500/10 rounded-lg border border-slate-500/20"><Terminal size={14} className="text-slate-400" /></div>;
            case 'vitality': return <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20"><Activity size={14} className="text-emerald-500" /></div>;
            case 'workflow': return <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20"><Zap size={14} className="text-indigo-500" /></div>;
            default: return <div className="p-2 bg-accent-primary/10 rounded-lg border border-accent-primary/20"><Bell size={14} className="text-accent-primary" /></div>;
        }
    };

    const handleAction = (id: string) => {
        sfx.playClick();
        onClear(id);
    };

    const handleClearAll = () => {
        sfx.playDecline();
        if (onClearAll) onClearAll();
        onClose();
    };

    return (
        <div 
            ref={panelRef}
            className="absolute top-20 right-6 w-[420px] max-h-[85vh] flex flex-col bg-slate-950/95 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2rem] z-[500] animate-in fade-in slide-in-from-top-6 duration-500 origin-top-right ring-1 ring-white/5 overflow-hidden"
        >
            {/* Holographic Header Decor */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none opacity-50"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_3s_infinite]"></div>

            {/* Header */}
            <div className="p-6 border-b border-white/5 relative z-10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className={`p-3 rounded-2xl bg-surface-main border border-white/10 shadow-lg ${notifications.length > 0 ? 'text-accent-primary' : 'text-text-muted'}`}>
                            <Bell size={22} strokeWidth={2.5} className={notifications.length > 0 ? 'animate-swing' : ''} />
                        </div>
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-[8px] font-black text-white">
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-text-primary">Notifications</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                                <Shield size={12} className="text-emerald-500" /> Secure Connection
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/10 rounded-xl text-text-muted hover:text-text-primary transition-all border border-transparent hover:border-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Briefing Module */}
            <div className="p-6 pb-2 shrink-0 relative z-10">
                <div className="p-4 rounded-2xl bg-surface-alt/40 border border-white/5 shadow-inner flex items-center justify-between group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="p-2 bg-indigo-500/10 rounded-lg"><Sparkles size={14} className="text-indigo-400" /></div>
                        <div>
                            <p className="text-xs font-bold text-indigo-400">Daily Briefing</p>
                            <p className="text-xs font-medium text-text-secondary mt-0.5">
                                {notifications.length > 0 
                                    ? `You have ${criticals.length} high-priority tasks.` 
                                    : "All caught up."}
                            </p>
                        </div>
                    </div>
                    {notifications.length > 0 && (
                        <button 
                            onClick={handleClearAll}
                            className="relative z-10 p-2 text-text-muted hover:text-red-400 transition-colors text-xs font-bold"
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Main Scroll Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-6">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <div className="w-20 h-20 bg-surface-alt/50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-white/5 animate-pulse">
                            <Ghost size={32} className="text-text-muted" />
                        </div>
                        <p className="text-sm font-bold text-text-muted">No New Notifications</p>
                        <p className="text-xs font-medium text-text-muted/60 mt-2">We'll let you know when something arrives.</p>
                    </div>
                ) : (
                    <>
                        {/* 1. CRITICAL SECTOR */}
                        {criticals.length > 0 && (
                            <div className="space-y-3 animate-in slide-in-from-left-4 duration-500">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-red-500">Priority</span>
                                </div>
                                {criticals.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        className="relative group p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.03] hover:bg-red-500/[0.06] transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="shrink-0">{getIcon(notif.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-text-primary leading-tight">{notif.title}</h4>
                                                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed font-medium line-clamp-2">{notif.message}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <button className="text-xs font-bold text-red-400 flex items-center gap-1 group/btn hover:underline">
                                                        Respond <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform"/>
                                                    </button>
                                                    <span className="text-[10px] font-medium text-text-muted/40">
                                                        {new Date(notif.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleAction(notif.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500 rounded-lg text-text-muted hover:text-white transition-all shadow-xl -mr-2 -mt-2"
                                            >
                                                <Check size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2. INTELLIGENCE SECTOR */}
                        {streams.length > 0 && (
                            <div className="space-y-3 animate-in slide-in-from-left-4 duration-700">
                                <div className="flex items-center gap-2 px-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary opacity-50"></div>
                                    <span className="text-xs font-bold text-text-muted">Updates</span>
                                </div>
                                {streams.map((notif) => (
                                    <div 
                                        key={notif.id}
                                        className="relative group p-4 rounded-2xl border border-white/5 bg-surface-alt/30 hover:bg-surface-alt/60 hover:border-accent-primary/20 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="shrink-0">{getIcon(notif.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-text-primary leading-tight">{notif.title}</h4>
                                                <p className="text-xs text-text-secondary mt-1 leading-relaxed opacity-80">{notif.message}</p>
                                                <span className="text-[10px] font-medium text-text-muted/30 mt-2 block">
                                                    {new Date(notif.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleAction(notif.id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-accent-primary rounded-lg text-text-muted hover:text-white transition-all -mr-2 -mt-2 shadow-lg"
                                            >
                                                <Check size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                    <p className="text-[10px] font-medium text-text-muted">System Notifications</p>
                    {notifications.length > 0 && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-accent-primary">
                            <Layers size={10} /> Synced
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
