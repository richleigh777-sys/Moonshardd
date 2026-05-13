
import React, { useState, useEffect } from 'react';
import { CalendarClock } from 'lucide-react';
import { Card } from '../ui/Base';
import { getCutoffStatus } from '../../views/utils/crmLogic';
import { useCRM } from '../../hooks/useCRM';

export const CutoffTracker = () => {
    const { systemConfig } = useCRM();
    const [status, setStatus] = useState(getCutoffStatus(systemConfig.cutoffDay1));

    useEffect(() => {
        // Use timeout to avoid synchronous state update warning
        const t = setTimeout(() => setStatus(getCutoffStatus(systemConfig.cutoffDay1)), 0);
        
        const interval = setInterval(() => {
            setStatus(getCutoffStatus(systemConfig.cutoffDay1));
        }, 60000); // Update every minute
        return () => {
            clearTimeout(t);
            clearInterval(interval);
        };
    }, [systemConfig.cutoffDay1]);

    const isUrgent = status.daysLeft <= 3;

    return (
        <Card className="p-0 overflow-hidden bg-surface-main border border-border-subtle shadow-sm relative group">
            <div className={`absolute top-0 left-0 h-1 transition-all duration-1000 ${isUrgent ? 'bg-status-error animate-pulse' : 'bg-accent-primary'}`} style={{ width: `${status.progress}%` }}></div>
            
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isUrgent ? 'bg-status-error/10 text-status-error' : 'bg-surface-alt text-text-secondary'}`}>
                        <CalendarClock size={20} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-0.5">{status.label}</p>
                        <h4 className="text-sm font-black text-text-primary flex items-center gap-1">
                            {status.daysLeft} Days Left <span className="text-text-muted font-medium text-[10px]">until {status.deadline}</span>
                        </h4>
                    </div>
                </div>
                
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-text-secondary">{Math.round(status.progress)}% Complete</p>
                </div>
            </div>
        </Card>
    );
};
