import React, { useState } from 'react';
import { CheckCircle2, Circle, Sparkles, Smile, Coffee, Sun } from 'lucide-react';

interface Task {
    id: string;
    text: string;
    completed: boolean;
}

export const DailyVibesWidget: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([
        { id: '1', text: 'Sip some coffee & review yesterday\'s wins', completed: false },
        { id: '2', text: 'Check in with the team (say hi!)', completed: false },
        { id: '3', text: 'Clear out high-priority unread messages', completed: false },
        { id: '4', text: 'Take a 5-minute stretch break', completed: false },
    ]);

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = (completedCount / tasks.length) * 100;

    return (
        <div className="bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl border border-border-subtle/60 dark:border-border-subtle/20 rounded-[32px] p-6 shadow-panel flex flex-col relative overflow-hidden group transition-all hover:shadow-float hover:-translate-y-1 shrink-0">
            {/* Soft decorative background glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <Sun className="text-amber-500 animate-[spin_10s_linear_infinite]" size={24} />
                        Good Morning!
                    </h3>
                    <p className="text-sm text-text-muted mt-1 font-medium">
                        Let's make today a great day. No stress.
                    </p>
                </div>
                <div className="p-3 bg-surface-main rounded-2xl shadow-sm border border-border-subtle">
                    <Sparkles className="text-accent-primary" size={20} />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6 relative z-10">
                <div className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                    <span>Vibe Check Progress</span>
                    <span>{completedCount} / {tasks.length}</span>
                </div>
                <div className="w-full bg-surface-alt rounded-full h-3 overflow-hidden border border-border-subtle shadow-inner">
                    <div 
                        className="bg-gradient-to-r from-accent-primary to-accent-secondary h-full rounded-full transition-all duration-700 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        {progress > 0 && (
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/40 to-transparent animate-pulse"></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-3 relative z-10">
                {tasks.map(task => (
                    <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group/btn ${
                            task.completed 
                                ? 'bg-surface-alt/50 border-transparent text-text-muted opacity-70' 
                                : 'bg-surface-main border-border-subtle hover:border-accent-primary/40 hover:shadow-md'
                        } border`}
                    >
                        <div className={`flex-shrink-0 transition-transform duration-300 ${task.completed ? 'scale-110 text-status-success' : 'text-text-muted group-hover/btn:text-accent-primary scale-100'}`}>
                            {task.completed ? <CheckCircle2 size={22} className="animate-in zoom-in duration-300" /> : <Circle size={22} />}
                        </div>
                        <span className={`font-medium transition-all duration-300 ${task.completed ? 'line-through decoration-text-muted/50' : 'text-text-primary group-hover/btn:-translate-y-0.5'}`}>
                            {task.text}
                        </span>
                    </button>
                ))}
            </div>

            {completedCount === tasks.length && (
                <div className="mt-6 p-4 bg-status-success/10 border border-status-success/20 rounded-2xl flex items-center gap-3 text-status-success animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                    <Smile size={20} className="animate-bounce" />
                    <span className="font-bold text-sm">You absolutely crushed it! Go grab a treat.</span>
                </div>
            )}
        </div>
    );
};
