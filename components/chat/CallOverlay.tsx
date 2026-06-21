
import { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Monitor, Maximize2, Minimize2, Radio, ShieldCheck, Lock, Signal } from 'lucide-react';
import { Card } from '../ui/Base';
import { CallState } from '../../types';

interface CallOverlayProps {
    callState: CallState;
    onEnd: () => void;
    onMute: () => void;
    onVideo: () => void;
    onScreenShare: () => void;
    onMinimize: () => void;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
}

const AudioVisualizer = ({ active }: { active: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!active) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const draw = () => {
            rafIdRef.current = requestAnimationFrame(draw);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const bars = 6;
            const barWidth = (canvas.width / bars) - 2;
            for(let i = 0; i < bars; i++) {
                const height = Math.random() * canvas.height;
                ctx.fillStyle = '#6366f1'; // Branded indigo
                ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
            }
        };
        draw();
        return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); };
    }, [active]);

    if (!active) return <div className="flex gap-1 opacity-20">{[...Array(5)].map((_,i)=><div key={i} className="w-1 h-1 bg-white rounded-full"/>)}</div>;
    return <canvas ref={canvasRef} width={60} height={32} className="h-6 w-12" />;
};

export const CallOverlay: React.FC<CallOverlayProps> = ({ 
    callState, onEnd, onMute, onVideo, onScreenShare, onMinimize, localVideoRef 
}) => {
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        let interval: any;
        if (callState.status === 'connected' && callState.startTime) {
            interval = setInterval(() => {
                setDuration(Math.floor((Date.now() - callState.startTime!) / 1000));
            }, 1000);
        } else {
            const t = setTimeout(() => setDuration(0), 0);
            return () => clearTimeout(t);
        }
        return () => clearInterval(interval);
    }, [callState.status, callState.startTime]);

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    if (!callState.isActive) return null;

    // --- MINIMIZED HUD ---
    if (callState.isMinimized) {
        return (
            <div className="fixed bottom-6 right-6 z-[600] w-72 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <Card className="p-0 bg-surface-main/90 backdrop-blur-3xl border border-indigo-500/30 shadow-sm flex flex-col ring-1 ring-white/10 overflow-hidden rounded-xl">
                    <div className="h-44 bg-black relative group">
                        {callState.type === 'video' && !callState.isCameraOff ? (
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                                <div className="w-16 h-16 rounded-full bg-surface-main/80 border-2 border-indigo-500/30 flex items-center justify-center relative">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse shadow-sm"></div>
                                    <VideoOff size={24} className="absolute text-accent-secondary opacity-40"/>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-3 left-3 bg-surface-alt  px-2.5 py-1 rounded-lg text-sm font-mono text-status-success border border-border-subtle flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            {formatTime(duration)}
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-surface-alt/20">
                        <div className="min-w-0">
                            <p className="text-sm font-medium  text-accent-secondary tracking-wide truncate">{callState.channelName}</p>
                            <p className="text-sm text-text-muted font-bold flex items-center gap-1 mt-0.5"><Lock size={16}/> END-TO-END SECURE</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onMinimize} className="p-2.5 bg-surface-highlight hover:bg-surface-alt/80 rounded-xl text-text-primary transition-all"><Maximize2 size={16}/></button>
                            <button onClick={onEnd} className="p-2.5 bg-red-500 hover:bg-red-600 text-text-primary rounded-xl shadow-lg shadow-red-500/20"><PhoneOff size={16}/></button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // --- FULL SCREEN UPLINK ---
    return (
        <div className="fixed inset-0 z-[600] bg-[#030405] flex flex-col animate-in fade-in duration-500 overflow-hidden font-sans">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
            
            {/* Top Command Bar */}
            <div className="h-20 px-8 flex justify-between items-center bg-surface-alt/40  border-b border-border-subtle relative z-20">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-surface-highlight rounded-xl border border-border-subtle shadow-inner">
                        {callState.status === 'dialing' ? (
                            <Radio className="text-status-warning animate-pulse" size={24} />
                        ) : (
                            <ShieldCheck className="text-status-success" size={24} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-text-primary  tracking-wider flex items-center gap-3">
                            {callState.channelName} 
                            <span className="px-2.5 py-1 rounded-lg bg-accent-secondary/10 border border-indigo-500/30 text-sm text-accent-secondary font-medium tracking-wide italic">CHANNEL-ENCRYPTED</span>
                        </h2>
                        <div className="flex items-center gap-4 text-sm font-bold text-text-muted  tracking-wide mt-0.5">
                            <span className="flex items-center gap-1.5"><Signal size={16} className="text-status-success"/> Signal: Strong</span>
                            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                            <span className="font-mono text-status-success">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onMinimize} 
                    className="p-3 bg-surface-highlight hover:bg-surface-alt/80 text-text-primary rounded-xl transition-all border border-border-subtle active:scale-95 group"
                >
                    <Minimize2 size={20} className="group-hover:scale-90 transition-transform" />
                </button>
            </div>

            {/* Main Call Stage */}
            <div className="flex-1 p-5 overflow-hidden relative z-10">
                {callState.status === 'dialing' ? (
                    // DIALING VIEW: Radar Scanner
                    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                        <div className="relative w-64 h-64 mb-12">
                            <div className="absolute inset-0 border-2 border-accent-secondary/20 rounded-full animate-[ping_3s_infinite]"></div>
                            <div className="absolute inset-4 border border-indigo-500/10 rounded-full animate-[spin_8s_linear_infinite]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full border-4 border-indigo-500/40 p-2 overflow-hidden shadow-sm">
                                    <img src={callState.participants[0]?.avatar} className="w-full h-full rounded-full object-cover grayscale opacity-50" alt=""/>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[120%] bg-indigo-500/30 animate-[spin_4s_linear_infinite] origin-center"></div>
                        </div>
                        <h3 className="text-xl font-medium text-text-primary  tracking-tighter italic animate-pulse">Establishing Link...</h3>
                        <p className="text-sm font-bold text-text-muted  tracking-[0.4em] mt-4">Awaiting Signal ACK from {callState.channelName}</p>
                    </div>
                ) : (
                    // CONNECTED VIEW: Grid
                    <div className={`grid gap-4 h-full transition-all duration-700 ${callState.participants.length > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                        
                        {/* LOCAL AGENT (YOU) */}
                        <div className="relative bg-slate-900/40 rounded-xl overflow-hidden border border-border-subtle shadow-2xl flex flex-col group transition-all hover:border-indigo-500/30">
                            {callState.type === 'video' && !callState.isCameraOff ? (
                                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-xl font-medium text-text-primary shadow-neon ring-4 ring-black/50 z-10 transform group-hover:scale-105 transition-transform">YOU</div>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-text-primary  tracking-wide bg-indigo-600 px-3 py-1 rounded-lg shadow-lg">Local Agent</span>
                                    {callState.isMuted && <div className="bg-red-500/20 p-1.5 rounded-lg text-status-error border border-status-error/30"><MicOff size={16}/></div>}
                                </div>
                                <AudioVisualizer active={!callState.isMuted} />
                            </div>
                        </div>

                        {/* REMOTE PARTICIPANTS */}
                        {callState.participants.map(p => (
                            <div 
                                key={p.id} 
                                className={`relative bg-slate-900/40 rounded-xl overflow-hidden border shadow-2xl flex flex-col transition-all duration-500 ${p.isTalking ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-border-subtle'}`}
                            >
                                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)]"></div>
                                    <div className={`relative w-28 h-28 rounded-full p-1 ring-4 ${p.isTalking ? 'ring-indigo-500 animate-pulse' : 'ring-emerald-500/20'} ring-offset-4 ring-offset-slate-900 transition-all duration-300`}>
                                        <img src={p.avatar} className={`w-full h-full rounded-full object-cover bg-surface-main/80 ${p.isVideoOff ? 'grayscale opacity-30' : ''}`} alt="" />
                                        {p.isVideoOff && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <VideoOff size={32} className="text-text-primary opacity-20"/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-text-primary tracking-wide  italic">{p.name}</span>
                                        <p className="text-sm font-medium text-text-muted  tracking-wide mt-1">Remote Node</p>
                                    </div>
                                    {p.isMuted && <MicOff size={16} className="text-status-error opacity-60" />}
                                    {p.isTalking && <AudioVisualizer active={true} />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tactical Control Dock */}
            <div className="p-10 pb-12 flex justify-center items-center shrink-0 relative z-30">
                <div className="flex items-center gap-4 bg-surface-main/60 backdrop-blur-3xl border border-border-subtle px-8 py-5 rounded-xl shadow-sm ring-1 ring-white/5">
                    
                    <button 
                        onClick={onMute} 
                        className={`p-5 rounded-xl transition-all duration-300 active:scale-90 ${callState.isMuted ? 'bg-red-500 text-text-primary shadow-sm' : 'bg-surface-highlight text-text-muted hover:text-text-primary hover:bg-surface-alt/80 border border-border-subtle'}`}
                        title={callState.isMuted ? "Unmute" : "Mute"}
                    >
                        {callState.isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>

                    <button 
                        onClick={onVideo} 
                        className={`p-5 rounded-xl transition-all duration-300 active:scale-90 ${callState.isCameraOff ? 'bg-slate-700 text-text-primary' : 'bg-surface-highlight text-text-muted hover:text-text-primary hover:bg-surface-alt/80 border border-border-subtle'}`}
                        title={callState.isCameraOff ? "Start Video" : "Stop Video"}
                    >
                        {callState.isCameraOff ? <VideoOff size={28} /> : <VideoIcon size={28} />}
                    </button>

                    <button 
                        onClick={onScreenShare} 
                        className={`p-5 rounded-xl transition-all duration-300 active:scale-90 ${callState.isScreenSharing ? 'bg-indigo-600 text-text-primary shadow-neon' : 'bg-surface-highlight text-text-muted hover:text-text-primary hover:bg-surface-alt/80 border border-border-subtle'}`}
                        title="Screen Share"
                    >
                        <Monitor size={28} />
                    </button>

                    <div className="w-px h-10 bg-surface-highlight mx-2"></div>

                    <button 
                        onClick={onEnd} 
                        className="p-5 rounded-xl bg-red-600 hover:bg-red-500 text-text-primary shadow-sm hover:scale-105 active:scale-95 transition-all border border-red-400/30 flex items-center justify-center gap-3 px-8"
                    >
                        <PhoneOff size={28} fill="currentColor" />
                        <span className="text-sm font-medium  tracking-wide hidden md:block">Terminate Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
