
import { Calculator, PenTool, Phone } from 'lucide-react';
import { sfx } from '../../lib/soundService';

interface AgentHeaderControlsProps {
  onFocusMode: () => void; // Keep prop but ignore in UI to avoid breaking existing callers
  onToggleCalculator: () => void;
  isCalculatorOpen: boolean;
  onToggleScratchpad: () => void;
  isScratchpadOpen: boolean;
  onOpenTimeSheet: () => void; // Same
}

export const AgentHeaderControls: React.FC<AgentHeaderControlsProps> = ({
  onToggleCalculator,
  isCalculatorOpen,
  onToggleScratchpad,
  isScratchpadOpen
}) => {
  return (
    <div className="flex items-center gap-1 bg-surface-main/60  p-1 rounded-xl shadow-sm border border-border-subtle">
      <button 
        onClick={() => { onToggleCalculator(); sfx.playClick(); }}
        className={`p-2 rounded-xl transition-all active:scale-95 ${isCalculatorOpen ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`} 
        title="Calculator"
      >
        <Calculator size={16}/>
      </button>
      
      <button 
        onClick={() => { onToggleScratchpad(); sfx.playClick(); }}
        className={`p-2 rounded-xl transition-all active:scale-95 ${isScratchpadOpen ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`} 
        title="Notes"
      >
        <PenTool size={16}/>
      </button>
    </div>
  );
};

