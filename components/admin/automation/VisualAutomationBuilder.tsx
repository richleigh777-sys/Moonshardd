import React, { useState } from 'react';
import { Play, Webhook, MessageSquare, Zap, Plus, GitMerge, Clock, Settings2, Trash2, Save, Check } from 'lucide-react';
import { sfx } from '../../../lib/soundService';

type NodeType = 'trigger' | 'action' | 'condition' | 'delay';

interface AutomationNode {
    id: string;
    type: NodeType;
    name: string;
    description: string;
    icon: any;
    parentId?: string | null;
    branchId?: string; // For condition true/false paths
    config: any;
}

export const VisualAutomationBuilder = () => {
    const [nodes, setNodes] = useState<AutomationNode[]>([
        {
            id: 'node_1',
            type: 'trigger',
            name: 'Status Change',
            description: 'When lead status changes to "Won"',
            icon: Zap,
            parentId: null,
            config: { status: 'Won' }
        },
        {
            id: 'node_2',
            type: 'delay',
            name: 'Wait 15 Mins',
            description: 'Delay execution',
            icon: Clock,
            parentId: 'node_1',
            config: { duration: 15, unit: 'minutes' }
        },
        {
            id: 'node_3',
            type: 'action',
            name: 'Send Welcome SMS',
            description: 'Via Twilio Integration',
            icon: MessageSquare,
            parentId: 'node_2',
            config: { templateId: 'welcome_1' }
        }
    ]);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddNode = (parentId: string) => {
        sfx.playClick();
        const newNode: AutomationNode = {
            id: `node_${Date.now()}`,
            type: 'action',
            name: 'New Action',
            description: 'Configure this action',
            icon: Plus,
            parentId,
            config: {}
        };
        setNodes([...nodes, newNode]);
        setSelectedNode(newNode.id);
    };

    const handleSave = () => {
        sfx.playSubmit();
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 800);
    };

    const NodeComponent = ({ node, isRoot = false }: { node: AutomationNode, isRoot?: boolean }) => {
        const Icon = node.icon;
        const childNodes = nodes.filter(n => n.parentId === node.id);
        const isSelected = selectedNode === node.id;

        return (
            <div className="flex flex-col items-center">
                <div 
                    onClick={() => {sfx.playClick(); setSelectedNode(node.id);}}
                    className={`relative w-72 rounded-xl border p-4 cursor-pointer transition-all duration-300 group ${isSelected ? 'bg-surface-main border-accent-primary shadow-lg shadow-accent-primary/20 ring-1 ring-accent-primary/50 z-10' : 'bg-surface-main/60 border-border-subtle hover:bg-surface-main hover:border-accent-primary/50 shadow-sm'}`}
                >
                    {isRoot && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent-primary text-white text-sm font-[700]  tracking-widest rounded-full shadow-md flex items-center gap-1">
                            <Play size={16} /> Entry Trigger
                        </div>
                    )}
                    
                    <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isSelected ? 'bg-accent-primary/20 border-accent-primary text-accent-primary' : 'bg-surface-alt border-border-subtle text-text-muted group-hover:text-text-primary'}`}>
                            <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-accent-primary' : 'text-text-primary'}`}>{node.name}</h4>
                            <p className="text-sm text-text-muted mt-0.5 leading-tight">{node.description}</p>
                        </div>
                    </div>
                </div>

                {childNodes.length > 0 ? (
                    <div className="flex flex-col items-center">
                        <div className="w-px h-8 bg-border-subtle"></div>
                        <div className="flex items-start gap-5 relative">
                            {childNodes.map((child, idx) => (
                                <div key={child.id} className="flex flex-col items-center relative">
                                    {childNodes.length > 1 && (
                                        <div className="absolute top-0 w-full flex justify-center -z-10">
                                            <div className={`w-full h-px bg-border-subtle absolute top-0 ${idx === 0 ? 'left-1/2' : idx === childNodes.length - 1 ? 'right-1/2' : ''}`} />
                                            <div className="w-px h-8 bg-border-subtle absolute top-0" />
                                        </div>
                                    )}
                                    <NodeComponent node={child} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-px h-6 bg-border-subtle"></div>
                        <button 
                            onClick={() => handleAddNode(node.id)}
                            className="w-8 h-8 rounded-full bg-surface-alt border border-border-subtle hover:border-accent-primary hover:bg-surface-main text-text-muted hover:text-accent-primary flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-95"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const activeNode = nodes.find(n => n.id === selectedNode);

    return (
        <div className="h-full flex flex-col bg-surface-main relative overflow-hidden">
            <div className="h-16 px-4 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface-main/80 backdrop-blur-md z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent-primary/20 border border-accent-primary/50 flex items-center justify-center text-accent-primary shadow-inner">
                        <GitMerge size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-[700] text-text-primary tracking-tight">Post-Sale Fulfillment Flow</h2>
                        <p className="text-sm font-medium text-text-muted flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active &mdash; 2,491 executions
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-surface-alt border border-border-subtle hover:bg-surface-main hover:text-text-primary text-text-muted rounded-xl text-sm font-bold  tracking-wider transition-all">
                        Test Workflow
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-4 py-2 bg-text-primary hover:bg-text-secondary text-surface-main rounded-xl text-sm font-bold  tracking-widest shadow-lg transition-all flex items-center gap-2"
                    >
                        {isSaving ? <><Check size={16} className="animate-pulse"/> Saved</> : <><Save size={16} /> Publish</>}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-auto bg-surface-alt/30 relative custom-scrollbar">
                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--color-border-subtle) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                    
                    <div className="min-h-full min-w-max p-12 flex justify-center items-start pt-24 z-10 relative">
                        {nodes.filter(n => n.parentId === null).map(rootNode => (
                            <NodeComponent key={rootNode.id} node={rootNode} isRoot />
                        ))}
                    </div>
                </div>

                {selectedNode && activeNode && (
                    <div className="w-80 border-l border-border-subtle bg-surface-main/95 backdrop-blur-xl shrink-0 flex flex-col shadow-2xl z-20 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings2 size={16} className="text-text-muted" />
                                <h3 className="text-sm font-[700]  tracking-widest text-text-secondary">Node Configuration</h3>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary">
                                &times;
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-text-muted  tracking-wider">Node Name</label>
                                <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} 
                                    type="text" 
                                    value={activeNode.name}
                                    onChange={(e) => setNodes(nodes.map(n => n.id === activeNode.id ? {...n, name: e.target.value} : n))}
                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-accent-primary transition-all"
                                />
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-text-muted  tracking-wider">Node Type</label>
                                <select 
                                    value={activeNode.type}
                                    onChange={(e) => setNodes(nodes.map(n => n.id === activeNode.id ? {...n, type: e.target.value as NodeType} : n))}
                                    className="w-full bg-surface-alt border border-border-subtle rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-accent-primary transition-all"
                                >
                                    <option value="trigger">Trigger</option>
                                    <option value="action">Action</option>
                                    <option value="condition">Condition</option>
                                    <option value="delay">Time Delay</option>
                                </select>
                            </div>

                            <div className="h-px bg-border-subtle/50 my-4"></div>

                            {activeNode.type === 'action' && (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-text-muted  tracking-wider">Integration</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm hover:bg-accent-primary/20 transition-all">
                                                <MessageSquare size={18} />
                                                <span className="text-sm font-bold  tracking-wider">Twilio SMS</span>
                                            </button>
                                            <button className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border-subtle bg-surface-alt text-text-muted shadow-sm hover:bg-surface-main hover:border-text-primary transition-all">
                                                <Webhook size={18} />
                                                <span className="text-sm font-bold  tracking-wider">Webhook</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-text-muted  tracking-wider">SMS Template</label>
                                        <select className="w-full bg-surface-main border border-border-subtle rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-accent-primary transition-all shadow-inner">
                                            <option>Welcome Series 1</option>
                                            <option>Payment Failed</option>
                                            <option>Review Request</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeNode.type === 'delay' && (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-text-muted  tracking-wider">Wait Amount</label>
                                        <div className="flex gap-2">
                                            <input autoComplete="off" data-lpignore="true" data-prevent-autofill="true" spellCheck={false} type="number" defaultValue={15} className="w-24 bg-surface-main border border-border-subtle rounded-xl px-3 py-2 text-sm font-bold text-center outline-none focus:border-accent-primary" />
                                            <select className="flex-1 bg-surface-main border border-border-subtle rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-accent-primary">
                                                <option>Minutes</option>
                                                <option>Hours</option>
                                                <option>Days</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-border-subtle bg-surface-alt/50">
                            <button 
                                onClick={() => {
                                    setNodes(nodes.filter(n => n.id !== activeNode.id));
                                    setSelectedNode(null);
                                    sfx.playError();
                                }}
                                className="w-full h-10 rounded-xl border border-status-error/30 text-status-error hover:bg-status-error hover:text-white transition-all text-sm font-bold  tracking-wider flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Delete Node
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
