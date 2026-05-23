
import React, { useState } from 'react';
import { Delete, X, History, Calculator } from 'lucide-react';
import { sfx } from '../../lib/soundService';

export const QuickCalculator = ({ onClose }: { onClose?: () => void }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const handlePress = (val: string) => {
        sfx.playClick();
        if (val === 'C') {
            setDisplay('0');
            setEquation('');
        } else if (val === 'DEL') {
            setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (val === '=') {
            try {
                // Safe eval replacement
                const res = new Function('return ' + (equation + display).replace(/x/g, '*'))();
                const resultStr = String(Math.round(res * 100000000) / 100000000); // Avoid float errors
                setHistory(prev => [`${equation}${display} = ${resultStr}`, ...prev].slice(0, 10));
                setDisplay(resultStr);
                setEquation('');
            } catch {
                setDisplay('Error');
                sfx.playError();
            }
        } else if (['+', '-', 'x', '/'].includes(val)) {
            setEquation(display + ' ' + val + ' ');
            setDisplay('0');
        } else if (val === '%') {
            const num = parseFloat(display);
            setDisplay(String(num / 100));
        } else {
            setDisplay(display === '0' || display === 'Error' ? val : display + val);
        }
    };

    const buttons = [
        'C', 'DEL', '%', '/',
        '7', '8', '9', 'x',
        '4', '5', '6', '-',
        '1', '2', '3', '+',
        '0', '.', 'HIST', '='
    ];

    return (
        <div className="w-72 refraction-glass rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-300 relative group border border-border-subtle shadow-2xl">
            
            {/* Header */}
            <div className="px-5 py-4 bg-surface-alt/40 border-b border-border-subtle flex justify-between items-center handle cursor-move backdrop-blur-md">
                <div className="flex items-center gap-2 text-text-muted">
                    <Calculator size={16} />
                    <span className="text-xs font-[700]  tracking-widest">Calc // Pro</span>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-text-muted hover:text-status-error transition-colors p-1 hover:bg-surface-highlight rounded-lg">
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Display */}
            <div className="p-5 bg-surface-main/60 relative backdrop-blur-sm">
                <div className="text-xs text-text-muted text-right h-4 mb-1 font-mono tracking-wider">{equation}</div>
                <div className="text-3xl font-[700] text-text-primary text-right num-font tracking-tight overflow-hidden whitespace-nowrap drop-shadow-sm">
                    {display}
                </div>
                
                {/* History Overlay */}
                {showHistory && (
                    <div className="absolute inset-0 bg-surface-main/95 backdrop-blur-xl z-20 p-4 overflow-y-auto custom-scrollbar flex flex-col">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-subtle shrink-0">
                            <span className="text-xs font-[700]  text-text-muted tracking-widest">Tape Log</span>
                            <button onClick={() => setShowHistory(false)} className="hover:bg-surface-alt p-1 rounded"><X size={16}/></button>
                        </div>
                        <div className="flex-1 space-y-1">
                            {history.map((h, i) => (
                                <div key={i} className="text-right text-xs py-1.5 text-text-secondary border-b border-border-subtle/30 font-mono last:border-0">
                                    {h}
                                </div>
                            ))}
                            {history.length === 0 && <div className="text-center text-xs text-text-muted mt-4 opacity-50  tracking-widest">Memory Empty</div>}
                        </div>
                    </div>
                )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface-alt/40 backdrop-blur-md">
                {buttons.map(btn => (
                    <button
                        key={btn}
                        onClick={() => btn === 'HIST' ? setShowHistory(!showHistory) : handlePress(btn)}
                        className={`
                            h-14 rounded-xl flex items-center justify-center text-sm font-bold transition-all active:scale-90
                            ${btn === '=' 
                                ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20 col-span-1' 
                                : btn === 'C' 
                                ? 'text-status-error bg-status-error/10 hover:bg-status-error/20' 
                                : ['+', '-', 'x', '/'].includes(btn)
                                ? 'bg-surface-alt/50 text-accent-primary border border-border-subtle hover:bg-surface-highlight'
                                : 'bg-surface-main/40 text-text-primary hover:bg-surface-main/80 border border-transparent'
                            }
                        `}
                    >
                        {btn === 'DEL' ? <Delete size={16}/> : btn === 'HIST' ? <History size={16}/> : btn}
                    </button>
                ))}
            </div>
        </div>
    );
};
