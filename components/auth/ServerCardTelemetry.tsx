
import React, { useState, useEffect } from 'react';
import { ArrowRight, Globe, Shield, Server, Lock } from 'lucide-react';

interface ServerCardTelemetryProps {
    server: any;
    isActive: boolean;
    onEnter: (id: string) => void;
    onEdit: (server: any, e: React.MouseEvent) => void;
    onDelete: (server: any, e: React.MouseEvent) => void;
    getRegionColor: (region: string) => string;
}

interface ServerStats {
    load: number;
    revenueToday: number;
    activeUsers: number;
    totalUsers: number;
}

const initialStats: ServerStats = { 
    load: 0, 
    revenueToday: 0, 
    activeUsers: 0, 
    totalUsers: 0 
};

export const ServerCardTelemetry: React.FC<ServerCardTelemetryProps> = React.memo(({ 
    server, isActive, onEnter, onEdit, onDelete, getRegionColor 
}) => {
    const [stats, setStats] = useState<ServerStats>(initialStats);
    const [loadHistory, setLoadHistory] = useState<number[]>(Array(20).fill(10));

    // Isolated Heartbeat & Sparkline Generator
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => {
                const newLoad = Math.min(100, Math.max(5, prev.load + (Math.random() * 10 - 5)));
                
                setLoadHistory(curr => {
                    const next = [...curr.slice(1), newLoad];
                    return next;
                });

                return {
                    ...prev,
                    load: newLoad,
                    revenueToday: prev.revenueToday,
                    activeUsers: prev.activeUsers,
                    totalUsers: prev.totalUsers
                };
            });
        }, 1000); // 1s tick for smoother graphs
        return () => clearInterval(interval);
    }, [server.id]);

    // Generate SVG Path for Sparkline
    const getPath = () => {
        const max = 100;
        const width = 300; // Arbitrary coordinate width
        const height = 40;
        const step = width / (loadHistory.length - 1);

        const points = loadHistory.map((val, i) => {
            const x = i * step;
            const y = height - (val / max) * height;
            return `${x},${y}`;
        });

        return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
    };

    return (
        <div 
            onClick={() => isActive && onEnter(server.id)}
            className={`
                bg-[#0A0A0A]/80 backdrop-blur-md border border-border-subtle rounded-[2.5rem] p-8 group cursor-pointer 
                transition-all duration-500 relative overflow-hidden flex flex-col h-[360px]
                ${isActive ? 'hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10' : 'opacity-60 grayscale cursor-not-allowed'}
            `}
        >
            {/* Background Sparkline Visualization */}
            <div className="absolute bottom-0 left-0 right-0 h-32 opacity-10 pointer-events-none transition-opacity group-hover:opacity-20">
                <svg viewBox="0 0 300 40" className="w-full h-full" preserveAspectRatio="none">
                    <path d={getPath()} fill="currentColor" className={isActive ? 'text-accent-secondary' : 'text-slate-500'} />
                </svg>
            </div>

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`p-4 rounded-2xl border transition-colors shadow-inner ${isActive ? 'bg-surface-highlight border-border-subtle group-hover:bg-accent-secondary/10 group-hover:text-accent-secondary' : 'bg-red-500/10 text-status-error border-red-500/20'}`}>
                    {isActive ? <Server size={28} strokeWidth={1.5}/> : <Lock size={28} strokeWidth={1.5}/>}
                </div>
                <div className="flex items-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-2 transform translate-x-4 group-hover:translate-x-0">
                        {/* Use Settings Icon for Edit */}
                        <button onClick={(e) => onEdit(server, e)} className="p-2 hover:bg-surface-highlight rounded-xl text-slate-500 hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        {/* Use Trash Icon for Delete */}
                        <button onClick={(e) => onDelete(server, e)} className="p-2 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-status-error transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10B981] animate-pulse' : 'bg-red-500'}`}></div>
                </div>
            </div>

            <div className="flex-1 relative z-10 flex flex-col justify-between">
                <div>
                    <h3 className="text-2xl font-[700] text-white group-hover:text-accent-secondary transition-colors mb-2 tracking-tight  truncate">{server.name}</h3>
                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 font-bold ">
                        <span className={`flex items-center gap-1 ${getRegionColor(server.region)}`}>
                            <Globe size={16} fill="currentColor"/> {server.region}
                        </span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                        <span className="flex items-center gap-1">
                            <Shield size={16}/> Key: {server.accessKey}
                        </span>
                    </div>
                </div>

                {isActive && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-surface-highlight rounded-xl p-3 border border-border-subtle">
                            <p className="text-xs text-slate-400 font-[700]  tracking-wider mb-1">Revenue Today</p>
                            <p className="text-lg font-[700] text-status-success num-font">${stats.revenueToday.toLocaleString()}</p>
                        </div>
                        <div className="bg-surface-highlight rounded-xl p-3 border border-border-subtle">
                            <p className="text-xs text-slate-400 font-[700]  tracking-wider mb-1">Active Agents</p>
                            <p className="text-lg font-[700] text-blue-400 num-font">{stats.activeUsers}/{stats.totalUsers}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 border-t border-border-subtle flex justify-between items-end mt-auto relative z-10">
                <div className="w-full mr-6">
                    <div className="flex justify-between text-sm font-bold text-slate-500  tracking-widest mb-1">
                        <span>Load: {stats.load > 80 ? 'CRITICAL' : stats.load > 50 ? 'HEAVY' : 'OPTIMAL'}</span>
                        <span className="font-mono">{Math.round(stats.load)}%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ease-out ${stats.load > 80 ? 'bg-red-500' : stats.load > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${stats.load}%` }}
                        ></div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-[700]  text-accent-secondary whitespace-nowrap group-hover:translate-x-1 transition-transform cursor-pointer">
                    {isActive ? 'Connect' : 'Locked'} <ArrowRight size={16} strokeWidth={3}/>
                </div>
            </div>
        </div>
    );
});
