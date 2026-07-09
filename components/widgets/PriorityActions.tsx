
import * as React from 'react';
import { useMemo, useState } from 'react';
import { Phone, Check, Sparkles, Clock, AlertTriangle, X, ListFilter, ArrowUp, ArrowDown } from 'lucide-react';
import { Note } from '../../types';
import { Card, Badge, Button } from '../ui/Base';
import { useCRM } from '../../hooks/useCRM';
import { executeDialer } from '../../lib/dialer';

interface PriorityActionsProps {
    callbacks: Note[]; // Changed from CallbackTask to Note
    toggleCallback: (id: string) => void;
}

type SortMode = 'priority' | 'date-asc' | 'date-desc';

export const PriorityActions: React.FC<PriorityActionsProps> = ({ callbacks, toggleCallback }) => {
    const { systemConfig } = useCRM();
    // Safety state to prevent accidental deletions
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [sortMode, setSortMode] = useState<SortMode>('priority');

    // Prioritize: High priority flag > Reorder/Declined keywords in content > Date proximity
    const priorityQueue = useMemo(() => {
        const sorted = [...callbacks].filter(c => c.type === 'callback');

        if (sortMode === 'priority') {
            sorted.sort((a, b) => {
                const urgencyA = a.priority === 'High' ? 2 : a.content.includes('Declined') ? 1 : 0;
                const urgencyB = b.priority === 'High' ? 2 : b.content.includes('Declined') ? 1 : 0;
                // Primary: Urgency, Secondary: Due Date (Sooner first)
                return urgencyB - urgencyA || a.timestamp - b.timestamp;
            });
        } else if (sortMode === 'date-asc') {
            // Oldest/Soonest First
            sorted.sort((a, b) => a.timestamp - b.timestamp);
        } else if (sortMode === 'date-desc') {
            // Newest/Furthest First
            sorted.sort((a, b) => b.timestamp - a.timestamp);
        }

        return sorted.slice(0, 5);
    }, [callbacks, sortMode]);

    const handleActionClick = (id: string) => {
        if (confirmingId === id) {
            toggleCallback(id);
            setConfirmingId(null);
        } else {
            setConfirmingId(id);
        }
    };

    return (
        <Card className="h-full flex flex-col p-4 bg-surface-main border border-border-subtle shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                        <Sparkles size={18} />
                    </div>
                    <h3 className="font-bold text-text-primary text-sm tracking-tight">Priority Actions</h3>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <button 
                            className="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
                            title="Sort List"
                        >
                            <ListFilter size={16} />
                        </button>
                        {/* Sort Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-32 bg-surface-main border border-border-subtle rounded-xl shadow-xl p-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all transform origin-top-right scale-95 group-hover:scale-100">
                            <button 
                                onClick={() => setSortMode('priority')}
                                className={`w-full text-left px-3 py-2 text-xs font-bold  rounded-lg flex items-center gap-2 ${sortMode === 'priority' ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-surface-alt'}`}
                            >
                                <Sparkles size={16}/> Smart Sort
                            </button>
                            <button 
                                onClick={() => setSortMode('date-asc')}
                                className={`w-full text-left px-3 py-2 text-xs font-bold  rounded-lg flex items-center gap-2 ${sortMode === 'date-asc' ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-surface-alt'}`}
                            >
                                <ArrowUp size={16}/> Date (Oldest)
                            </button>
                            <button 
                                onClick={() => setSortMode('date-desc')}
                                className={`w-full text-left px-3 py-2 text-xs font-bold  rounded-lg flex items-center gap-2 ${sortMode === 'date-desc' ? 'bg-accent-primary/10 text-accent-primary' : 'text-text-secondary hover:bg-surface-alt'}`}
                            >
                                <ArrowDown size={16}/> Date (Newest)
                            </button>
                        </div>
                    </div>
                    <Badge status="High">{priorityQueue.length}</Badge>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {priorityQueue.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-60">
                        <Check size={24} className="mb-2"/>
                        <p className="text-xs font-medium">All priorities cleared</p>
                    </div>
                ) : priorityQueue.map(task => {
                    const isUrgent = task.priority === 'High' || task.content.toLowerCase().includes('declined');
                    const isConfirming = confirmingId === task.id;
                    
                    return (
                        <div key={task.id} className={`p-4 border rounded-xl transition-all group bg-surface-main relative overflow-hidden ${isUrgent ? 'border-l-4 border-l-status-error border-y-border-subtle border-r-border-subtle' : 'border-border-subtle hover:border-accent-primary'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-sm text-text-primary">{task.customerName || 'Unknown'}</h4>
                                    <p className="text-xs font-mono text-text-secondary mt-0.5">{task.phone}</p>
                                </div>
                                <div className="text-right">
                                    <Badge status={isUrgent ? 'High' : 'Mid'} className="scale-90 origin-right">
                                        {isUrgent ? 'Priority' : 'Scheduled'}
                                    </Badge>
                                    <p className="text-xs font-mono text-text-muted mt-1">{task.time}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-3 bg-surface-alt/50 p-2 rounded-lg">
                                {isUrgent ? <AlertTriangle size={16} className="text-status-error"/> : <Clock size={16} className="text-text-muted"/>}
                                <p className="text-xs text-text-secondary line-clamp-1 italic">
                                    {task.reason || task.content}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button 
                                    variant="primary" 
                                    className="flex-1 h-8 text-xs font-bold"
                                    onClick={() => executeDialer(task.phone, { phone: task.phone }, systemConfig)}
                                >
                                    <Phone size={16}/> Call
                                </Button>
                                
                                {isConfirming ? (
                                    <div className="flex gap-1 animate-in slide-in-from-right-2 fade-in duration-300">
                                        <Button 
                                            variant="danger" 
                                            className="h-8 px-3 text-xs font-[700]  tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-red-500/20"
                                            onClick={() => handleActionClick(task.id)}
                                        >
                                            Confirm
                                        </Button>
                                        <Button 
                                            variant="secondary" 
                                            className="h-8 w-8 p-0 hover:bg-surface-highlight transition-colors"
                                            onClick={() => setConfirmingId(null)}
                                        >
                                            <X size={16}/>
                                        </Button>
                                    </div>
                                ) : (
                                    <Button 
                                        variant="secondary" 
                                        className="h-8 w-8 p-0 text-text-muted hover:text-status-success hover:border-status-success hover:bg-status-success/10 transition-all duration-300 group/check"
                                        onClick={() => handleActionClick(task.id)}
                                    >
                                        <Check size={16} className="group-hover/check:scale-125 group-hover/check:rotate-12 transition-transform duration-300 ease-out" strokeWidth={3} />
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};
