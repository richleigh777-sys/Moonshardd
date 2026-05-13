
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CallState, User, ChatChannel, CallParticipant } from '../types';
import { sfx } from '../lib/soundService';
import { useCRM } from '../hooks/useCRM';

export const useCall = (currentUser: User | null, channel?: ChatChannel | null) => {
    const { users } = useCRM(); 
    const [callState, setCallState] = useState<CallState>({
        isActive: false,
        isMinimized: false,
        type: null,
        status: 'ended',
        channelId: null,
        participants: [],
        isMuted: false,
        isCameraOff: false,
        isScreenSharing: false
    });

    const [networkQuality, setNetworkQuality] = useState<'Excellent' | 'Good' | 'Poor'>('Excellent');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const talkingIntervalRef = useRef<any>(null);

    // STOP HELPER: Physically powers down hardware
    const stopAllTracks = useCallback((streamRef: React.MutableRefObject<MediaStream | null>) => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                // console.debug(`[Vox] Disconnecting ${track.kind} hardware...`);
            });
            streamRef.current = null;
        }
    }, []);

    // UPDATE TRACKS: Syncs local stream enabled state with UI state
    useEffect(() => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !callState.isMuted;
            });
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !callState.isCameraOff;
            });
        }
    }, [callState.isMuted, callState.isCameraOff]);

    // Network & Latency simulation
    useEffect(() => {
        if (callState.isActive) {
            const interval = setInterval(() => {
                const rand = Math.random();
                setNetworkQuality(rand > 0.95 ? 'Poor' : rand > 0.8 ? 'Good' : 'Excellent');
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [callState.isActive]);

    // Remote Participant Behavior Simulation
    useEffect(() => {
        if (callState.isActive && callState.status === 'connected') {
            talkingIntervalRef.current = setInterval(() => {
                setCallState(prev => ({
                    ...prev,
                    participants: prev.participants.map(p => ({
                        ...p,
                        isTalking: !p.isMuted && Math.random() > 0.7 
                    }))
                }));
            }, 800);
        } else {
            if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
        }
        return () => {
            if (talkingIntervalRef.current) clearInterval(talkingIntervalRef.current);
        };
    }, [callState.isActive, callState.status]);

    // Main Hardware Lifecycle
    useEffect(() => {
        let isActiveEffect = true;

        const initializeMedia = async () => {
            if (callState.isActive && (callState.status === 'connected' || callState.status === 'dialing')) {
                try {
                    // Only request if we don't have an active stream
                    if (!localStreamRef.current) {
                        // Check if browser supports media devices
                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            throw new Error("Media devices not supported");
                        }

                        const stream = await navigator.mediaDevices.getUserMedia({ 
                            video: callState.type === 'video', 
                            audio: true 
                        });
                        
                        if (!isActiveEffect) {
                            stream.getTracks().forEach(t => t.stop());
                            return;
                        }

                        localStreamRef.current = stream;
                        if (localVideoRef.current) {
                            localVideoRef.current.srcObject = stream;
                        }
                    }
                } catch (e) {
                    console.error("[Vox] Peripheral access denied or unavailable:", e);
                    // Gracefully fallback or end call if hardware fails
                    if (isActiveEffect) {
                        setCallState(prev => ({ 
                            ...prev, 
                            isActive: false,
                            status: 'ended' 
                        }));
                        sfx.playError();
                        // Optional: trigger a toast here via context if needed
                    }
                }
            } else if (callState.status === 'ended') {
                stopAllTracks(localStreamRef);
                stopAllTracks(screenStreamRef);
            }
        };

        initializeMedia();

        return () => {
            isActiveEffect = false;
        };
    }, [callState.isActive, callState.status, callState.type, stopAllTracks]);

    const startCall = useCallback((type: 'audio' | 'video', targetId: string, targetName: string, isGroup: boolean) => {
        if (!currentUser) return;
        
        sfx.playPhoneRing();
        
        let participants: CallParticipant[] = [];
        
        if (isGroup && channel) {
            const memberIds = channel.memberIds || [];
            participants = users
                .filter(u => memberIds.includes(u.id) && u.id !== currentUser.id)
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    avatar: u.avatar || `https://api.dicebear.com/9.x/adventurer/svg?seed=${u.id}&backgroundColor=b6e3f4`,
                    isMuted: Math.random() > 0.85,
                    isTalking: false,
                    isVideoOff: type === 'audio' || Math.random() > 0.6
                }));
        } else {
            participants = [{
                id: targetId,
                name: targetName,
                isMuted: false,
                isTalking: false,
                isVideoOff: type === 'audio',
                avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${targetName}&backgroundColor=b6e3f4`
            }];
        }

        setCallState({
            isActive: true,
            isMinimized: false,
            type,
            status: 'dialing',
            channelId: targetId,
            channelName: targetName,
            participants,
            startTime: undefined,
            isMuted: false,
            isCameraOff: type === 'audio',
            isScreenSharing: false
        });

        // Connection Handshake Simulation
        setTimeout(() => {
            setCallState(prev => {
                if (prev.status === 'dialing') {
                    sfx.playConfirm();
                    return { ...prev, status: 'connected', startTime: Date.now() };
                }
                return prev;
            });
        }, 3200);
    }, [currentUser, channel, users]);

    const endCall = useCallback(() => {
        sfx.playDecline();
        stopAllTracks(localStreamRef); // Immediate hardware release
        stopAllTracks(screenStreamRef);
        
        setCallState(prev => ({ ...prev, status: 'ended' }));
        
        // Wait for animation before full state reset
        setTimeout(() => {
            setCallState({
                isActive: false,
                isMinimized: false,
                type: null,
                status: 'ended',
                channelId: null,
                participants: [],
                isMuted: false,
                isCameraOff: false,
                isScreenSharing: false
            });
        }, 400);
    }, [stopAllTracks]);

    const toggleMute = useCallback(() => {
        setCallState(prev => {
            if (prev.isMuted) sfx.playSuccess(); else sfx.playDecline();
            return { ...prev, isMuted: !prev.isMuted };
        });
    }, []);

    const toggleVideo = useCallback(() => {
        setCallState(prev => {
            sfx.playClick();
            return { ...prev, isCameraOff: !prev.isCameraOff };
        });
    }, []);

    const toggleScreenShare = useCallback(async () => {
        if (callState.isScreenSharing) {
            stopAllTracks(screenStreamRef);
            if (localVideoRef.current && localStreamRef.current) {
                localVideoRef.current.srcObject = localStreamRef.current;
            }
            setCallState(prev => ({ ...prev, isScreenSharing: false }));
            sfx.playDecline();
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                
                stream.getVideoTracks()[0].onended = () => {
                    stopAllTracks(screenStreamRef);
                    if (localVideoRef.current && localStreamRef.current) {
                        localVideoRef.current.srcObject = localStreamRef.current;
                    }
                    setCallState(prev => ({ ...prev, isScreenSharing: false }));
                };

                setCallState(prev => ({ ...prev, isScreenSharing: true }));
                sfx.playSubmit();
            } catch {
                console.warn("[Vox] Screen share canceled");
            }
        }
    }, [callState.isScreenSharing, stopAllTracks]);

    const minimizeCall = useCallback(() => {
        sfx.playHover();
        setCallState(prev => ({ ...prev, isMinimized: !prev.isMinimized }));
    }, []);

    return {
        callState,
        startCall,
        endCall,
        toggleMute,
        toggleVideo,
        toggleScreenShare,
        minimizeCall,
        localVideoRef,
        networkQuality
    };
};
