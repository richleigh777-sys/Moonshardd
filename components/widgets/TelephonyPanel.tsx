
import React, { useState, useEffect, useRef } from 'react';
import { 
    Mic, MicOff, PhoneOff, Grid, User, Globe, AlertCircle, Radio, Clock
} from 'lucide-react';
import { useCRM } from '../../hooks/useCRM';
import { sfx } from '../../lib/soundService';
import { useSystem } from '../../hooks/useSystem';
import { PanelFrame } from '../ui/PanelFrame';
import { DialPad } from './telephony/DialPad';
import { CallVisualizer } from './telephony/CallVisualizer';

export const TelephonyPanel = () => {
    const { systemConfig } = useCRM();
    const { setToast, callTarget } = useSystem();
    
    // States
    const [status, setStatus] = useState<'DISCONNECTED' | 'IDLE' | 'INCALL' | 'PAUSED' | 'WRAPPING'>('DISCONNECTED');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [showKeypad, setShowKeypad] = useState(false);
    const [dialBuffer, setDialBuffer] = useState('');
    const [duration, setDuration] = useState(0);
    const [callInfo, setCallInfo] = useState<{ number: string, leadId: string, region: string } | null>(null);
    
    const timerRef = useRef<any>(null);

    const handleLink = React.useCallback(async () => {
        setError(null);
        sfx.playClick();
        
        if (!systemConfig.viciServerUrl) {
            sfx.playError();
            setError("CONFIG_MISSING");
            setToast({ title: 'Telephony Error', message: "Dialer Configuration Required", type: 'error' });
            return;
        }

        setIsConnecting(true);

        setTimeout(() => {
            if (Math.random() > 0.9) {
                setIsConnecting(false);
                setError("GATEWAY_TIMEOUT");
                sfx.playError();
            } else {
                setIsConnecting(false);
                setStatus('IDLE');
                sfx.playSuccess();
                setToast({ title: 'Telephony', message: "Voice Uplink Established", type: "success" });
            }
        }, 1200);
    }, [systemConfig.viciServerUrl, setToast]);

    // Listen for external call triggers
    useEffect(() => {
        if (callTarget && status !== 'INCALL') {
            if (status === 'DISCONNECTED') {
                // Wrap in timeout to avoid synchronous state update warning
                setTimeout(() => {
                    handleLink().then(() => {
                        // Wait for connection simulation
                        setTimeout(() => {
                            setStatus('INCALL');
                            setCallInfo({ number: callTarget, leadId: 'MANUAL', region: 'Outbound' });
                            setDuration(0);
                        }, 1500);
                    });
                }, 0);
            } else {
                // Defer to avoid synchronous state update in effect
                setTimeout(() => {
                    setStatus('INCALL');
                    setCallInfo({ number: callTarget, leadId: 'MANUAL', region: 'Outbound' });
                    setDuration(0);
                }, 0);
            }
        }
    }, [callTarget, status, handleLink]);

    // Call Timer
    useEffect(() => {
        if (status === 'INCALL') {
            timerRef.current = setInterval(() => setDuration(p => p + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [status]);

    // Incoming Call Sim
    useEffect(() => {
        if (status === 'IDLE' && !showKeypad) {
            const timeout = setTimeout(() => {
                setStatus('INCALL');
                setCallInfo({
                    number: `(555) ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`,
                    leadId: `LD-${Math.floor(Math.random()*100000)}`,
                    region: 'US-West'
                });
                sfx.playPhoneRing();
                setDuration(0);
            }, Math.floor(Math.random() * 25000) + 15000);
            return () => clearTimeout(timeout);
        }
    }, [status, showKeypad]);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDisconnect = () => {
        sfx.playDecline();
        setStatus('DISCONNECTED');
        setCallInfo(null);
        setDuration(0);
        setShowKeypad(false);
        setError(null);
    };

    const handleHangup = () => {
        sfx.playDecline();
        setStatus('WRAPPING');
        setTimeout(() => setStatus('IDLE'), 3000);
    };

    const togglePause = () => {
        sfx.playClick();
        setStatus(prev => prev === 'IDLE' ? 'PAUSED' : 'IDLE');
    };

    const initiateManualCall = () => {
        sfx.playConfirm();
        setShowKeypad(false);
        setStatus('INCALL');
        setCallInfo({ number: dialBuffer, leadId: 'MANUAL', region: 'Outbound' });
        setDialBuffer('');
        setDuration(0);
    };

    if (!systemConfig.telephonyEnabled) {
        return (
            <PanelFrame title="ViciDial Link" status="OFFLINE">
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <PhoneOff size={32} className="text-text-muted mb-3" />
                    <p className="text-xs font-[700]  text-text-muted tracking-widest">Module Disabled</p>
                </div>
            </PanelFrame>
        );
    }

    return (
        <PanelFrame 
            title="ViciDial Uplink" 
            headerAction={<div className="text-xs font-bold text-status-success">{status === 'INCALL' ? 'ACTIVE CHANNEL' : 'STANDBY'}</div>}
            status={status === 'DISCONNECTED' ? 'OFFLINE' : status === 'INCALL' ? 'ACTIVE' : 'IDLE'}
        >
            <div className="relative h-full p-6 flex flex-col items-center justify-center">
                
                {status === 'DISCONNECTED' ? (
                    // DISCONNECTED STATE
                    <div className="w-full max-w-[200px] text-center space-y-6">
                         <div className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto shadow-xl ${error ? 'bg-red-500/10 border-status-error/30 text-status-error' : 'bg-surface-alt border-border-subtle text-text-muted'}`}>
                            {error ? <AlertCircle size={32} /> : <Radio size={32} />}
                        </div>
                        {error && <div className="text-xs font-mono text-status-error bg-red-500/10 p-2 rounded border border-red-500/20">{error}</div>}
                        <button 
                            onClick={handleLink}
                            disabled={isConnecting}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-[700]  tracking-widest shadow-lg transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isConnecting ? 'Handshaking...' : error ? 'Retry Uplink' : 'Initialize'}
                        </button>
                    </div>

                ) : status === 'INCALL' ? (
                    // ACTIVE CALL STATE
                    <div className="w-full flex flex-col items-center animate-in zoom-in duration-300">
                        <div className="flex items-center gap-2 mb-2 text-xs font-[700]  tracking-widest text-text-muted bg-surface-alt px-3 py-1 rounded-full border border-border-subtle">
                            <Globe size={16} /> {callInfo?.region}
                        </div>
                        <h3 className="text-3xl font-mono font-[700] text-text-primary mb-2 tracking-wider">{callInfo?.number}</h3>
                        <p className="text-xs font-bold text-status-success  tracking-widest mb-6 flex items-center gap-2">
                            <Clock size={16}/> {formatTime(duration)}
                        </p>
                        
                        <div className="w-full mb-8">
                            <CallVisualizer active={true} talking={!isMuted} />
                        </div>

                        <div className="flex gap-6">
                            <button 
                                onClick={() => { setIsMuted(!isMuted); sfx.playClick(); }}
                                className={`p-4 rounded-2xl border transition-all ${isMuted ? 'bg-red-500/20 border-red-500 text-status-error' : 'bg-surface-alt border-border-subtle text-text-primary hover:bg-surface-highlight'}`}
                            >
                                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                            </button>
                            <button 
                                onClick={handleHangup}
                                className="p-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105 transition-all"
                            >
                                <PhoneOff size={24} fill="currentColor" />
                            </button>
                        </div>
                    </div>

                ) : showKeypad ? (
                    // KEYPAD STATE
                    <div className="w-full h-full max-w-[280px]">
                        <DialPad 
                            value={dialBuffer}
                            onChange={(v) => { setDialBuffer(v); sfx.playClick(); }}
                            onCall={initiateManualCall}
                            onCancel={() => { setShowKeypad(false); sfx.playDecline(); }}
                        />
                    </div>
                ) : (
                    // IDLE / PAUSED STATE
                    <div className="w-full space-y-6 px-4">
                         <div className="flex justify-center mb-4">
                             <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${status === 'PAUSED' ? 'border-status-warning/30 bg-amber-500/10 text-status-warning' : 'border-status-success/30 bg-emerald-500/10 text-status-success'}`}>
                                 <User size={32} />
                             </div>
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={togglePause}
                                className={`py-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${status === 'PAUSED' ? 'bg-amber-500 text-black border-amber-400 font-bold' : 'bg-surface-alt border-border-subtle text-text-muted hover:text-text-primary hover:bg-surface-highlight'}`}
                            >
                                {status === 'PAUSED' ? <Radio size={18} className="animate-pulse"/> : <Radio size={18}/>}
                                <span className="text-xs  tracking-wider">{status === 'PAUSED' ? 'Resume' : 'Pause'}</span>
                            </button>
                            <button 
                                onClick={() => { setShowKeypad(true); sfx.playClick(); }}
                                className="py-4 rounded-xl border border-border-subtle bg-surface-alt text-text-muted hover:text-text-primary hover:bg-surface-highlight transition-all flex flex-col items-center justify-center gap-2"
                            >
                                <Grid size={18} />
                                <span className="text-xs  tracking-wider">Keypad</span>
                            </button>
                         </div>
                         <button 
                             onClick={handleDisconnect}
                             className="w-full py-2 text-xs font-[700]  text-status-error/50 hover:text-status-error transition-colors"
                         >
                             Terminate Link
                         </button>
                    </div>
                )}
            </div>
        </PanelFrame>
    );
};
