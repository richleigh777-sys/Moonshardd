
import React from 'react';
import { Trash2, Send } from 'lucide-react';

interface AudioRecorderProps {
    recordTime: number;
    onCancel: () => void;
    onSend: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ recordTime, onCancel, onSend }) => {
    const [waveformBars] = React.useState(() => {
        return [...Array(12)].map((_, i) => ({
            height: `${Math.max(20, Math.random() * 100)}%`,
            animationDuration: `${0.4 + Math.random() * 0.4}s`,
            animationDelay: `${i * 0.05}s`
        }));
    });

    return (
        <div className="flex items-center justify-between px-4 py-3 min-h-[64px] animate-in fade-in duration-200 bg-surface-main rounded-[1.5rem] border border-status-error/30 shadow-lg relative overflow-hidden group">
            
            {/* Ambient Pulse Background */}
            <div className="absolute inset-0 bg-status-error/5 animate-pulse"></div>
            <div className="absolute left-0 bottom-0 h-1 bg-status-error w-full animate-[loading_2s_ease-in-out_infinite]"></div>

            <button 
                onClick={onCancel} 
                className="z-10 p-3 rounded-xl hover:bg-surface-alt text-text-muted hover:text-status-error transition-all hover:scale-105 active:scale-95"
                title="Cancel Recording"
            >
                <Trash2 size={20} />
            </button>
            
            <div className="flex items-center gap-4 flex-1 justify-center relative h-10 w-full mx-4 z-10">
                {/* Simulated Waveform */}
                <div className="flex items-center justify-center gap-1 h-full w-full absolute inset-0 opacity-40 pointer-events-none">
                    {waveformBars.map((style, i) => (
                        <div 
                            key={i} 
                            className="w-1 bg-status-error rounded-full animate-bounce" 
                            style={style}
                        ></div>
                    ))}
                </div>
                
                <div className="z-10 bg-surface-main/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-status-error/20 shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-status-error rounded-full animate-pulse"></div>
                    <span className="font-mono font-bold text-status-error text-sm tracking-widest">
                        {Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, '0')}
                    </span>
                </div>
            </div>
            
            <button 
                onClick={onSend} 
                className="z-10 h-10 px-4 bg-status-error hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                title="Send Audio"
            >
                Send <Send size={14} fill="currentColor" />
            </button>
        </div>
    );
};
