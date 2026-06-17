
import React, { useMemo } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { CheckCircle, Shield, Trophy, Zap, Star } from 'lucide-react';

export const VictoryTicker = () => {
  const { sales } = useCRM();

  // Get recent approved sales
  const recentWins = useMemo(() => {
      return [...sales]
        .filter(s => s.status === 'Approved')
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
  }, [sales]);

  const streak = useMemo(() => {
      const today = new Date().setHours(0,0,0,0);
      return recentWins.filter(s => s.timestamp >= today).length;
  }, [recentWins]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-surface-main border border-border-subtle rounded-xl shadow-sm relative group">
      
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle bg-surface-alt/30 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
              <div className="p-1 bg-yellow-500/10 rounded text-yellow-500 border border-yellow-500/20">
                  <Trophy size={16} strokeWidth={3} />
              </div>
              <h4 className="text-xs font-[700]  text-text-primary tracking-widest">Victory Feed</h4>
          </div>
          {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded text-sm font-[700] text-orange-500  tracking-wide animate-pulse">
                  <Zap size={16} fill="currentColor"/> {streak} Today
              </div>
          )}
      </div>
      
      {/* Scroll Area */}
      <div className="flex-1 overflow-hidden relative">
        {recentWins.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-text-muted opacity-40">
            <Shield size={20} className="mb-2" />
            <p className="font-bold  tracking-widest text-xs">Awaiting First Blood...</p>
          </div>
        ) : (
          <div className="absolute inset-x-0 top-0 py-2 px-2 space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {recentWins.map((sale) => {
                const isWhale = Number(sale.amount) >= 1000;
                
                return (
                    <div 
                        key={sale.id}
                        className={`
                            relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-default
                            ${isWhale 
                                ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-status-warning/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                                : 'bg-surface-alt/30 border-border-subtle hover:bg-surface-alt hover:border-accent-primary/20'}
                        `}
                    >
                        {isWhale && (
                            <div className="absolute -top-1 -right-1 text-yellow-500 animate-bounce delay-700">
                                <Star size={16} fill="currentColor"/>
                            </div>
                        )}

                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`
                                w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border
                                ${isWhale ? 'bg-amber-500 text-white border-amber-400' : 'bg-emerald-500/10 text-status-success border-emerald-500/20'}
                            `}>
                                <CheckCircle size={16} strokeWidth={3} />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-xs font-[700]  truncate tracking-tight ${isWhale ? 'text-text-primary' : 'text-text-secondary'}`}>
                                    {sale.customer}
                                </p>
                                <p className="text-sm font-bold text-text-muted  tracking-wider flex items-center gap-1">
                                    <span>{sale.agent}</span>
                                    <span className="opacity-30">•</span>
                                    <span className="truncate max-w-[60px]">{sale.product}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="text-right shrink-0">
                            <p className={`font-mono font-[700] text-xs leading-none ${isWhale ? 'text-status-warning' : 'text-emerald-600'}`}>
                                ${Number(sale.amount).toLocaleString()}
                            </p>
                            <p className="text-sm text-text-muted font-bold mt-0.5 opacity-60">
                                {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                );
            })}
          </div>
        )}
        
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-surface-main to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};
