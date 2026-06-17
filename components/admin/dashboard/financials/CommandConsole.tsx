
import { useState, useMemo } from 'react';
import { Send, Speaker } from 'lucide-react';
import { Button } from '../../../../components/ui/Base';
import { sfx } from '../../../../lib/soundService';
import { PanelFrame } from '../../../../components/ui/PanelFrame';
import { CommandLog, LogEntry } from '../CommandLog';
import { useCRM } from '../../../../hooks/useCRM';

interface CommandConsoleProps {
    onBroadcast: (msg: string, urgency: 'Routine' | 'Immediate' | 'Flash') => Promise<void>;
}

const PRESETS = [
    { label: "Quota Hit", text: "Daily target reached. Excellent work, team.", urgency: 'Routine' as const },
    { label: "Briefing", text: "LEADERSHIP BRIEFING: All Shift Leads report to conference room.", urgency: 'Immediate' as const },
    { label: "System Update", text: "System updates starting soon. Please save your work.", urgency: 'Flash' as const }
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
        
        await new Promise(r => setTimeout(r, 300));
        await onBroadcast(message, urgency);

        setMessage('');
        setIsSending(false);
    };

    return (
        <PanelFrame 
            title="Internal Announcements" 
        >
            <div className="flex flex-col h-full p-4 gap-4 bg-surface-main">
                
                {/* Preset Bar */}
                <div className="flex gap-2 pb-2">
                    {PRESETS.map(preset => (
                        <button 
                            key={preset.label} 
                            onClick={() => loadPreset(preset)} 
                            className="px-3 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-highlight transition-colors flex-1 text-left"
                        >
                            <span>{preset.label}</span>
                        </button>
                    ))}
                </div>

                {/* Input Matrix */}
                <div className="flex-1 bg-surface-alt border border-border-subtle rounded-xl flex flex-col focus-within:border-accent-primary/50 transition-colors shadow-sm overflow-hidden">
                    <textarea 
                        value={message} 
                        onChange={(e) => setMessage(e.target.value)} 
                        placeholder="Type an announcement to broadcast..." 
                        className="w-full flex-1 bg-transparent text-sm font-sans text-text-primary p-4 outline-none resize-none" 
                    />
                    
                    <div className="flex items-center justify-between p-3 bg-surface-main border-t border-border-subtle">
                        {/* Urgency Toggles */}
                        <div className="flex gap-2">
                            {(['Routine', 'Immediate', 'Flash'] as const).map(u => (
                                <button 
                                    key={u} 
                                    onClick={() => { setUrgency(u); sfx.playClick(); }} 
                                    className={`
                                        px-3 py-1.5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-1.5
                                        ${urgency === u 
                                        ? (u === 'Flash' ? 'bg-rose-500 text-white' : 
                                           u === 'Immediate' ? 'bg-amber-500 text-white' : 
                                           'bg-emerald-500 text-white') 
                                        : 'bg-surface-alt text-text-secondary hover:text-text-primary hover:bg-surface-highlight border border-border-subtle'}
                                    `}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>

                        <Button 
                            onClick={handleSend} 
                            disabled={!message.trim() || isSending} 
                            className="bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md text-sm font-semibold px-4 py-2"
                        >
                            {isSending ? 'Sending...' : 'Broadcast'}
                        </Button>
                    </div>
                </div>

                {/* Log Output */}
                <CommandLog logs={log} className="h-24 shrink-0 border border-border-subtle rounded-xl" />
            </div>
        </PanelFrame>
    );
};
