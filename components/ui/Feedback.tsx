
import * as React from 'react';
import { Radio } from 'lucide-react';

export const SyncOverlay: React.FC<{ isSyncing: boolean }> = ({ isSyncing }) => {
  if (!isSyncing) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-surface-main/90 backdrop-blur-md border border-accent-primary/30 shadow-[0_4px_20px_rgba(0,0,0,0.1)] rounded-full px-4 py-2 flex items-center gap-3">
         <Radio size={16} className="text-accent-primary animate-pulse" />
         <span className="text-xs font-semibold text-text-primary tracking-wide">Syncing Data...</span>
      </div>
    </div>
  );
};


