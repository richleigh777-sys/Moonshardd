import { Terminal, ChevronUp, ChevronDown } from 'lucide-react';
import { SystemHealth } from '../../../types';

interface DashboardHeaderProps {
    health?: SystemHealth;
    onToggleTerminals?: () => void;
    areTerminalsOpen?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ health, onToggleTerminals, areTerminalsOpen }) => (
    <div className="flex justify-between items-end shrink-0">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${health?.cloudSync === 'OFFLINE' ? 'bg-red-500 text-red-500' : 'bg-emerald-500 text-emerald-500'}`}></div>
            <span className="text-xs font-bold text-text-muted">
                System {health?.cloudSync === 'OFFLINE' ? 'Offline' : 'Active'}
            </span>
        </div>
        {onToggleTerminals && (
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        window.dispatchEvent(new CustomEvent('NAVIGATE', { detail: 'enrollment' }));
                    }}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                >
                    New Order
                </button>
                <button 
                    onClick={onToggleTerminals}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        areTerminalsOpen 
                        ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30 shadow-sm' 
                        : 'bg-surface-main text-text-muted border-border-subtle hover:text-text-primary hover:border-accent-primary/30 shadow-sm'
                    }`}
                >
                    <div className={`p-0.5 rounded-md ${areTerminalsOpen ? 'bg-accent-primary text-white' : 'bg-surface-alt'}`}>
                        <Terminal size={12} />
                    </div>
                    {areTerminalsOpen ? 'Close Tools' : 'Open Tools'}
                    {areTerminalsOpen ? <ChevronDown size={12} className="ml-1 opacity-50"/> : <ChevronUp size={12} className="ml-1 opacity-50"/>}
                </button>
            </div>
        )}
    </div>
);
