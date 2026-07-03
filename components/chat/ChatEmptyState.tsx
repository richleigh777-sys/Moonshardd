import { MessageSquare, Hash, Zap } from 'lucide-react';

export const ChatEmptyState: React.FC = () => (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-surface-main select-none h-full">
        <div className="relative z-10 w-full max-w-lg flex flex-col items-center">
            <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-accent-secondary" />
            </div>
            <h3 className="text-xl font-bold text-text-primary">Agent Comms & Routing</h3>
            <p className="text-sm text-text-muted mt-3 max-w-sm">
                Select a conversation from the sidebar or utilize command shortcuts to transfer leads.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-md text-left">
                <div className="bg-surface-alt p-4 rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-indigo-500/20 text-accent-secondary rounded-lg"><Zap size={16}/></div>
                        <span className="font-semibold text-text-primary text-sm">Slash Commands</span>
                    </div>
                    <p className="text-sm text-text-muted mb-2">Type <code className="bg-surface-main px-1 rounded text-text-primary">/</code> to access CRM functions:</p>
                    <ul className="text-sm text-text-muted space-y-1">
                        <li><span className="text-accent-secondary font-mono">/lead</span> - Share lead file</li>
                        <li><span className="text-accent-secondary font-mono">/stack</span> - Teams Stack</li>
                        <li><span className="text-accent-secondary font-mono">/dnc</span> - Flag Do Not Call</li>
                        <li><span className="text-accent-secondary font-mono">/callback</span> - Schedule follow-up</li>
                    </ul>
                </div>
                <div className="bg-surface-alt p-4 rounded-xl border border-border-subtle">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-emerald-500/20 text-status-success rounded-lg"><Hash size={16}/></div>
                        <span className="font-semibold text-text-primary text-sm">Global Wins</span>
                    </div>
                    <p className="text-sm text-text-muted">
                        Join the <span className="font-medium text-text-primary"># Global Lobby</span> to announce daily sales and view realtime team activity.
                    </p>
                </div>
            </div>
        </div>
    </div>
);
