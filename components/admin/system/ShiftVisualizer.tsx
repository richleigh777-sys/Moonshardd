
import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ShiftVisualizerProps {
    start: string;
    end: string;
}

export const ShiftVisualizer: React.FC<ShiftVisualizerProps> = ({ start, end }) => {
    const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return (h * 60) + m;
    };
    const startMins = parseTime(start);
    const endMins = parseTime(end);
    const dayMins = 24 * 60;
    
    let width = ((endMins - startMins) / dayMins) * 100;
    const left = (startMins / dayMins) * 100;
    
    // Handle overnight shifts (e.g. 10PM to 6AM)
    let isOvernight = false;
    if (endMins < startMins) {
        width = ((dayMins - startMins + endMins) / dayMins) * 100;
        isOvernight = true;
    }

    const durationHrs = Math.floor((isOvernight ? (dayMins - startMins + endMins) : (endMins - startMins)) / 60);

    return (
        <div className="mt-6 select-none">
            {/* Labels */}
            <div className="flex justify-between text-sm font-bold  text-text-muted mb-2 px-1">
                <span className="flex items-center gap-1"><Moon size={16}/> 00:00</span>
                <span className="flex items-center gap-1"><Sun size={16}/> 12:00</span>
                <span className="flex items-center gap-1"><Moon size={16}/> 23:59</span>
            </div>

            {/* Track */}
            <div className="h-4 w-full bg-surface-main rounded-full overflow-hidden relative border border-border-subtle shadow-inner">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map(p => (
                    <div key={p} className="absolute top-0 bottom-0 w-px bg-text-muted/10" style={{ left: `${p}%` }}></div>
                ))}

                {/* Active Period */}
                <div 
                    className="absolute h-full top-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90 shadow-sm"
                    style={{ 
                        left: `${left}%`, 
                        width: `${width}%`,
                        borderRadius: '4px'
                    }}
                >
                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[size:8px_8px]"></div>
                </div>
            </div>

            {/* Summary */}
            <div className="flex justify-center mt-2">
                <span className="px-3 py-1 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 text-sm font-bold text-accent-secondary  tracking-wide">
                    {durationHrs} Hour Operation Cycle
                </span>
            </div>
        </div>
    );
};
