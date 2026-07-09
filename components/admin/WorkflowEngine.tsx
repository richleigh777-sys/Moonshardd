import React, { useState } from 'react';
import { Plus, Play, Pause, Trash2, GitMerge, AlertCircle, Clock, Send, RotateCcw } from 'lucide-react';
import { Card } from '../ui/Base';

export const WorkflowEngine: React.FC = () => {
    const [workflows, setWorkflows] = useState([
        {
            id: 'wf-1',
            name: 'Declined Sale Recovery',
            status: 'active',
            trigger: 'Lead Status = Declined',
            actions: [
                { type: 'delay', value: 'Wait 2 Hours', icon: Clock },
                { type: 'sms', value: 'Send "We missed you" SMS', icon: Send },
                { type: 'route', value: 'Move to Recovery Engine', icon: RotateCcw }
            ]
        },
        {
            id: 'wf-2',
            name: 'High Value Lead Alert',
            status: 'active',
            trigger: 'Lead Value > $1,000',
            actions: [
                { type: 'notify', value: 'Alert Sales Manager', icon: AlertCircle },
                { type: 'route', value: 'Assign to Senior Agent', icon: GitMerge }
            ]
        }
    ]);

    return (
        <div className="p-6 h-full flex flex-col space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-text-primary tracking-tight">Visual Workflow Automation</h2>
                    <p className="text-text-secondary text-sm mt-1">Event-driven macro system to automate repetitive CRM actions.</p>
                </div>
                <button className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm">
                    <Plus size={16} />
                    New Macro
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {workflows.map((wf) => (
                    <Card key={wf.id} className="p-5 flex flex-col hover:border-accent-primary/50 transition-colors cursor-pointer group bg-surface-main border-border-subtle shadow-sm rounded-2xl relative overflow-hidden">
                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${wf.status === 'active' ? 'bg-status-success' : 'bg-status-warning'} shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${wf.status === 'active' ? 'status-success' : 'status-warning'}`}></div>
                                <h3 className="font-semibold text-text-primary text-lg">{wf.name}</h3>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 hover:bg-surface-alt rounded text-text-secondary hover:text-text-primary transition-colors">
                                    {wf.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                <button className="p-1.5 hover:bg-surface-alt rounded text-status-error hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 relative z-10">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="bg-surface-alt px-2.5 py-1 rounded border border-border-subtle font-mono text-xs text-text-secondary uppercase tracking-wider">IF</span>
                                <span className="font-medium text-text-primary bg-surface-alt px-3 py-1 rounded-lg border border-border-subtle">{wf.trigger}</span>
                            </div>

                            <div className="pl-3 border-l-2 border-border-subtle/50 ml-3 space-y-4 py-2">
                                {wf.actions.map((action, idx) => (
                                    <div key={idx} className="flex items-center gap-3 relative">
                                        <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-3 h-[2px] bg-border-subtle/50"></div>
                                        <div className="w-8 h-8 rounded-full bg-surface-alt border border-border-subtle flex items-center justify-center shrink-0">
                                            <action.icon size={14} className="text-text-secondary" />
                                        </div>
                                        <span className="text-sm text-text-primary font-medium">{action.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
