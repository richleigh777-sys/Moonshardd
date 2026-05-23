import { CommandConsole } from './financials/CommandConsole';
import { SystemMonitor } from '../../widgets/SystemMonitor';
import { SystemHealth } from '../../../types';

interface DashboardTerminalZoneProps {
    areTerminalsOpen: boolean;
    onBroadcast?: (msg: string, urgency: 'Routine' | 'Immediate' | 'Flash') => Promise<void>;
    health?: SystemHealth;
    onRunDiagnostics?: () => void;
    onTestUplink?: () => Promise<boolean>;
}

export const DashboardTerminalZone: React.FC<DashboardTerminalZoneProps> = ({
    areTerminalsOpen, onBroadcast, health, onRunDiagnostics, onTestUplink
}) => {
    if (!areTerminalsOpen) return null;

    return (
        <div className="relative shrink-0 animate-in slide-in-from-bottom-6 fade-in duration-500 z-10 my-4 h-[280px]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent rounded-full blur-[3px]"></div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full relative z-10">
                <div className="h-full transform transition-all hover:scale-[1.005] duration-500">
                    <CommandConsole onBroadcast={onBroadcast || (async () => {})} />
                </div>

                <div className="h-full overflow-hidden transform transition-all hover:scale-[1.005] duration-500 shadow-panel rounded-[1.25rem] bg-surface-main/90 border border-border-subtle backdrop-blur-3xl relative">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50"></div>
                    <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/5 via-transparent to-accent-primary/5 dark:from-indigo-500/10 dark:to-accent-primary/10 transition-opacity duration-700 pointer-events-none"></div>
                    {health && onRunDiagnostics && (
                        <div className="relative z-10 h-full p-2">
                             <SystemMonitor 
                                 health={health} 
                                 onRunDiagnostics={onRunDiagnostics} 
                                 onTestUplink={onTestUplink}
                             />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
