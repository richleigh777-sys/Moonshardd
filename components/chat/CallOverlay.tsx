
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
                <Card className="p-0 bg-slate-950/90 backdrop-blur-3xl border border-indigo-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col ring-1 ring-white/10 overflow-hidden rounded-[2rem]">
                    <div className="h-44 bg-black relative group">
                        {callState.type === 'video' && !callState.isCameraOff ? (
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center relative">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.2)]"></div>
                                    <VideoOff size={24} className="absolute text-indigo-400 opacity-40"/>
                                </div>
                            </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-400 border border-white/10 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            {formatTime(duration)}
                        </div>
                    </div>
                    <div className="p-4 flex items-center justify-between bg-white/[0.02]">
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest truncate">{callState.channelName}</p>
                            <p className="text-[8px] text-text-muted font-bold flex items-center gap-1 mt-0.5"><Lock size={8}/> END-TO-END SECURE</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={onMinimize} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-all"><Maximize2 size={16}/></button>
                            <button onClick={onEnd} className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20"><PhoneOff size={16}/></button>
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
            <div className="h-20 px-8 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/5 relative z-20">
                <div className="flex items-center gap-5">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                        {callState.status === 'dialing' ? (
                            <Radio className="text-amber-500 animate-pulse" size={24} />
                        ) : (
                            <ShieldCheck className="text-emerald-500" size={24} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-3">
                            {callState.channelName} 
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-[9px] text-indigo-400 font-black tracking-widest italic">CHANNEL-ENCRYPTED</span>
                        </h2>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            <span className="flex items-center gap-1.5"><Signal size={12} className="text-emerald-500"/> Signal: Strong</span>
                            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                            <span className="font-mono text-emerald-400">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onMinimize} 
                    className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all border border-white/5 active:scale-95 group"
                >
                    <Minimize2 size={20} className="group-hover:scale-90 transition-transform" />
                </button>
            </div>

            {/* Main Call Stage */}
            <div className="flex-1 p-8 overflow-hidden relative z-10">
                {callState.status === 'dialing' ? (
                    // DIALING VIEW: Radar Scanner
                    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-700">
                        <div className="relative w-64 h-64 mb-12">
                            <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full animate-[ping_3s_infinite]"></div>
                            <div className="absolute inset-4 border border-indigo-500/10 rounded-full animate-[spin_8s_linear_infinite]"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full border-4 border-indigo-500/40 p-2 overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                    <img src={callState.participants[0]?.avatar} className="w-full h-full rounded-full object-cover grayscale opacity-50" alt=""/>
                                </div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[120%] bg-indigo-500/30 animate-[spin_4s_linear_infinite] origin-center"></div>
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic animate-pulse">Establishing Link...</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] mt-4">Awaiting Signal ACK from {callState.channelName}</p>
                    </div>
                ) : (
                    // CONNECTED VIEW: Grid
                    <div className={`grid gap-6 h-full transition-all duration-700 ${callState.participants.length > 1 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                        
                        {/* LOCAL AGENT (YOU) */}
                        <div className="relative bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col group transition-all hover:border-indigo-500/30">
                            {callState.type === 'video' && !callState.isCameraOff ? (
                                <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>
                                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 flex items-center justify-center text-3xl font-black text-white shadow-neon ring-4 ring-black/50 z-10 transform group-hover:scale-105 transition-transform">YOU</div>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600 px-3 py-1 rounded-lg shadow-lg">Local Agent</span>
                                    {callState.isMuted && <div className="bg-red-500/20 p-1.5 rounded-lg text-red-400 border border-red-500/30"><MicOff size={14}/></div>}
                                </div>
                                <AudioVisualizer active={!callState.isMuted} />
                            </div>
                        </div>

                        {/* REMOTE PARTICIPANTS */}
                        {callState.participants.map(p => (
                            <div 
                                key={p.id} 
                                className={`relative bg-slate-900/40 rounded-[2.5rem] overflow-hidden border shadow-2xl flex flex-col transition-all duration-500 ${p.isTalking ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-white/5'}`}
                            >
                                <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)]"></div>
                                    <div className={`relative w-28 h-28 rounded-full p-1 ring-4 ${p.isTalking ? 'ring-indigo-500 animate-pulse' : 'ring-emerald-500/20'} ring-offset-4 ring-offset-slate-900 transition-all duration-300`}>
                                        <img src={p.avatar} className={`w-full h-full rounded-full object-cover bg-slate-800 ${p.isVideoOff ? 'grayscale opacity-30' : ''}`} alt="" />
                                        {p.isVideoOff && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <VideoOff size={32} className="text-white opacity-20"/>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-white tracking-wide uppercase italic">{p.name}</span>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Remote Node</p>
                                    </div>
                                    {p.isMuted && <MicOff size={16} className="text-red-500 opacity-60" />}
                                    {p.isTalking && <AudioVisualizer active={true} />}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tactical Control Dock */}
            <div className="p-10 pb-12 flex justify-center items-center shrink-0 relative z-30">
                <div className="flex items-center gap-6 bg-slate-900/60 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
                    
                    <button 
                        onClick={onMute} 
                        className={`p-5 rounded-2xl transition-all duration-300 active:scale-90 ${callState.isMuted ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
                        title={callState.isMuted ? "Unmute" : "Mute"}
                    >
                        {callState.isMuted ? <MicOff size={28} /> : <Mic size={28} />}
                    </button>

                    <button 
                        onClick={onVideo} 
                        className={`p-5 rounded-2xl transition-all duration-300 active:scale-90 ${callState.isCameraOff ? 'bg-slate-700 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
                        title={callState.isCameraOff ? "Start Video" : "Stop Video"}
                    >
                        {callState.isCameraOff ? <VideoOff size={28} /> : <VideoIcon size={28} />}
                    </button>

                    <button 
                        onClick={onScreenShare} 
                        className={`p-5 rounded-2xl transition-all duration-300 active:scale-90 ${callState.isScreenSharing ? 'bg-indigo-600 text-white shadow-neon' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'}`}
                        title="Screen Share"
                    >
                        <Monitor size={28} />
                    </button>

                    <div className="w-px h-10 bg-white/10 mx-2"></div>

                    <button 
                        onClick={onEnd} 
                        className="p-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:scale-105 active:scale-95 transition-all border border-red-400/30 flex items-center justify-center gap-3 px-8"
                    >
                        <PhoneOff size={28} fill="currentColor" />
                        <span className="text-xs font-black uppercase tracking-widest hidden md:block">Terminate Link</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
