import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const SuccessScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="text-center max-w-md w-full bg-slate-800/80 backdrop-blur-sm p-10 rounded-2xl border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Order Saved</h2>
        <p className="text-slate-400 mb-8 max-w-xs mx-auto">
          The manual offline order has been secured and sent to the administrative queue for processing.
        </p>
        <button onClick={() => window.location.reload()} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
          Create Another Order <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
