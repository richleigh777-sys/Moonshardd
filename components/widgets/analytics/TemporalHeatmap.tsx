
import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Card, Badge } from '../../ui/Base';

interface TemporalHeatmapProps {
    data: number[][]; // 7 days x 4 blocks
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TIMES = ['Night', 'Morn', 'Noon', 'Eve'];
const TIME_RANGES = ['00:00 - 06:00', '06:00 - 12:00', '12:00 - 18:00', '18:00 - 24:00'];

export const TemporalHeatmap: React.FC<TemporalHeatmapProps> = ({ data }) => {
    // Flatten to find max for normalization
    const flat = data.flat();
    const maxVal = Math.max(...flat, 1);
    const [hoveredCell, setHoveredCell] = useState<{day: string, time: string, value: number} | null>(null);

    return (
        <Card variant="panel" className="xl:col-span-2 p-0 flex flex-col bg-surface-main border-border-subtle overflow-visible shadow-sm min-h-[320px]">
            <div className="p-5 border-b border-border-subtle flex justify-between items-center bg-surface-alt/20 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
                        <Clock size={16} strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h4 className="text-xs font-[700]  text-text-primary tracking-widest">Temporal Velocity</h4>
                        <p className="text-xs text-text-muted font-bold  tracking-wider">Revenue Density Map</p>
                    </div>
                </div>
                {hoveredCell && (
                    <div className="hidden md:flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                        <span className="text-xs font-bold text-text-secondary ">{hoveredCell.day} {hoveredCell.time}</span>
                        <Badge status="Approved">${hoveredCell.value.toLocaleString()}</Badge>
                    </div>
                )}
            </div>
            
            <div className="flex-1 p-4 flex flex-col justify-center relative">
                {/* Grid Container */}
                <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-2 h-full w-full">
                    
                    {/* Header Row (Days) */}
                    <div className="h-6"></div> {/* Spacer for Time Label Column */}
                    {DAYS.map(d => (
                        <div key={d} className="flex items-end justify-center pb-2">
                            <span className="text-xs font-[700]  text-text-muted tracking-wider">{d}</span>
                        </div>
                    ))}

                    {/* Data Rows */}
                    {TIMES.map((timeLabel, timeIdx) => (
                        <React.Fragment key={timeLabel}>
                            {/* Row Label */}
                            <div className="flex items-center justify-end pr-3">
                                <span className="text-xs font-[700]  text-text-muted tracking-widest writing-mode-vertical">{timeLabel}</span>
                            </div>
                            
                            {/* Cells */}
                            {data.map((dayData, dayIdx) => {
                                const val = dayData[timeIdx];
                                const intensity = val / maxVal;
                                const hasData = val > 0;
                                
                                return (
                                    <div 
                                        key={`${dayIdx}-${timeIdx}`} 
                                        className="relative group w-full h-12 md:h-16 rounded-xl transition-all hover:z-10"
                                        onMouseEnter={() => setHoveredCell({ day: DAYS[dayIdx], time: TIME_RANGES[timeIdx], value: val })}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    >
                                        <div 
                                            className="w-full h-full rounded-xl transition-all duration-500 border group-hover:scale-110 group-hover:shadow-lg"
                                            style={{ 
                                                backgroundColor: hasData 
                                                    ? `rgba(99, 102, 241, ${Math.max(0.1, intensity * 0.9)})` 
                                                    : 'rgba(255,255,255,0.02)',
                                                borderColor: hasData 
                                                    ? `rgba(99, 102, 241, ${Math.max(0.2, intensity)})` 
                                                    : 'var(--color-border-subtle)'
                                            }}
                                        >
                                            {/* Inner Glow for high value */}
                                            {intensity > 0.7 && (
                                                <div className="absolute inset-0 rounded-xl bg-indigo-400/20 blur-sm"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </Card>
    );
};
