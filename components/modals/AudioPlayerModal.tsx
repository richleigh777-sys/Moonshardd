import React, { useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, X, Headphones } from 'lucide-react';
import { sfx } from '../../lib/soundService';

interface AudioPlayerModalProps {
    src: string;
    saleName?: string;
    onClose: () => void;
}

export const AudioPlayerModal: React.FC<AudioPlayerModalProps> = ({ src, saleName, onClose }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
        sfx.playClick();
    };

    const skipForward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime += 10;
        sfx.playClick();
    };

    const skipBackward = () => {
        if (!audioRef.current) return;
        audioRef.current.currentTime -= 10;
        sfx.playClick();
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const seekTime = (Number(e.target.value) / 100) * duration;
        audioRef.current.currentTime = seekTime;
        setProgress(Number(e.target.value));
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 " onClick={onClose} />
            
            <div className="relative w-full max-w-md bg-surface-main border border-border-subtle rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-surface-alt/50 border-b border-border-subtle px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-accent-primary/10 text-accent-primary rounded-lg">
                            <Headphones size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-text-primary tracking-wide">Audio Log</h3>
                            <p className="text-[10px] text-text-muted uppercase tracking-wide">{saleName || 'Unknown Contact'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-highlight rounded-lg transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Player Body */}
                <div className="p-4">
                    {/* Fake Waveform for aesthetics */}
                    <div className="flex items-center justify-center gap-1 h-12 mb-6 opacity-30">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div 
                                key={i}
                                className={`w-1 rounded-full bg-accent-primary transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                                style={{ 
                                    height: `${Math.max(10, Math.random() * 100)}%`,
                                    animationDelay: `${i * 0.05}s`
                                }}
                            />
                        ))}
                    </div>

                    <audio 
                        ref={audioRef} 
                        src={src} 
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden" 
                    />

                    {/* Timeline */}
                    <div className="mb-6">
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progress}
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-surface-alt rounded-full appearance-none cursor-pointer accent-accent-primary focus:outline-none" 
                        />
                        <div className="flex justify-between items-center mt-2.5">
                            <span className="text-xs font-mono text-text-muted">{formatTime(currentTime)}</span>
                            <span className="text-xs font-mono text-text-muted">{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <button 
                            onClick={skipBackward}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-alt rounded-full transition-all"
                            title="Rewind 10s"
                        >
                            <SkipBack size={20} />
                        </button>

                        <button 
                            onClick={togglePlay}
                            className="w-14 h-14 flex items-center justify-center bg-accent-primary text-surface-alt rounded-full shadow-lg shadow-accent-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <button 
                            onClick={skipForward}
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-alt rounded-full transition-all"
                            title="Skip 10s"
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
