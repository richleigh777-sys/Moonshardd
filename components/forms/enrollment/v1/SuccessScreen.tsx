import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const SuccessScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="text-center max-w-md w-full bg-slate-800/80  p-10 rounded-xl border border-border-subtle shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Order Saved</h2>
        <p className="text-text-secondary mb-8 max-w-xs mx-auto">
          The manual offline order has been secured and sent to the administrative queue for processing.
        </p>
        <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-sm">
          Create Another Order <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
