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
        <div className="relative shrink-0 animate-in slide-in-from-bottom-6 fade-in duration-500 z-10 mt-2 dark">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent rounded-full blur-[2px]"></div>
            
            <div className="bg-[#050505]/95 text-white backdrop-blur-2xl border-t border-b border-white/10 p-1 shadow-2xl relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-indigo-500/5 pointer-events-none"></div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 h-[220px] relative z-10 p-2">
                    <div className="h-full transform transition-all hover:scale-[1.005] duration-500">
                        <CommandConsole onBroadcast={onBroadcast || (async () => {})} />
                    </div>

                    <div className="h-full overflow-hidden transform transition-all hover:scale-[1.005] duration-500">
                        {health && onRunDiagnostics && (
                            <SystemMonitor 
                                health={health} 
                                onRunDiagnostics={onRunDiagnostics} 
                                onTestUplink={onTestUplink}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
