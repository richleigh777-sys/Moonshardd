
import React from 'react';
import { StickyNote, Clock } from 'lucide-react';
import { CallLog, Note } from '../../types';

interface TimelineEvent {
    id: string;
    timestamp: number;
    type: 'call' | 'note' | 'callback';
    title: string;
    content: string;
    status?: string;
    agentName: string;
}

interface LeadTimelineProps {
    notes: Note[];
    callLogs: CallLog[];
    phone?: string;
}

export const LeadTimeline: React.FC<LeadTimelineProps> = ({ notes, callLogs, phone }) => {
    const events = React.useMemo(() => {
        const filteredNotes = notes.filter(n => n.phone === phone);
        const filteredCalls = callLogs.filter(c => c.partnerId === phone || c.partnerName === phone);

        const timeline: TimelineEvent[] = [
            ...filteredNotes.map(n => ({
                id: n.id,
                timestamp: n.timestamp,
                type: n.type as 'note' | 'callback',
                title: n.type === 'callback' ? 'Callback Scheduled' : 'Interaction Note',
                content: n.content,
                agentName: n.agentName
            })),
            ...filteredCalls.map(c => ({
                id: c.id,
                timestamp: c.startTime,
                type: 'call' as const,
                title: `${c.type === 'video' ? 'Video' : 'Voice'} Connection`,
                content: `Duration: ${Math.floor(c.duration / 60)}m ${c.duration % 60}s`,
                status: c.outcome,
                agentName: 'System' // Call logs might not have agent name directly in current type
            }))
        ];

        return timeline.sort((a, b) => b.timestamp - a.timestamp);
    }, [notes, callLogs, phone]);

    if (events.length === 0) {
        return (
            <div className="py-12 text-center opacity-30">
                <Clock size={32} className="mx-auto mb-3" />
                <p className="text-xs font-medium  tracking-wide text-text-muted">No interactions logged</p>
            </div>
        );
    }

    return (
        <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-border-subtle/50">
            {events.map((event, i) => (
                <div key={event.id} className="relative group animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    {/* Icon Dot */}
                    <div className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-surface-main z-10 ${
                        event.type === 'call' ? 'bg-indigo-500' :
                        event.type === 'callback' ? 'bg-amber-500' :
                        'bg-accent-primary'
                    }`} />

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-text-primary  tracking-tight">{event.title}</span>
                                {event.status && (
                                    <span className={`text-sm font-bold px-3 py-1.5 rounded ${
                                        event.status === 'Connected' ? 'bg-emerald-500/10 text-status-success border border-emerald-500/20' :
                                        'bg-red-500/10 text-status-error border border-red-500/20'
                                    }`}>
                                        {event.status}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs font-medium text-text-muted">
                                {new Date(event.timestamp).toLocaleDateString()} @ {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <div className="p-3 bg-surface-alt/50 border border-border-subtle rounded-xl group-hover:bg-surface-alt transition-colors">
                            <p className="text-xs text-text-secondary leading-relaxed">
                                {event.content}
                            </p>
                            <div className="mt-2 flex items-center gap-1.5 text-sm font-bold text-text-muted ">
                                <StickyNote size={16} />
                                Logged by {event.agentName}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
