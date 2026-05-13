
import React from 'react';
import { AlertTriangle, Skull, ShieldAlert } from 'lucide-react';
import { Card } from '../ui/Base';
import { AgentPerformance } from '../../types';

export const WallOfShame: React.FC<{ agents: AgentPerformance[] }> = ({ agents }) => {
  const lowPerformers = agents.filter(a => a.totalRevenue === 0).slice(0, 5);

  return (
    <Card variant="panel" className="h-full p-0 bg-red-950/10 border-red-900/30 overflow-hidden relative group">
      {/* Background Warning Stripes */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(239,68,68,0.03)_10px,rgba(239,68,68,0.03)_20px)] pointer-events-none"></div>
      
      <div className="p-4 border-b border-red-900/30 bg-red-900/20 flex items-center justify-between relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/20 rounded-lg text-red-500 border border-red-500/30">
                <Skull size={14} />
            </div>
            <h3 className="text-xs font-black uppercase text-red-500 tracking-widest">Zero Yield Alert</h3>
        </div>
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#EF4444]"></div>
      </div>

      <div className="p-3 relative z-10">
        {lowPerformers.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center opacity-70">
                <ShieldAlert size={32} className="text-emerald-500 mb-2"/>
                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sector Clear</div>
                <p className="text-[9px] text-emerald-500/70 mt-1">All units operational.</p>
            </div>
        ) : (
            <div className="space-y-2">
                {lowPerformers.map(a => (
                    <div key={a.agentId} className="flex items-center justify-between p-3 rounded-xl bg-red-900/10 border border-red-900/20 hover:bg-red-900/30 hover:border-red-500/30 transition-all group/item">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-900/40 rounded-lg flex items-center justify-center text-[10px] font-black text-red-400 border border-red-500/20">
                                {a.agentName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-red-200 group-hover/item:text-white transition-colors">{a.agentName}</span>
                                <span className="text-[8px] font-mono text-red-400/60 uppercase tracking-wider">No Production</span>
                            </div>
                        </div>
                        <AlertTriangle size={14} className="text-red-500 opacity-60 group-hover/item:opacity-100 group-hover/item:animate-pulse" />
                    </div>
                ))}
            </div>
        )}
      </div>
    </Card>
  );
};
