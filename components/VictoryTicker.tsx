import React from 'react';
import { useCRM } from '../hooks/useCRM';
import { CheckCircle, Clock, ArrowUpRight, Shield } from 'lucide-react';

export const VictoryTicker = () => {
  const { sales } = useCRM();

  // Sort by newest first, take top 5 for the live feed view
  const recentSales = [...sales]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  return (
    <div className="w-full">
      <div className="space-y-3">
        {recentSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm gap-3 border-2 border-dashed border-slate-800 rounded-xl">
            <Shield size={24} className="opacity-20" />
            <p className="font-bold  tracking-widest text-sm">Establishing live handshake...</p>
          </div>
        ) : (
          recentSales.map((sale) => (
            <div 
              key={sale.id}
              className="flex items-center justify-between p-4 bg-slate-800/20 border border-slate-800 rounded-xl hover:bg-slate-800/40 hover:border-indigo-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg ${
                  sale.status === 'Approved' ? 'bg-emerald-500/10 text-status-success' : 'bg-amber-500/10 text-status-warning'
                }`}>
                  {sale.status === 'Approved' ? <CheckCircle size={16} /> : <Clock size={16} />}
                </div>
                <div>
                  <p className="text-sm font-[700] text-slate-100 group-hover:text-white transition-colors tracking-tight ">
                    {sale.customer}
                  </p>
                  <p className="text-sm text-slate-500  tracking-[0.15em] mt-0.5 flex items-center gap-1.5">
                    <span className="text-accent-secondary font-bold">{sale.agent}</span>
                    <span className="opacity-30">•</span>
                    <span>{sale.product}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-4">
                <div>
                    <p className="font-mono font-[700] text-white text-base leading-none">
                    ${Number(sale.amount).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 font-bold mt-1">
                    {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="p-2 text-slate-600 group-hover:text-accent-secondary transition-colors">
                    <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
