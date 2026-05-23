
import React from 'react';
import { Database, Shield, Server, Users } from 'lucide-react';

interface InfrastructureListProps {
    onlineCount: number;
    cloudSync: string;
}

export const InfrastructureList: React.FC<InfrastructureListProps> = ({ onlineCount, cloudSync }) => {
    const services = [
        { label: 'Database Core', icon: Database, color: 'text-blue-500', status: 'Online' },
        { label: 'Auth Service', icon: Shield, color: 'text-status-warning', status: 'Secure' },
        { label: 'Cloud Sync', icon: Server, color: 'text-status-success', status: cloudSync },
        { label: 'Active Staff', icon: Users, color: 'text-accent-secondary', status: `${onlineCount} Online` }
    ];

    return (
        <div className="flex-1 bg-surface-alt rounded-2xl border border-border-subtle p-3 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
            <h5 className="text-[10px] font-[700] text-text-muted  tracking-widest mb-1 px-1 drop-drop-shadow-md">Infrastructure</h5>
            {services.map((svc, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-surface-alt rounded-xl border border-border-subtle group hover:border-border-strong transition-all shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <svc.icon size={14} className={svc.color}/>
                        <span className="text-[11px] font-bold text-text-secondary drop-shadow-sm  tracking-wider">{svc.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-text-muted drop-shadow-sm">{svc.status}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'Online' || svc.status === 'Secure' || svc.status === 'STABLE' || svc.status.includes('Online') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
