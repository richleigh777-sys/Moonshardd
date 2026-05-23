
import { useState, useMemo } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../../../components/ui/Base';
import { sfx } from '../../../../lib/soundService';
import { PanelFrame } from '../../../../components/ui/PanelFrame';
import { CommandLog, LogEntry } from '../CommandLog';
import { useCRM } from '../../../../hooks/useCRM';

interface CommandConsoleProps {
    onBroadcast: (msg: string, urgency: 'Routine' | 'Immediate' | 'Flash') => Promise<void>;
}

const PRESETS = [
    { label: "Quota Hit", text: "🎯 Daily target reached. Excellent work, team.", urgency: 'Routine' as const },
    { label: "Briefing", text: "⚔️ LEADERSHIP BRIEFING: All Shift Leads report to conference room.", urgency: 'Immediate' as const },
    { label: "System Maint", text: "⚠️ CRITICAL: System updates. Save tickets and log off.", urgency: 'Flash' as const }
];

export const CommandConsole: React.FC<CommandConsoleProps> = ({ onBroadcast }) => {
    const { directives } = useCRM();
    const [message, setMessage] = useState('');
    const [urgency, setUrgency] = useState<'Routine' | 'Immediate' | 'Flash'>('Routine');
    const [isSending, setIsSending] = useState(false);

    const log: LogEntry[] = useMemo(() => {
        return [...directives]
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(d => ({
                id: d.id,
                time: new Date(d.timestamp).toLocaleTimeString([], { hour12: false }),
                msg: d.message,
                urgency: d.urgency as 'Routine' | 'Immediate' | 'Flash'
            }));
    }, [directives]);

    const loadPreset = (preset: typeof PRESETS[0]) => {
        sfx.playClick();
        setMessage(preset.text);
        setUrgency(preset.urgency);
    };

    const handleSend = async () => {
        if (!message.trim() || isSending) return;
        setIsSending(true);
        sfx.playSubmit();
        
        // Simulating network delay for effect
        await new Promise(r => setTimeout(r, 600));
        await onBroadcast(message, urgency);

        setMessage('');
        setIsSending(false);
    };

    return (
        <PanelFrame 
            title="Announcements" 
        >
            <div className="flex flex-col h-full p-3 gap-2">
                
                {/* Preset Bar */}
                <div className="grid grid-cols-3 gap-1.5 pb-2">
                    {PRESETS.map(preset => (
                        <button 
                            key={preset.label} 
                            onClick={() => loadPreset(preset)} 
                            className={`
                                relative overflow-hidden group
                                px-3 py-2 bg-surface-alt/30 border border-border-subtle rounded-lg 
                                text-xs font-[700]  tracking-wider text-text-secondary 
                                hover:text-white transition-all active:scale-95 text-left
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="relative z-10">{preset.label}</span>
                            <div className={`absolute bottom-0 left-0 h-0.5 w-full ${preset.urgency === 'Flash' ? 'bg-red-500' : preset.urgency === 'Immediate' ? 'bg-amber-500' : 'bg-emerald-500'} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                        </button>
                    ))}
                </div>

                {/* Input Matrix */}
                <div className="flex-1 bg-surface-alt border border-border-subtle rounded-xl p-0.5 flex flex-col relative group focus-within:border-accent-primary/50 transition-colors shadow-inner">
                    <div className="flex-1 relative">
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            placeholder="Type an announcement..." 
                            className="w-full h-full bg-transparent text-sm font-sans font-medium text-text-primary p-4 outline-none resize-none" 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between px-2 pb-2">
                        {/* Urgency Toggles */}
                        <div className="flex gap-1 p-1 bg-surface-highlight rounded-lg border border-border-subtle">
                            {(['Routine', 'Immediate', 'Flash'] as const).map(u => (
                                <button 
                                    key={u} 
                                    onClick={() => { setUrgency(u); sfx.playClick(); }} 
                                    className={`
                                        w-20 py-1 rounded text-sm font-[700]  transition-all flex items-center justify-center gap-1
                                        ${urgency === u 
                                        ? (u === 'Flash' ? 'bg-red-500/20 text-status-error shadow-[0_0_10px_rgba(239,68,68,0.2)] border border-status-error/30' : 
                                           u === 'Immediate' ? 'bg-amber-500/20 text-status-warning shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-status-warning/30' : 
                                           'bg-emerald-500/20 text-status-success shadow-[0_0_10px_rgba(16,185,129,0.2)] border border-status-success/30') 
                                        : 'text-slate-600 hover:text-slate-400 hover:bg-surface-highlight'}
                                    `}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${urgency === u ? 'bg-current animate-pulse' : 'bg-slate-700'}`}></div>
                                    {u}
                                </button>
                            ))}
                        </div>

                        <Button 
                            onClick={handleSend} 
                            disabled={!message.trim() || isSending} 
                            className="h-9 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-[700]  tracking-[0.2em] shadow-lg shadow-emerald-900/20 border border-status-success/50 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isSending ? (
                                <span className="animate-pulse">TX...</span>
                            ) : (
                                <span className="flex items-center gap-2 group-hover:gap-3 transition-all">
                                    SEND <Send size={16} className="fill-current"/>
                                </span>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Log Output */}
                <CommandLog logs={log} className="h-20 shrink-0 border-t border-border-subtle" />
            </div>
        </PanelFrame>
    );
};
