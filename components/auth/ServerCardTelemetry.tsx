
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Globe, Server, Lock, Settings, Trash2, Key, Database as DbIcon, Activity } from 'lucide-react';

interface ServerCardTelemetryProps {
    server: any;
    isActive: boolean;
    onEnter: (id: string) => void;
    onEdit: (server: any, e: React.MouseEvent) => void;
    onDelete: (server: any, e: React.MouseEvent) => void;
    getRegionColor: (region: string) => string;
}

interface ServerStats {
    healthScore: number;
    apiUsage: number;
    apiLimit: number;
    storageUsed: number;
    storageLimit: number;
}

export const ServerCardTelemetry: React.FC<ServerCardTelemetryProps> = React.memo(({ 
    server, isActive, onEnter, onEdit, onDelete, getRegionColor 
}) => {
    // Determine Environment Type
    const envType = useMemo(() => {
        const name = server.name.toLowerCase();
        if (name.includes('sandbox') || name.includes('test')) return 'Sandbox';
        if (name.includes('dev')) return 'Development';
        return 'Production';
    }, [server.name]);

    const initialStats = useMemo(() => {
        // Generate stable fake stats based on server ID to prevent jumping
        const seed = server.id.charCodeAt(0) + server.id.charCodeAt(server.id.length - 1);
        const rand = (seed % 100) / 100;
        
        return { 
            healthScore: 90 + Math.floor(rand * 10), 
            apiUsage: Math.floor(rand * 8000) + 1000, 
            apiLimit: envType === 'Production' ? 100000 : 10000, 
            storageUsed: Math.floor(rand * 800) + 50, // GB
            storageLimit: envType === 'Production' ? 1000 : 100 // GB
        };
    }, [server.id, envType]);

    const [stats, setStats] = useState<ServerStats>(initialStats);
    const [_loadHistory, setLoadHistory] = useState<number[]>(Array(20).fill(10));

    // Isolated Heartbeat & Sparkline Generator
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => {
                // Fluctuate health slightly
                const newHealth = Math.min(100, Math.max(70, prev.healthScore + (Math.random() * 4 - 2)));
                
                setLoadHistory(curr => {
                    const next = [...curr.slice(1), 100 - newHealth]; // Inverse health for load
                    return next;
                });

                return {
                    ...prev,
                    healthScore: newHealth,
                    apiUsage: prev.apiUsage + Math.floor(Math.random() * 5) // Simulate API calls ticking up
                };
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [server.id]);

    const envColors = {
        'Production': 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
        'Sandbox': 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
        'Development': 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
    };

    return (
        <div 
            onClick={() => isActive && onEnter(server.id)}
            className={`
                bg-surface-main border border-border-strong rounded-xl p-6 group cursor-pointer 
                transition-all duration-300 relative flex flex-col h-[280px] shadow-sm
                ${isActive ? 'hover:border-accent-primary/50 hover:shadow-md' : 'opacity-60 grayscale cursor-not-allowed'}
            `}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl border transition-colors ${isActive ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary' : 'bg-status-error/10 text-status-error border-status-error/30'}`}>
                    {isActive ? <Server size={24} strokeWidth={2}/> : <Lock size={24} strokeWidth={2}/>}
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-md ${envColors[envType as keyof typeof envColors]}`}>
                        {envType}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                        <button onClick={(e) => onEdit(server, e)} className="p-2 hover:bg-surface-alt rounded-lg text-text-muted hover:text-text-primary transition-colors">
                            <Settings size={18}/>
                        </button>
                        <button onClick={(e) => onDelete(server, e)} className="p-2 hover:bg-status-error/10 hover:text-status-error rounded-lg text-text-muted transition-colors">
                            <Trash2 size={18}/>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-primary transition-colors mb-2 truncate">{server.name}</h3>
                <div className="flex items-center gap-3 text-sm text-text-secondary font-medium">
                    <span className={`flex items-center gap-1.5 ${getRegionColor(server.region)}`}>
                        <Globe size={16}/> {server.region}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Key size={16}/> ID: {server.id.split('-').pop()}
                    </span>
                </div>

                {isActive && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-surface-alt rounded-xl p-3 border border-border-subtle hover:border-accent-primary/30 transition-colors">
                            <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase mb-1 flex items-center gap-1.5"><DbIcon size={12}/> DATA STORAGE</p>
                            <p className="text-base font-bold text-text-primary">{stats.storageUsed} <span className="text-sm font-medium text-text-muted">/ {stats.storageLimit} GB</span></p>
                            <div className="h-1 w-full bg-surface-main rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-accent-primary" style={{ width: `${(stats.storageUsed / stats.storageLimit) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-surface-alt rounded-xl p-3 border border-border-subtle hover:border-accent-primary/30 transition-colors">
                            <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase mb-1 flex items-center gap-1.5"><Activity size={12}/> API QUOTA 24H</p>
                            <p className="text-base font-bold text-text-primary">{(stats.apiUsage / 1000).toFixed(1)}k <span className="text-sm font-medium text-text-muted">/ {(stats.apiLimit / 1000).toFixed(0)}k</span></p>
                            <div className="h-1 w-full bg-surface-main rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${(stats.apiUsage / stats.apiLimit) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-border-subtle flex justify-between items-center mt-auto">
                <div className="min-w-[120px]">
                    <div className="flex justify-between text-[10px] font-bold text-text-muted tracking-wide mb-1.5">
                        <span>SYS HEALTH</span>
                        <span className={stats.healthScore < 80 ? 'text-status-warning' : 'text-status-success'}>{Math.round(stats.healthScore)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-alt rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${stats.healthScore < 70 ? 'bg-status-error' : stats.healthScore < 85 ? 'bg-status-warning' : 'bg-status-success'}`} 
                            style={{ width: `${stats.healthScore}%` }}
                        ></div>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-accent-primary group-hover:translate-x-1 transition-transform">
                    {isActive ? 'Enter' : 'Locked'} <ArrowRight size={16} strokeWidth={2}/>
                </div>
            </div>
        </div>
    );
});
