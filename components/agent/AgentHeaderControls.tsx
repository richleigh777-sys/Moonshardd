
import { Zap, Calculator, PenTool, Clock } from 'lucide-react';
import { sfx } from '../../lib/soundService';

interface AgentHeaderControlsProps {
  onFocusMode: () => void;
  onToggleCalculator: () => void;
  isCalculatorOpen: boolean;
  onToggleScratchpad: () => void;
  isScratchpadOpen: boolean;
  onOpenTimeSheet: () => void;
  onNextCall?: () => void;
  hasPendingCallbacks?: boolean;
}

export const AgentHeaderControls: React.FC<AgentHeaderControlsProps> = ({
  onFocusMode,
  onToggleCalculator,
  isCalculatorOpen,
  onToggleScratchpad,
  isScratchpadOpen,
  onOpenTimeSheet,
  onNextCall,
  hasPendingCallbacks
}) => {
  return (
    <div className="flex items-center gap-1 bg-surface-main/60 backdrop-blur-xl p-1 rounded-2xl shadow-sm border border-border-subtle">
      {onNextCall && (
        <>
           <button 
                onClick={() => { onNextCall(); sfx.playSubmit(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 group overflow-hidden relative shadow-lg ${hasPendingCallbacks ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-surface-highlight text-text-muted cursor-not-allowed opacity-50'}`}
                title="Force Next Engagement"
                disabled={!hasPendingCallbacks}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Zap size={16} className={hasPendingCallbacks ? 'fill-current animate-pulse' : ''}/>
                <span className="text-xs font-[700]  tracking-[0.1em]">Next Call</span>
            </button>
            <div className="w-px h-5 bg-border-subtle mx-1"></div>
        </>
      )}

      <button 
        onClick={() => { onFocusMode(); sfx.playClick(); }}
        className="p-2.5 rounded-xl text-text-muted hover:bg-accent-primary hover:text-white transition-all active:scale-95 group" 
        title="Enter Focus Mode"
      >
        <Zap size={18} className="group-hover:fill-current"/>
      </button>
      
      <div className="w-px h-5 bg-border-subtle mx-1"></div>
      
      <button 
        onClick={() => { onToggleCalculator(); sfx.playClick(); }}
        className={`p-2.5 rounded-xl transition-all active:scale-95 ${isCalculatorOpen ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`} 
        title="Calculator"
      >
        <Calculator size={18}/>
      </button>
      
      <button 
        onClick={() => { onToggleScratchpad(); sfx.playClick(); }}
        className={`p-2.5 rounded-xl transition-all active:scale-95 ${isScratchpadOpen ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`} 
        title="Notes"
      >
        <PenTool size={18}/>
      </button>
      
      <button 
        onClick={() => { onOpenTimeSheet(); sfx.playClick(); }}
        className="p-2.5 text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all rounded-xl active:scale-95" 
        title="My Time Log"
      >
        <Clock size={18}/>
      </button>
    </div>
  );
};
