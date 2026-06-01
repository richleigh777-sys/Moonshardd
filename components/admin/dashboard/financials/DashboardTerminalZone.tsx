
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
        <div className="relative shrink-0 animate-in slide-in-from-bottom-6 fade-in duration-500 z-10 my-4 h-[280px]">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full relative z-10">
                <div className="h-full">
                    <CommandConsole onBroadcast={onBroadcast || (async () => {})} />
                </div>

                <div className="h-full overflow-hidden shadow-sm rounded-2xl bg-surface-main border border-border-subtle relative">
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
