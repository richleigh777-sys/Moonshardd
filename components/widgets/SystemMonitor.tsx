import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { SystemHealth } from '../../types';

interface SystemMonitorProps {
    health: SystemHealth;
    onRunDiagnostics: () => void;
    onTestUplink?: () => Promise<boolean>;
}

export const SystemMonitor: React.FC<SystemMonitorProps> = ({ health }) => {
    return (
        <div className="flex flex-col h-full w-full relative bg-transparent p-4 justify-center items-center">
            <Activity size={24} className="text-emerald-500 mb-2" />
            <h4 className="text-sm font-bold text-text-primary">System Health</h4>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Clock size={12} /> Status: Online
            </p>
        </div>
    );
};
