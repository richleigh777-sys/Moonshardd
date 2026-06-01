
import React, { useEffect, useState, useRef } from 'react';
import { useCRM } from '../../hooks/useCRM';
import { useSystem } from '../../hooks/useSystem';
import { sfx } from '../../lib/soundService';
import { Phone, Clock, X, Bell, BellOff, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Base';

interface AlertState {
    id: string;
    customer: string;
    phone: string;
    reason: string;
    time: number;
    silenced: boolean;
}

export const CallbackManager: React.FC = () => {
    const { notes, updateNote, currentUser } = useCRM();
    const { setToast } = useSystem();
    
    // Local state for the visual HUD
    const [activeAlerts, setActiveAlerts] = useState<AlertState[]>([]);
    
    // Track processed IDs to prevent re-alerting for the same exact timestamp
    const processedRef = useRef<Set<string>>(new Set());
    const audioLoopRef = useRef<any>(null);

    // Audio Loop Management
    const loopCount = useRef(0);
    
    const stopAlarm = React.useCallback(() => {
        if (audioLoopRef.current) {
            clearInterval(audioLoopRef.current);
            audioLoopRef.current = null;
        }
    }, []);

    const startAlarm = React.useCallback(() => {
        // Play immediately
        sfx.playPhoneRing();
        loopCount.current = 1;
        // Loop every 4 seconds until silenced or empty, max 5 times.
        if (!audioLoopRef.current) {
            audioLoopRef.current = setInterval(() => {
                if (loopCount.current >= 5) {
                    stopAlarm();
                    return;
                }
                sfx.playPhoneRing();
                loopCount.current++;
            }, 4000);
        }
    }, [stopAlarm]);

    useEffect(() => {
        return () => stopAlarm();
    }, [stopAlarm]);

    useEffect(() => {
        if (!currentUser) return;

        const checkCallbacks = () => {
            const now = Date.now();
            // Look for high priority callbacks due within the last hour that haven't been done
            const due = notes.filter(n => 
                n.type === 'callback' && 
                n.agentId === currentUser.id && 
                n.priority !== 'Low' && 
                n.timestamp <= now && 
                n.timestamp > now - 3600000 // 1 hour window
            );

            let hasNew = false;

            due.forEach(cb => {
                // Unique key includes timestamp to allow re-alerting if snoozed and re-due
                const uniqueKey = `${cb.id}-${cb.timestamp}`;
                
                if (!processedRef.current.has(uniqueKey)) {
                    processedRef.current.add(uniqueKey);
                    
                    // Add to visual stack
                    setActiveAlerts(prev => {
                        if (prev.some(a => a.id === cb.id)) return prev; // Already showing
                        return [...prev, {
                            id: cb.id,
                            customer: cb.customerName || 'Unknown Client',
                            phone: cb.phone,
                            reason: cb.reason || 'General Follow-up',
                            time: cb.timestamp,
                            silenced: false
                        }];
                    });
                    
                    hasNew = true;
                }
            });

            if (hasNew) {
                // Trigger Audio Alarm if not already playing
                startAlarm();
                
                // Browser Notification Fallback
                if (Notification.permission === "granted") {
                    new Notification(`🚨 Action Required`, {
                        body: `Callback due for ${due[0].customerName}`,
                        icon: '/favicon.ico'
                    });
                }
            }
        };

        const interval = setInterval(checkCallbacks, 5000);
        return () => clearInterval(interval);
    }, [notes, currentUser, startAlarm]);
    
    // Stop alarm if no unsilenced alerts exist
    useEffect(() => {
        const unsilencedCount = activeAlerts.filter(a => !a.silenced).length;
        if (unsilencedCount === 0) {
            stopAlarm();
        }
    }, [activeAlerts, stopAlarm]);

    // -- ACTIONS --

    const handleSnooze = async (id: string, minutes: number) => {
        stopAlarm(); // Immediate peace
        sfx.playClick();
        
        // Optimistic UI removal
        setActiveAlerts(prev => prev.filter(a => a.id !== id));

        const newTime = Date.now() + (minutes * 60 * 1000);
        await updateNote(id, {
            timestamp: newTime,
            date: new Date(newTime).toLocaleDateString(),
            time: new Date(newTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
            priority: 'Mid', // Downgrade slightly or keep High? Keeping high context for now
            content: `Snoozed for ${minutes}m`
        });
        
        setToast({ title: 'Callback', message: `Callback deferred +${minutes}m`, type: 'info' });
    };

    const handleDismiss = (id: string) => {
        sfx.playDecline();
        setActiveAlerts(prev => prev.filter(a => a.id !== id));
    };

    const handleSilence = (id: string) => {
        sfx.playClick();
        setActiveAlerts(prev => prev.map(a => a.id === id ? { ...a, silenced: true } : a));
    };

    const handleEngage = (alert: AlertState) => {
        sfx.playConfirm();
        stopAlarm();
        navigator.clipboard.writeText(alert.phone);
        setToast({ title: 'Clipboard', message: "Number Copied to Clipboard", type: 'success' });
        // In a real app, this might navigate to the LeadHub or open a dialer
        setActiveAlerts(prev => prev.filter(a => a.id !== alert.id));
    };

    if (activeAlerts.length === 0) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
            {activeAlerts.map(alert => (
                <div 
                    key={alert.id}
                    className="
                        pointer-events-auto w-[360px] 
                        bg-surface-main 
                        border border-border-subtle
                        rounded-xl shadow-xl
                        overflow-hidden relative group 
                        animate-in slide-in-from-right-20 duration-300 ease-out
                    "
                >
                    {/* CONTENT */}
                    <div className="p-4 relative z-10">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2 text-status-error bg-red-500/10 px-3 py-1.5 rounded border border-red-500/20">
                                <AlertCircle size={16} />
                                <span className="text-xs font-bold  tracking-wide">Callback Due</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                                {!alert.silenced && (
                                    <button 
                                        onClick={() => handleSilence(alert.id)} 
                                        className="p-1.5 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary transition-colors" 
                                        title="Silence Audio"
                                    >
                                        <Bell size={16} className="animate-bounce text-status-error" />
                                    </button>
                                )}
                                <button 
                                    onClick={() => handleDismiss(alert.id)} 
                                    className="p-1.5 hover:bg-surface-alt rounded-md text-text-muted hover:text-text-primary transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-text-primary mb-1">{alert.customer}</h3>
                            <div className="flex items-center gap-3 text-sm">
                                <p className="font-mono font-medium text-text-secondary">{alert.phone}</p>
                                <div className="h-3 w-px bg-border-subtle"></div>
                                <span className="text-xs font-medium text-text-muted flex items-center gap-1">
                                    <Clock size={16}/> {alert.reason}
                                </span>
                            </div>
                        </div>

                        {/* Action Grid */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex bg-surface-alt p-1 rounded-lg border border-border-subtle">
                                <button 
                                    onClick={() => handleSnooze(alert.id, 10)}
                                    className="flex-1 rounded text-xs font-bold  text-text-muted hover:text-text-primary hover:bg-surface-main transition-all flex items-center justify-center gap-1"
                                >
                                    <BellOff size={16} /> +10m
                                </button>
                                <div className="w-px bg-border-subtle my-1 mx-1"></div>
                                <button 
                                    onClick={() => handleSnooze(alert.id, 60)}
                                    className="flex-1 rounded text-xs font-bold  text-text-muted hover:text-text-primary hover:bg-surface-main transition-all flex items-center justify-center gap-1"
                                >
                                    +1h
                                </button>
                            </div>
                            
                            <Button 
                                onClick={() => handleEngage(alert)}
                                variant="primary"
                                className="h-9 text-xs font-bold  tracking-wide flex items-center justify-center gap-2"
                            >
                                <Phone size={16} /> 
                                Call Now
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
