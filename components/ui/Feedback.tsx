
import * as React from 'react';
import { Database, Radio } from 'lucide-react';

export const SyncOverlay: React.FC<{ isSyncing: boolean }> = ({ isSyncing }) => {
  if (!isSyncing) return null;
  return (
    <div className="fixed inset-0 bg-[#09090b] text-white/90 backdrop-blur-xl z-[9999] flex items-center justify-center transition-all duration-500">
      <div className="relative flex flex-col items-center">
        
        {/* Holographic Radar Scanner */}
        <div className="w-48 h-48 rounded-full border border-accent-primary/30 relative flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(13,148,136,0.2)] bg-accent-primary/5 overflow-hidden">
            {/* Scanning Line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-primary/20 to-transparent w-full h-[2px] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
            
            {/* Concentric Circles */}
            <div className="absolute w-32 h-32 rounded-full border border-accent-primary/20 animate-pulse"></div>
            <div className="absolute w-16 h-16 rounded-full border border-accent-primary/40"></div>
            
            {/* Central Icon */}
            <div className="p-4 bg-accent-primary/10 rounded-xl backdrop-blur-sm border border-accent-primary/30 z-10">
                <Database size={32} className="text-accent-primary animate-pulse" />
            </div>
        </div>
        
        {/* Text Interface */}
        <div className="text-center space-y-3 relative z-10">
            <h3 className="text-2xl font-bold  tracking-widest text-white drop-shadow-lg flex items-center justify-center gap-3">
                <Radio size={20} className="text-accent-primary animate-pulse" />
                Loading Data
            </h3>
            
            <div className="flex flex-col items-center gap-1">
                <p className="text-xs font-mono font-bold text-accent-primary/80  tracking-widest bg-accent-primary/10 px-3 py-1 rounded border border-accent-primary/20">
                    Connecting to server...
                </p>
            </div>
        </div>

        <style>{`
            @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
        `}</style>
      </div>
    </div>
  );
};


