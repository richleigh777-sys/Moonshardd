import React, { useState, useEffect } from 'react';
import { Cpu, Server, ShieldCheck, Lock } from 'lucide-react';
import { useSystem } from '../../hooks/useSystem';
import { useAuth } from '../../hooks/useAuth';

export const SystemTicker: React.FC = () => {
    const { activeServer } = useSystem();
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ cpu: 12, mem: 34, net: 'STABLE' });
    
    const isSuper = (currentUser?.accessLevel || 0) >= 10;

    useEffect(() => {
        const i = setInterval(() => {
            setStats({ cpu: Math.floor(Math.random() * 30) + 10, mem: Math.floor(Math.random() * 20) + 30, net: 'STABLE' });
        }, 3000);
        return () => clearInterval(i);
    }, []);

    return (
        <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-4 px-3 py-1 bg-black/5 rounded-full border border-black/5 backdrop-blur-md shadow-inner">
                <div className="flex items-center gap-2">
                    <Cpu size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">CPU: {stats.cpu}%</span>
                </div>
                <div className="w-px h-3 bg-black/10"></div>
                <div className="flex items-center gap-2">
                    <Server size={12} className="text-blue-500" />
                    <span className="text-[10px] font-mono text-blue-500 font-bold">MEM: {stats.mem}%</span>
                </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${isSuper ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-surface-alt border-border-subtle text-text-muted'}`}>
                {isSuper ? <ShieldCheck size={12} /> : <Lock size={12} />}
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] font-bold">{isSuper ? 'Admin' : 'Manager'}</span>
                    <span className="text-[9px] font-medium opacity-80">{activeServer?.name || 'Local'}</span>
                </div>
            </div>
        </div>
    );
};
