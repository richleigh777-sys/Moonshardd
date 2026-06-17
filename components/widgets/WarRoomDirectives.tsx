
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { TacticalDirective } from '../../types';

export const WarRoomDirectives: React.FC<{ directives: TacticalDirective[] }> = ({ directives }) => {
    const [visible, setVisible] = useState(false);
    const [now] = useState(() => Date.now());

    const latest = React.useMemo(() => {
        if (directives.length === 0) return null;
        const sorted = [...directives].sort((a, b) => b.timestamp - a.timestamp);
        const mostRecent = sorted[0];
        // Only show if it happened in the last 2 minutes
        if (now - mostRecent.timestamp < 120000) {
            return mostRecent;
        }
        return null;
    }, [directives, now]);

    useEffect(() => {
        if (latest) {
            setTimeout(() => setVisible(true), 0);
            const timer = setTimeout(() => setVisible(false), 15000);
            return () => clearTimeout(timer);
        }
    }, [latest]);

    if (!latest || !visible) return null;

    const urgencyStyles = {
        Routine: 'bg-surface-main border-accent-primary text-text-primary shadow-lg shadow-accent-primary/5',
        Immediate: 'bg-status-warning/10 text-status-warning border-status-warning shadow-lg',
        Flash: 'bg-status-error/10 text-status-error border-status-error shadow-lg'
    };

    const labelMap = {
        Routine: 'Update',
        Immediate: 'Important',
        Flash: 'Urgent'
    };

    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xl px-4 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
            <div className={`border rounded-xl p-4 backdrop-blur-xl flex flex-col gap-3 ${urgencyStyles[latest.urgency]}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="animate-bounce" size={16} />
                        <p className="text-sm font-medium">Update from {latest.senderName}</p>
                    </div>
                    <div className="px-3 py-1 bg-surface-main/50 rounded-full text-xs font-medium">
                        {labelMap[latest.urgency]}
                    </div>
                </div>
                <p className="text-lg font-medium text-center leading-relaxed">"{latest.message}"</p>
                <div className="flex justify-between items-center text-xs text-text-muted pt-2 border-t border-black/5">
                    <span>{new Date(latest.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </div>
    );
};
