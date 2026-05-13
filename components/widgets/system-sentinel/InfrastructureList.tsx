
import React from 'react';
import { Database, Shield, Server, Users } from 'lucide-react';

interface InfrastructureListProps {
    onlineCount: number;
    cloudSync: string;
}

export const InfrastructureList: React.FC<InfrastructureListProps> = ({ onlineCount, cloudSync }) => {
    const services = [
        { label: 'Database Core', icon: Database, color: 'text-blue-500', status: 'Online' },
        { label: 'Auth Service', icon: Shield, color: 'text-amber-500', status: 'Secure' },
        { label: 'Cloud Sync', icon: Server, color: 'text-emerald-500', status: cloudSync },
        { label: 'Active Staff', icon: Users, color: 'text-indigo-500', status: `${onlineCount} Online` }
    ];

    return (
        <div className="flex-1 bg-surface-alt/30 rounded-2xl border border-border-subtle p-3 overflow-y-auto custom-scrollbar flex flex-col gap-2 min-h-0">
            <h5 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 px-1">Infrastructure</h5>
            {services.map((svc, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-surface-main rounded-xl border border-border-subtle group hover:border-accent-primary/30 transition-all shrink-0">
                    <div className="flex items-center gap-3">
                        <svc.icon size={14} className={svc.color}/>
                        <span className="text-xs font-bold text-text-primary">{svc.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-text-secondary">{svc.status}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'Online' || svc.status === 'Secure' || svc.status === 'STABLE' || svc.status.includes('Online') ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
