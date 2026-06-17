
import React, { useMemo } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { DollarSign, AlertTriangle, Trophy, Radio, Globe } from 'lucide-react';

export const GlobalPendingTicker: React.FC = () => {
    const [now] = React.useState(() => Date.now());
    // IMPORTANT: useCRM() uses data filtered by the cloud service for the current server only.
    // This ensures Company A never sees Company B's sales in the ticker.
    const { sales, directives } = useCRM();

    const tickerItems = useMemo(() => {
        const items: { id: string, text: string, type: 'sale' | 'alert' | 'info', priority: number, time: string }[] = [];
        // const now = Date.now(); // Used from state
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const dayStartTimestamp = startOfDay.getTime();

        // 1. SALES FEED (Whole Day Persistence)
        sales
            .filter(s => s.status === 'Approved' && s.timestamp >= dayStartTimestamp)
            .forEach(s => {
                const timeDiff = Math.floor((now - s.timestamp) / 60000); // minutes
                const timeStr = timeDiff < 1 ? 'LIVE' : `${timeDiff}m AGO`;
                
                items.push({
                    id: s.id,
                    text: `${s.agent} CLOSED ${s.customer} FOR $${Number(s.amount).toLocaleString()}`,
                    type: 'sale', // All sales now use the Gold Standard
                    priority: 2, // High priority
                    time: timeStr
                });
            });

        // 2. Community Updates (Last 24 Hours)
        directives
            .filter(d => (now - d.timestamp) < (24 * 60 * 60 * 1000))
            .forEach(d => {
                const timeDiff = Math.floor((now - d.timestamp) / 60000);
                const timeStr = timeDiff < 60 ? `${timeDiff}m AGO` : `${Math.floor(timeDiff/60)}h AGO`;

                items.push({
                    id: d.id,
                    text: d.message,
                    type: d.urgency === 'Flash' ? 'alert' : 'info',
                    priority: d.urgency === 'Flash' ? 3 : 1,
                    time: timeStr
                });
            });

        // Sort: Flash Alerts > Sales > Info
        return items.sort((a, b) => b.priority - a.priority);
    }, [sales, directives, now]);

    const displayItems = tickerItems.length > 0 
        ? tickerItems 
        : [{ id: 'idle', text: "Network Silent - Awaiting Updates", type: 'info' as const, priority: 0, time: 'LIVE' }];

    // Quadruple items to ensure smooth infinite scroll on wide screens
    const scrollingItems = [...displayItems, ...displayItems, ...displayItems, ...displayItems];

    return (
        <div className="w-full bg-surface-main border-b border-border-subtle h-12 overflow-hidden flex items-center relative z-20 shadow-sm group">
            
            {/* Static Label Block */}
            <div className="flex items-center px-4 shrink-0 h-full bg-surface-main border-r border-border-subtle relative z-20">
                <div className="relative mr-4">
                    <Globe size={16} className="text-accent-primary animate-spin-slow opacity-100" />
                    <div className="absolute inset-0 bg-accent-primary/20 blur-md rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold text-text-primary leading-none">System</span>
                    <span className="text-xs font-medium text-accent-primary leading-none mt-1">Pulse Online</span>
                </div>
            </div>

            {/* Scrolling Track */}
            <div className="flex items-center whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused] ml-4">
                {scrollingItems.map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-4 mx-8">
                        
                        {/* ITEM CONTENT */}
                        {item.type === 'sale' ? (
                            <div className="flex items-center gap-3 bg-status-warning/10 px-4 py-1.5 rounded-full border border-status-warning/20">
                                <Trophy size={16} className="text-status-warning" fill="currentColor" />
                                <div className="flex flex-col justify-center">
                                    <span className="text-xs font-bold text-status-warning">
                                        {item.text}
                                    </span>
                                </div>
                                <DollarSign size={16} className="text-status-warning" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-md ${
                                    item.type === 'alert' ? 'bg-status-error/10 text-status-error' : 'bg-status-info/10 text-status-info'
                                }`}>
                                    {item.type === 'alert' ? <AlertTriangle size={16} /> : <Radio size={16} />}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className={`text-xs font-medium ${
                                        item.type === 'alert' ? 'text-status-error' : 'text-text-secondary'
                                    }`}>
                                        {item.text}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Metadata / Separator */}
                        <span className="text-xs font-medium text-text-muted px-1.5">
                            {item.time}
                        </span>
                        
                        <div className="text-text-muted/30 text-xs ml-2">•</div>
                    </div>
                ))}
            </div>
            
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-ticker {
                    animation: ticker 120s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 8s linear infinite;
                }
            `}</style>
        </div>
    );
};
