import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getStorageItem } from '../lib/storage';


export const useWorkTimer = (currentUser: User | null, sessionStartTime: number | null) => {
    const [isOnBreak, setIsOnBreak] = useState(false);
    const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
    const [totalBreakTime, setTotalBreakTime] = useState(0);
    const [breakReason, setBreakReason] = useState<string | null>(null);
    const [workTimeSeconds, setWorkTimeSeconds] = useState(0);
    const [currentBreakDuration, setCurrentBreakDuration] = useState(0);
    
    useEffect(() => {
        if (!currentUser) return;
        const tenantId = getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
        fetch('/api/collections/agent_work_states', {
            headers: { 'X-Tenant-ID': tenantId, 'X-User-ID': currentUser.id }
        })
        .then(r => r.ok ? r.json() : null)
        .then((data: any) => {
            if (data && data.data) {
                const s = data.data;
                setIsOnBreak(s.is_on_break);
                setBreakStartTime(s.break_start_time ? new Date(s.break_start_time).getTime() : null);
                setTotalBreakTime(s.total_break_time || 0);
                setBreakReason(s.break_reason || null);
            }
        })
        .catch(console.error);
    }, [currentUser]);

    const syncState = useCallback((state: any) => {
        if (!currentUser) return;
        const tenantId = getStorageItem('nexus_server_id') || currentUser?.serverId || 'srv-001';
        fetch('/api/collections/agent_work_states', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId, 'X-User-ID': currentUser.id },
            body: JSON.stringify(state)
        }).catch(console.error);
    }, [currentUser]);

    const toggleBreak = useCallback((reason?: string) => {
        if (isOnBreak) {
            // End Break
            let newTotal = totalBreakTime;
            if (breakStartTime) {
                const duration = Date.now() - breakStartTime;
                newTotal = totalBreakTime + duration;
                setTotalBreakTime(newTotal);
            }
            
            setBreakStartTime(null);
            setIsOnBreak(false);
            setBreakReason(null);
            setCurrentBreakDuration(0);
            
            syncState({
                is_on_break: false,
                break_start_time: null,
                total_break_time: newTotal,
                break_reason: null
            });
        } else {
            // Start Break
            const now = Date.now();
            setBreakStartTime(now);
            setIsOnBreak(true);
            
            if (reason) {
                setBreakReason(reason);
            }
            
            syncState({
                is_on_break: true,
                break_start_time: now,
                total_break_time: totalBreakTime,
                break_reason: reason || null
            });
        }
    }, [isOnBreak, breakStartTime, totalBreakTime, syncState]);

    const resetTimerState = useCallback(() => {
        setIsOnBreak(false);
        setBreakStartTime(null);
        setTotalBreakTime(0);
        setBreakReason(null);
        setWorkTimeSeconds(0);
        setCurrentBreakDuration(0);
        
        syncState({
            is_on_break: false,
            break_start_time: null,
            total_break_time: 0,
            break_reason: null
        });
    }, [syncState]);

    // Timer Tick (HTML5 Web Worker implementation to bypass aggressive browser-tab sleep sleep-throttling)
    useEffect(() => {
        if (!currentUser || !sessionStartTime) return;

        let worker: Worker | null = null;
        let workerUrl: string | null = null;
        let fallbackInterval: any = null;

        const updateClock = () => {
            const now = Date.now();
            const totalElapsed = now - sessionStartTime;
            const currentBreak = isOnBreak && breakStartTime ? (now - breakStartTime) : 0;
            const actualWork = totalElapsed - totalBreakTime - currentBreak;
            
            const nextSeconds = Math.max(0, Math.floor(actualWork / 1000));
            setWorkTimeSeconds(prev => prev === nextSeconds ? prev : nextSeconds);
        };

        try {
            const workerCode = `
                let intervalId = null;
                self.onmessage = (e) => {
                    if (e.data === 'start') {
                        if (intervalId) clearInterval(intervalId);
                        intervalId = setInterval(() => {
                            self.postMessage('tick');
                        }, 1000);
                    } else if (e.data === 'stop') {
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                        }
                    }
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            workerUrl = URL.createObjectURL(blob);
            worker = new Worker(workerUrl);

            worker.onmessage = () => {
                updateClock();
            };

            worker.postMessage('start');
        } catch (err) {
            console.warn('[WebWorker Timer] Fallback activated due to sandbox sandboxing rules:', err);
            fallbackInterval = setInterval(updateClock, 1000);
        }

        return () => {
            if (worker) {
                worker.postMessage('stop');
                worker.terminate();
            }
            if (workerUrl) {
                URL.revokeObjectURL(workerUrl);
            }
            if (fallbackInterval) {
                clearInterval(fallbackInterval);
            }
        };
    }, [currentUser, sessionStartTime, isOnBreak, breakStartTime, totalBreakTime]);

    // Break Timer Tick (HTML5 Web Worker integration)
    useEffect(() => {
        if (!isOnBreak || !breakStartTime) return;

        let worker: Worker | null = null;
        let workerUrl: string | null = null;
        let fallbackInterval: any = null;

        const updateBreakClock = () => {
            const nextDuration = Date.now() - breakStartTime;
            setCurrentBreakDuration(prev => Math.abs(prev - nextDuration) < 500 ? prev : nextDuration);
        };

        try {
            const workerCode = `
                let intervalId = null;
                self.onmessage = (e) => {
                    if (e.data === 'start') {
                        if (intervalId) clearInterval(intervalId);
                        intervalId = setInterval(() => {
                            self.postMessage('tick');
                        }, 1000);
                    } else if (e.data === 'stop') {
                        if (intervalId) {
                            clearInterval(intervalId);
                            intervalId = null;
                        }
                    }
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            workerUrl = URL.createObjectURL(blob);
            worker = new Worker(workerUrl);

            worker.onmessage = () => {
                updateBreakClock();
            };

            worker.postMessage('start');
        } catch (err) {
            console.warn('[WebWorker Break Timer] Fallback activated:', err);
            fallbackInterval = setInterval(updateBreakClock, 1000);
        }

        return () => {
            if (worker) {
                worker.postMessage('stop');
                worker.terminate();
            }
            if (workerUrl) {
                URL.revokeObjectURL(workerUrl);
            }
            if (fallbackInterval) {
                clearInterval(fallbackInterval);
            }
        };
    }, [isOnBreak, breakStartTime]);

    return {
        isOnBreak,
        breakReason,
        toggleBreak,
        currentBreakDuration,
        workTimeSeconds,
        resetTimerState,
        setTotalBreakTime,
        setBreakStartTime,
        setIsOnBreak
    };
};
