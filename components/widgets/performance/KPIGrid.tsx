
import React from 'react';
import { DollarSign, FastForward, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KineticNumber } from '../../ui/KineticNumber';

interface KPIGridProps {
    nexusScore: number;
    grade: { label: string; color: string; bg: string; border: string; };
    periodStats: {
        totalRevenue: number;
        totalSpiffs: number;
        winRate: number;
        approved: any[];
    };
}

// Trend Indicator Component
const TrendBadge = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    
    return (
        <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${
            isPositive ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
            isNeutral ? 'text-text-muted bg-surface-alt border-border-subtle' :
            'text-rose-500 bg-rose-500/10 border-rose-500/20'
        }`}>
            {isPositive ? <TrendingUp size={10} strokeWidth={3} /> : isNeutral ? <Minus size={10} strokeWidth={3}/> : <TrendingDown size={10} strokeWidth={3} />}
            {isNeutral ? 'Stable' : `${Math.abs(value)}%`}
        </span>
    );
};

export const KPIGrid: React.FC<KPIGridProps> = ({ nexusScore, grade, periodStats }) => {
    
    // Simulate Trends (In a real app, pass previous period data)
    const [trends] = React.useState(() => ({
        revenue: Math.floor(Math.random() * 20) - 5,
        velocity: Math.floor(Math.random() * 15) + 2,
        winRate: Math.floor(Math.random() * 10) - 2
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* 1. GRADE PROFILE */}
            <div className="relative overflow-hidden rounded-[2rem] bg-surface-main border border-border-subtle group h-full min-h-[160px] shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-alt/50 to-transparent pointer-events-none"></div>
                <div className="p-6 flex flex-col items-center justify-center h-full text-center relative z-10">
                    <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-3">Performance Tier</p>
                    <div className="flex items-center gap-5">
                        <div className="relative inline-flex items-center justify-center w-20 h-20">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-surface-alt" />
                                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={251} strokeDashoffset={251 - (251 * nexusScore) / 100} className={`${grade.color} transition-all duration-1000 ease-out`} strokeLinecap="round" />
                            </svg>
                            <div className={`absolute inset-0 flex items-center justify-center`}>
                                <span className={`text-4xl font-black italic tracking-tighter ${grade.color}`}>{grade.label}</span>
                            </div>
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-text-primary">Score: {nexusScore}</p>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${grade.color}`}>
                                Top {(100 - nexusScore) > 0 ? (100 - nexusScore).toFixed(0) : '1'}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. TOTAL YIELD */}
            <div className="relative overflow-hidden rounded-[2rem] bg-surface-main border border-border-subtle group h-full min-h-[160px] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-2">
                                Total Yield <TrendBadge value={trends.revenue}/>
                            </p>
                            <h3 className="text-3xl font-black text-text-primary num-font tracking-tighter">
                                <KineticNumber value={periodStats.totalRevenue} prefix="$" />
                            </h3>
                        </div>
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 shadow-sm">
                            <DollarSign size={20} strokeWidth={2.5}/>
                        </div>
                    </div>
                    {/* Micro Chart / Sparkline */}
                    <div className="mt-4 h-8 w-full flex items-end gap-1 opacity-50">
                        {[40, 60, 45, 70, 50, 80, 65, 90, 75, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${h}%`, opacity: 0.3 + (i * 0.07) }}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. UNIT VELOCITY */}
            <div className="relative overflow-hidden rounded-[2rem] bg-surface-main border border-border-subtle group h-full min-h-[160px] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-2">
                                Unit Velocity <TrendBadge value={trends.velocity}/>
                            </p>
                            <h3 className="text-3xl font-black text-text-primary num-font tracking-tighter">
                                <KineticNumber value={periodStats.approved.length} suffix="" />
                                <span className="text-sm text-text-muted ml-1 font-bold">Closed</span>
                            </h3>
                        </div>
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20 shadow-sm">
                            <FastForward size={20} strokeWidth={2.5}/>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[9px] font-bold text-text-muted uppercase tracking-widest bg-indigo-500/5 px-3 py-1.5 rounded-lg border border-indigo-500/10">
                        <span>Bonus Accumulation</span>
                        <span className="text-indigo-500 font-black">+${periodStats.totalSpiffs.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* 4. CONVERSION RATE */}
            <div className="relative overflow-hidden rounded-[2rem] bg-surface-main border border-border-subtle group h-full min-h-[160px] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="p-6 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 flex items-center gap-2">
                                Win Rate <TrendBadge value={trends.winRate}/>
                            </p>
                            <h3 className="text-3xl font-black text-text-primary num-font tracking-tighter">
                                <KineticNumber value={periodStats.winRate} suffix="%" />
                            </h3>
                        </div>
                        <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shadow-sm">
                            <Target size={20} strokeWidth={2.5}/>
                        </div>
                    </div>
                    <div className="mt-4 relative h-2 w-full bg-surface-alt rounded-full overflow-hidden border border-border-subtle">
                        <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-text-muted/30 z-10" title="Goal"></div>
                        <div className="h-full bg-amber-500 transition-all duration-1000 ease-out" style={{ width: `${periodStats.winRate}%` }}></div>
                    </div>
                    <div className="flex justify-between mt-1 text-[8px] font-bold uppercase text-text-muted">
                        <span>Current</span>
                        <span>Goal: 60%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
