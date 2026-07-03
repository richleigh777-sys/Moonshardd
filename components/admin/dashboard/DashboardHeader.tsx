import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Zap, RefreshCcw } from 'lucide-react';
import { SystemHealth } from '../../../types';
import { sfx } from '../../../lib/soundService';

interface DashboardHeaderProps {
    health?: SystemHealth;
    onToggleTerminals?: () => void;
    areTerminalsOpen?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ health, onToggleTerminals, areTerminalsOpen }) => {
    const isOffline = health?.cloudSync === 'OFFLINE';
    const [liveMode, setLiveMode] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (liveMode && !isOffline) {
            interval = setInterval(() => {
                window.dispatchEvent(new CustomEvent('REFRESH_DATA', { detail: { source: 'live_mode' } }));
                console.log("[Live Mode] Analytics refreshed.");
            }, 60000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [liveMode, isOffline]);

    return (
        <div className="flex justify-between items-center shrink-0 bg-surface-main/30 backdrop-blur-3xl border border-border-strong p-4 rounded-xl shadow-panel relative overflow-hidden group hover:border-accent-primary/30 transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/0 via-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-0"></div>
            <div className="flex items-center gap-4 relative z-10">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-surface-alt/50 border shadow-inner ${isOffline ? 'border-status-error/30 text-status-error shadow-sm' : 'border-status-success/30 text-status-success shadow-sm'}`}>
                    {isOffline ? <Activity size={22} className="animate-pulse"/> : <ShieldCheck size={24} />}
                </div>
                <div>
                    <h2 className="text-xl font-display font-medium tracking-tight text-text-primary capitalize flex items-center gap-3">
                        {isOffline ? 'Taking a nap 💤' : "How's the team doing? 🚀"}
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-sm ${isOffline ? 'bg-status-error text-status-error' : 'bg-status-success text-status-success'}`}></div>
                    </h2>
                    <p className="text-sm font-semibold text-text-muted mt-1 flex items-center gap-2">
                        <span>{isOffline ? 'We are having trouble connecting.' : 'Everything is running smoothly.'}</span>
                    </p>
                </div>
            </div>

            <div className="flex gap-3 relative z-10">
                <button
                    onClick={() => {
                        sfx.playClick();
                        setLiveMode(!liveMode);
                    }}
                    className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wider border transition-all active:scale-95 ${
                        liveMode 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30 hover:bg-blue-500 hover:text-white hover:shadow-sm ring-1 ring-transparent hover:ring-white/20' 
                            : 'bg-surface-alt/50 text-text-muted border-border-strong hover:bg-surface-alt hover:text-text-primary'
                    }`}
                    title="Toggle Live Mode (60s refresh)"
                >
                    <RefreshCcw size={16} className={liveMode ? "animate-spin" : ""} />
                    Live Data: {liveMode ? 'ON' : 'OFF'}
                </button>
                {onToggleTerminals && (
                    <button
                        onClick={() => {
                            sfx.playClick();
                            onToggleTerminals();
                        }}
                        className={`group flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wider border transition-all active:scale-95 ${
                            areTerminalsOpen 
                                ? 'bg-surface-alt/50 text-text-primary border-border-strong shadow-inner hover:bg-surface-alt' 
                                : 'bg-emerald-500/10 text-status-success border-status-success/30 hover:bg-emerald-500 hover:text-white hover:shadow-sm ring-1 ring-transparent hover:ring-white/20'
                        }`}
                        title="Toggle Setup Tools"
                    >
                        <Activity size={16} className={areTerminalsOpen ? "opacity-50" : "animate-pulse"} />
                        {areTerminalsOpen ? 'Hide Controls' : 'Open Controls'}
                    </button>
                )}
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }))}
                    className="group flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold tracking-wider border transition-all bg-accent-primary/10 text-accent-primary border-accent-primary/30 hover:bg-accent-primary hover:text-white shadow-sm hover:shadow-sm ring-1 ring-transparent hover:ring-white/20 active:scale-95"
                >
                    <Zap size={16} className="group-hover:animate-bounce" />
                    Help a Customer
                </button>
            </div>
        </div>
    );
};
