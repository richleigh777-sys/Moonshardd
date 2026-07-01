
import { CommandConsole } from './CommandConsole';
import { SystemMonitor } from '../../../widgets/SystemMonitor';
import { SystemHealth } from '../../../../types';

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
        <div className="relative shrink-0 animate-in slide-in-from-bottom-6 fade-in duration-500 z-10 my-4 h-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                <div className="h-full">
                    <CommandConsole onBroadcast={onBroadcast || (async () => {})} />
                </div>

                <div className="h-full overflow-hidden shadow-panel rounded-[32px] bg-surface-main/60 dark:bg-surface-main/40 backdrop-blur-2xl border border-border-subtle/60 dark:border-border-subtle/20 relative group hover:shadow-float transition-all">
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
